import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { subdomainMiddleware, type SubdomainRequest } from "./subdomain";
import { scoreGifts } from "../client/src/lib/hardened-scoring";
import { giftContent } from "./content/gifts";
import { emailService } from "./services/email";
import { sendEmail } from "./services/email-service";
import { generateChurchWelcomeEmail } from "./services/email-templates";
import { setupSupabaseAuth, isAuthenticated } from "./supabaseAuth";
import {
  requirePermission,
  requireRole,
  requireOwnOrganization,
  requireSuperAdmin,
  requireOrgOwner,
  requireOrgAdmin,
  addUserContext,
  PERMISSIONS
} from "./rbac";
import rateLimit from "express-rate-limit";
import {
  insertResponseSchema,
  insertAnswerSchema,
  insertResultSchema,
  profileCompletionSchema,
  insertOrganizationSchema,
  insertMinistryOpportunitySchema,
  type GiftKey,
  type User,
  type Organization,
  type DashboardMetrics,
} from "@shared/schema";

// Rate limiting
const assessmentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 assessments per hour
  message: "Too many assessment attempts, please try again later.",
});

// Legacy admin check middleware (updated to use new roles)
function requireAdmin(req: any, res: any, next: any) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Get user from storage to check role
  storage.getUser(userId as string).then(user => {
    if (!user || !user.role) {
      return res.status(401).json({ message: "User not found" });
    }
    
    // Check if super admin is using View As functionality
    const viewContext = (req.session as any)?.viewAsContext;
    if (user.role === "SUPER_ADMIN" && viewContext) {
      // Super admin can access admin functions while viewing as any role
      return next();
    }
    
    if (!["SUPER_ADMIN", "ORG_OWNER", "ORG_ADMIN"].includes(user.role)) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  }).catch(() => {
    return res.status(500).json({ message: "Server error" });
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Subdomain detection middleware
  app.use(subdomainMiddleware);
  
  // Auth middleware
  await setupSupabaseAuth(app);

  // Subdomain routes
  const subdomainRoutes = await import('./routes/subdomain');
  app.use(subdomainRoutes.default);

  // Initialize seed data if needed
  let activeVersion = await storage.getActiveAssessmentVersion();
  if (!activeVersion) {
    // Create default assessment version and questions
    activeVersion = await storage.createAssessmentVersion({
      title: "K.I.T. Gifts & Ministry Fit v1",
      isActive: true,
    });

    // Load questions from seed data
    const fs = await import("fs");
    const path = await import("path");
    const seedPath = path.join(process.cwd(), "seeds", "questions.v1.json");

    try {
      const seedData = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
      const questions = seedData.questions.map((q: any, index: number) => ({
        versionId: activeVersion!.id,
        text: q.text,
        giftKey: q.giftKey,
        orderIndex: index,
        isActive: true,
      }));

      await storage.bulkCreateQuestions(questions);
      console.log("Seed data loaded successfully");
    } catch (error) {
      console.error("Could not load seed data:", error);
    }
  }

  // Auth routes
  // Get organization for authenticated user
  app.get('/api/auth/organization', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Super admins can see all organizations, but we need to determine which one to show
      if (user.role === 'SUPER_ADMIN') {
        // Check for view-as context
        const viewContext = (req.session as any).viewAsContext;
        if (viewContext?.viewAsOrganizationId) {
          const organization = await storage.getOrganization(viewContext.viewAsOrganizationId);
          return res.json(organization);
        }
        
        // Default: return the first organization or null
        const organizations = await storage.getOrganizations();
        return res.json(organizations[0] || null);
      }

      // Regular users: return their organization
      if (user.organizationId) {
        const organization = await storage.getOrganization(user.organizationId);
        return res.json(organization);
      }

      res.json(null);
    } catch (error) {
      console.error("Get organization error:", error);
      res.status(500).json({ message: "Failed to get organization" });
    }
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      // Check for view-as context but preserve actual user data
      const viewContext = (req.session as any).viewAsContext;
      if (viewContext && user?.role === 'SUPER_ADMIN') {
        // If viewing a specific organization, get that org's details
        let targetOrganization = null;
        if (viewContext.viewAsOrganizationId) {
          targetOrganization = await storage.getOrganization(viewContext.viewAsOrganizationId);
        }
        
        // Return the actual user data with view context added, not mock data
        const userWithViewContext = {
          ...user, // Preserve all actual user data (including name changes)
          viewContext: {
            isViewingAs: true,
            originalUser: {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
              organizationId: user.organizationId
            },
            viewAsType: viewContext.viewAsType || 'ORG_ADMIN',
            targetOrganization: targetOrganization,
            role: viewContext.viewAsType || 'ORG_ADMIN',
            organizationName: targetOrganization?.name
          }
        };
        
        res.json(userWithViewContext);
        return;
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get user's organization info
  app.get('/api/auth/organization', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      // Check for view-as context for organization switching
      const viewContext = (req.session as any).viewAsContext;
      let targetOrgId = user?.organizationId;
      
      if (viewContext && user?.role === 'SUPER_ADMIN' && viewContext.viewAsOrganizationId) {
        targetOrgId = viewContext.viewAsOrganizationId;
      }
      
      if (!targetOrgId) {
        return res.status(404).json({ message: "User organization not found" });
      }
      
      const organization = await storage.getOrganization(targetOrgId);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }
      
      // Return safe organization info (no sensitive data)
      res.json({
        id: organization.id,
        name: organization.name,
        description: organization.description,
        website: organization.website,
        inviteCode: organization.inviteCode
      });
    } catch (error) {
      console.error("Error fetching user organization:", error);
      res.status(500).json({ message: "Failed to fetch organization" });
    }
  });

  app.post('/api/auth/complete-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = profileCompletionSchema.parse(req.body);
      
      const updatedUser = await storage.completeUserProfile(userId, validatedData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Profile completion error:", error);
      res.status(400).json({ message: "Failed to complete profile" });
    }
  });

  // Super Admin "View As" functionality
  app.post('/api/super-admin/view-as', isAuthenticated, requireSuperAdmin, async (req: any, res) => {
    try {
      const { userType, userId, organizationId } = req.body;
      
      // Store view context in session
      (req.session as any).viewAsContext = {
        originalUserId: req.user.id,
        viewAsType: userType, // 'PARTICIPANT', 'ORG_ADMIN', etc.
        viewAsUserId: userId, // Optional: specific user to view as
        viewAsOrganizationId: organizationId, // Optional: specific organization to view as
        timestamp: new Date()
      };
      
      console.log('Setting view context in session:', {
        sessionId: req.sessionID,
        viewAsContext: (req.session as any).viewAsContext,
        organizationId
      });
      
      res.json({ 
        success: true, 
        viewContext: (req.session as any).viewAsContext,
        message: organizationId ? `Now managing organization` : `Now viewing as ${userType}` 
      });
    } catch (error) {
      console.error("View as error:", error);
      res.status(500).json({ message: "Failed to set view context" });
    }
  });

  app.delete('/api/super-admin/view-as', isAuthenticated, async (req: any, res) => {
    try {
      if ((req.session as any).viewAsContext) {
        delete (req.session as any).viewAsContext;
        
        // Save session after deletion
        req.session.save((err: any) => {
          if (err) {
            console.error('Session save error during clear:', err);
            return res.status(500).json({ message: "Failed to clear session" });
          }
          
          console.log('View context cleared from session:', req.sessionID);
          res.json({ 
            success: true, 
            message: "Returned to admin view" 
          });
        });
      } else {
        res.json({ 
          success: true, 
          message: "Already in admin view" 
        });
      }
    } catch (error) {
      console.error("Clear view context error:", error);
      res.status(500).json({ message: "Failed to clear view context" });
    }
  });

  app.get('/api/super-admin/view-context', isAuthenticated, async (req: any, res) => {
    try {
      // Force session reload to ensure we get the latest data
      req.session.reload((err: any) => {
        if (err) {
          console.error('Session reload error:', err);
          return res.json({ viewContext: null });
        }
        
        const viewContext = (req.session as any)?.viewAsContext || null;
        console.log('View context requested:', { 
          sessionExists: !!req.session,
          viewAsContext: viewContext,
          sessionId: req.sessionID 
        });
        res.json({ viewContext });
      });
    } catch (error) {
      console.error("Get view context error:", error);
      res.status(500).json({ message: "Failed to get view context" });
    }
  });

  // Helper function to generate unique invite codes
  function generateInviteCode(churchName: string): string {
    // Take first letters of each word + random number
    const words = churchName.toUpperCase().replace(/[^A-Z\s]/g, '').split(/\s+/).filter(w => w.length > 0);
    const prefix = words.slice(0, 3).map(w => w[0]).join('');
    const randomSuffix = Math.floor(Math.random() * 9000) + 1000; // 4-digit number
    return `${prefix}${randomSuffix}`;
  }

  // Organization/Church registration routes
  app.post('/api/organizations/register', async (req, res) => {
    try {
      // Check if subdomain is provided and if it already exists
      if (req.body.subdomain && req.body.subdomain.trim()) {
        const existingOrg = await storage.getOrganizationBySubdomain(req.body.subdomain.trim());
        if (existingOrg) {
          return res.status(400).json({ 
            message: `The subdomain "${req.body.subdomain}" is already taken. Please choose a different one or leave it blank.` 
          });
        }
      }

      // Check if user with this email already exists
      const existingUser = await storage.getUserByEmail(req.body.contactEmail);
      if (existingUser) {
        return res.status(400).json({ 
          message: `An account with email "${req.body.contactEmail}" already exists. Please use a different email or sign in with your existing account.` 
        });
      }

      // Generate unique invite code
      let inviteCode: string;
      let attempts = 0;
      do {
        inviteCode = generateInviteCode(req.body.churchName);
        const existingCode = await storage.getOrganizationByInviteCode(inviteCode);
        if (!existingCode) break;
        attempts++;
      } while (attempts < 10);

      if (attempts >= 10) {
        return res.status(500).json({ message: "Failed to generate unique invite code. Please try again." });
      }

      const orgData = {
        name: req.body.churchName,
        subdomain: req.body.subdomain && req.body.subdomain.trim() ? req.body.subdomain.trim() : null,
        inviteCode,
        contactEmail: req.body.contactEmail,
        website: req.body.website,
        address: req.body.address,
        description: req.body.description,
        status: "ACTIVE" as const
      };

      // Validate the data
      const validatedOrgData = insertOrganizationSchema.parse(orgData);
      
      // Create organization
      const organization = await storage.createOrganization(validatedOrgData);
      
      // Don't create user account automatically - let them register through normal auth flow
      // This prevents auto-login issues when testing the registration process
      const ownerData = {
        organizationId: organization.id,
        email: req.body.contactEmail,
        firstName: req.body.contactPersonName.split(' ')[0] || '',
        lastName: req.body.contactPersonName.split(' ').slice(1).join(' ') || '',
        role: "ORG_OWNER" as const,
        profileCompleted: true
      };

      // Store the intended owner info but don't create the user yet
      // They'll be created when they first sign in through Replit Auth

      // Send welcome email to the pastor
      try {
        const emailContent = generateChurchWelcomeEmail({
          churchName: organization.name,
          pastorName: ownerData.firstName + ' ' + ownerData.lastName,
          inviteCode,
          organizationId: organization.id,
          contactEmail: ownerData.email
        });

        await sendEmail({
          to: ownerData.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        });

        console.log(`Welcome email sent to ${ownerData.email} for church ${organization.name}`);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the registration if email fails
      }

      res.json({
        organization,
        ownerInfo: ownerData, // Send the intended owner info
        inviteCode,
        message: "Church registered successfully"
      });
    } catch (error) {
      console.error("Organization registration error:", error);
      
      // Handle specific database constraint errors
      if (error instanceof Error && error.message.includes('duplicate key value')) {
        if (error.message.includes('subdomain')) {
          return res.status(400).json({ 
            message: "This subdomain is already taken. Please choose a different one or leave it blank." 
          });
        }
        if (error.message.includes('email')) {
          return res.status(400).json({ 
            message: "An account with this email already exists. Please use a different email or sign in with your existing account." 
          });
        }
        if (error.message.includes('invite_code')) {
          return res.status(400).json({ 
            message: "Failed to generate unique invite code. Please try again." 
          });
        }
      }
      
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to register church" 
      });
    }
  });

  // Test endpoint to send welcome email
  app.post('/api/test-welcome-email', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email address is required" });
      }

      const emailContent = generateChurchWelcomeEmail({
        churchName: "Sample Community Church",
        pastorName: "Pastor John Smith",
        inviteCode: "SAMPLE123",
        organizationId: "test-org-id",
        contactEmail: email
      });

      const success = await sendEmail({
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      });

      if (success) {
        res.json({ 
          message: "Welcome email sent successfully",
          sentTo: email
        });
      } else {
        res.status(500).json({ 
          message: "Failed to send email. Check server logs for details."
        });
      }
    } catch (error) {
      console.error('Test email error:', error);
      res.status(500).json({ 
        message: "Failed to send test email",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get('/api/organizations/:orgId/join-info', async (req, res) => {
    try {
      const orgId = req.params.orgId;
      const organization = await storage.getOrganization(orgId);
      
      if (!organization) {
        return res.status(404).json({ message: "Church not found" });
      }

      // Return public info for congregation signup
      res.json({
        id: organization.id,
        name: organization.name,
        description: organization.description,
        website: organization.website
      });
    } catch (error) {
      console.error("Get organization info error:", error);
      res.status(500).json({ message: "Failed to get church information" });
    }
  });

  app.get('/api/organizations/lookup/:subdomain', async (req, res) => {
    try {
      const subdomain = req.params.subdomain;
      const organization = await storage.getOrganizationBySubdomain(subdomain);
      
      if (!organization) {
        return res.status(404).json({ message: "Church not found" });
      }

      res.json({
        id: organization.id,
        name: organization.name,
        description: organization.description
      });
    } catch (error) {
      console.error("Organization lookup error:", error);
      res.status(500).json({ message: "Failed to lookup church" });
    }
  });

  app.get('/api/organizations/invite/:inviteCode', async (req, res) => {
    try {
      const inviteCode = req.params.inviteCode.toUpperCase();
      const organization = await storage.getOrganizationByInviteCode(inviteCode);
      
      if (!organization) {
        return res.status(404).json({ message: "Church code not found. Please check the code and try again." });
      }

      res.json({
        id: organization.id,
        name: organization.name,
        description: organization.description,
        inviteCode: organization.inviteCode
      });
    } catch (error) {
      console.error("Invite code lookup error:", error);
      res.status(500).json({ message: "Failed to lookup church by invite code" });
    }
  });

  app.post('/api/congregation/signup', async (req, res) => {
    try {
      // Congregation signup by invite code
      let organizationId: string;
      
      if (req.body.inviteCode) {
        // Join by invite code
        const organization = await storage.getOrganizationByInviteCode(req.body.inviteCode.toUpperCase());
        if (!organization) {
          return res.status(400).json({ message: "Invalid church code. Please check the code and try again." });
        }
        organizationId = organization.id;
      } else if (req.body.organizationId) {
        // Legacy support for direct organization ID (e.g., from /join/[orgId] URLs)
        organizationId = req.body.organizationId;
      } else {
        return res.status(400).json({ message: "Church code is required to join a congregation." });
      }

      const userData = {
        organizationId,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        ageRange: req.body.ageRange,
        role: "PARTICIPANT" as const,
        profileCompleted: true
      };

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(req.body.email);
      if (existingUser) {
        return res.status(400).json({ message: "A user with this email already exists" });
      }

      // Create the user
      const user = await storage.createUser(userData);

      res.json({
        user,
        message: "Successfully joined the congregation"
      });
    } catch (error) {
      console.error("Congregation signup error:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to join congregation" 
      });
    }
  });

  // Assessment routes
  // Public route for assessment questions (no auth required)
  app.get("/api/assessment/questions", async (req, res) => {
    try {
      const activeVersion = await storage.getActiveAssessmentVersion();
      if (!activeVersion) {
        return res.status(404).json({ message: "No active assessment version" });
      }

      const questions = await storage.getQuestionsByVersion(activeVersion.id);
      res.json(questions);
    } catch (error) {
      console.error("Get questions error:", error);
      res.status(500).json({ message: "Failed to get questions" });
    }
  });



  // Authenticated assessment start (for logged-in users)
  app.post(
    "/api/assessment/start",
    assessmentLimiter,
    isAuthenticated,
    async (req: any, res) => {
      try {
        const activeVersion = await storage.getActiveAssessmentVersion();
        if (!activeVersion) {
          return res.status(404).json({ message: "No active assessment" });
        }

        // Get user to extract organization ID
        const user = await storage.getUser(req.user.userId);
        if (!user || !user.organizationId) {
          return res.status(400).json({ message: "User organization not found" });
        }

        const response = await storage.createResponse({
          userId: req.user.userId,
          versionId: activeVersion.id,
          organizationId: user.organizationId,
        });

        res.json(response);
      } catch (error) {
        console.error("Start assessment error:", error);
        res.status(500).json({ message: "Failed to start assessment" });
      }
    }
  );



  // Authenticated assessment submission (for logged-in users)
  app.post(
    "/api/assessment/:responseId/submit",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const { responseId } = req.params;
        const { answers, ageGroups, ministryInterests, naturalAbilities } = req.body;

        // Validate response belongs to user
        const response = await storage.getResponse(responseId);
        if (!response || response.userId !== req.user.userId) {
          return res.status(404).json({ message: "Response not found" });
        }

        if (response.submittedAt) {
          return res.status(400).json({ message: "Assessment already submitted" });
        }

        // Get questions for scoring
        const questions = await storage.getQuestionsByVersion(response.versionId);
        const questionMap = new Map(questions.map((q) => [q.id, q]));

        // Save answers
        const answerData = Object.entries(answers).map(([questionId, value]) => ({
          responseId,
          questionId,
          value: Number(value),
        }));

        await storage.bulkCreateAnswers(answerData);

        // Calculate scores
        const scoreInput = Object.entries(answers).map(([questionId, value]) => {
          const question = questionMap.get(questionId);
          return {
            questionId,
            giftKey: question!.giftKey as GiftKey,
            value: Number(value),
          };
        });

        const scores = scoreGifts(scoreInput);

        // Save results with 90-day expiration
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 90);
        
        // Get user to extract organization ID for result
        const user = await storage.getUser(req.user.userId);
        if (!user || !user.organizationId) {
          return res.status(400).json({ message: "User organization not found" });
        }

        console.log('Creating result for responseId:', responseId);
        const result = await storage.createResult({
          responseId,
          organizationId: user.organizationId,
          scoresJson: scores.totals,
          top1GiftKey: scores.top3[0],
          top2GiftKey: scores.top3[1],
          top3GiftKey: scores.top3[2],
          ageGroups: ageGroups || [],
          ministryInterests: ministryInterests || [],
          naturalAbilities: naturalAbilities || [],
          renderedHtml: null,
          expiresAt: expirationDate,
        });
        console.log('Result created with ID:', result.id, 'for responseId:', result.responseId);

        // Update response as submitted
        await storage.updateResponseSubmission(responseId);

        // Send email with results
        try {
          const user = await storage.getUser(req.user.userId);
          if (user?.email) {
            await emailService.sendAssessmentResults(
              user.email,
              user.firstName || user.email || "Friend",
              {
                top1Gift: giftContent[scores.top3[0]].name,
                top2Gift: giftContent[scores.top3[1]].name,
                top3Gift: giftContent[scores.top3[2]].name,
                detailedResults: `
                  <h3>Your Spiritual Gift Results:</h3>
                  <p>God has uniquely equipped you with these spiritual gifts to serve His Kingdom effectively.</p>
                  <p>Your top gift, <strong>${giftContent[scores.top3[0]].name}</strong>, shows that ${giftContent[scores.top3[0]].definition}</p>
                  <p>We encourage you to explore ministry opportunities that align with these gifts!</p>
                `,
              }
            );
          }
        } catch (emailError) {
          console.error("Email sending failed:", emailError);
          // Don't fail the request if email fails
        }

        res.json(result);
      } catch (error) {
        console.error("Submit assessment error:", error);
        res.status(500).json({ message: "Failed to submit assessment" });
      }
    }
  );

  // My Results - authenticated user's own results
  app.get("/api/my-results", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get all user's responses and their results
      const userResults = await storage.getUserResults(userId);
      
      const now = new Date();
      
      // Process each result to add gift content and expiration info
      const enhancedResults = userResults.map(result => {
        const isExpired = result.expiresAt && now > result.expiresAt;
        const daysUntilExpiration = result.expiresAt 
          ? Math.ceil((result.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null;

        return {
          id: result.id,
          responseId: result.responseId,
          createdAt: result.createdAt,
          expiresAt: result.expiresAt,
          isExpired,
          daysUntilExpiration,
          isNearExpiration: daysUntilExpiration !== null && daysUntilExpiration <= 30,
          isVeryNearExpiration: daysUntilExpiration !== null && daysUntilExpiration <= 7,
          ageGroups: result.ageGroups,
          ministryInterests: result.ministryInterests,
          gifts: {
            top1: {
              key: result.top1GiftKey,
              score: (result.scoresJson as any)[result.top1GiftKey],
              ...giftContent[result.top1GiftKey],
            },
            top2: {
              key: result.top2GiftKey,
              score: (result.scoresJson as any)[result.top2GiftKey],
              ...giftContent[result.top2GiftKey],
            },
            top3: {
              key: result.top3GiftKey,
              score: (result.scoresJson as any)[result.top3GiftKey],
              ...giftContent[result.top3GiftKey],
            },
          },
        };
      });

      res.json(enhancedResults);
    } catch (error) {
      console.error("Get user results error:", error);
      res.status(500).json({ message: "Failed to get your results" });
    }
  });

  app.get("/api/results/:responseId", async (req: any, res) => {
    try {
      const { responseId } = req.params;
      console.log('Fetching results for responseId:', responseId);

      const result = await storage.getResultByResponse(responseId);
      console.log('Result lookup result:', result ? `Found result with ID ${result.id}` : 'No result found');
      if (!result) {
        return res.status(404).json({ message: "Results not found" });
      }

      // Check if results have expired
      const now = new Date();
      const isExpired = result.expiresAt && now > result.expiresAt;
      
      if (isExpired) {
        return res.status(410).json({ 
          message: "Results have expired",
          expiredAt: result.expiresAt
        });
      }

      // Calculate days until expiration for warnings
      const daysUntilExpiration = result.expiresAt 
        ? Math.ceil((result.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      // Get user information for the results
      const response = await storage.getResponse(result.responseId);
      const user = response ? await storage.getUser(response.userId) : null;

      // Enhance results with gift content, expiration info, and user data
      const enhancedResult = {
        ...result,
        daysUntilExpiration,
        isNearExpiration: daysUntilExpiration !== null && daysUntilExpiration <= 30,
        isVeryNearExpiration: daysUntilExpiration !== null && daysUntilExpiration <= 7,
        user: user ? {
          name: user.firstName || user.email || "User",
          email: user.email
        } : null,
        gifts: {
          top1: {
            key: result.top1GiftKey,
            score: (result.scoresJson as any)[result.top1GiftKey],
            ...giftContent[result.top1GiftKey],
          },
          top2: {
            key: result.top2GiftKey,
            score: (result.scoresJson as any)[result.top2GiftKey],
            ...giftContent[result.top2GiftKey],
          },
          top3: {
            key: result.top3GiftKey,
            score: (result.scoresJson as any)[result.top3GiftKey],
            ...giftContent[result.top3GiftKey],
          },
        },
      };

      res.json(enhancedResult);
    } catch (error) {
      console.error("Get results error:", error);
      res.status(500).json({ message: "Failed to get results" });
    }
  });

  // Organization Management Routes
  app.get("/api/organizations", isAuthenticated, requireSuperAdmin, async (req, res) => {
    try {
      const organizations = await storage.getOrganizations();
      res.json(organizations);
    } catch (error) {
      console.error("Get organizations error:", error);
      res.status(500).json({ message: "Failed to get organizations" });
    }
  });

  app.post("/api/organizations", isAuthenticated, requireSuperAdmin, async (req, res) => {
    try {
      const orgData = insertOrganizationSchema.parse(req.body);
      const organization = await storage.createOrganization(orgData);
      res.status(201).json(organization);
    } catch (error) {
      console.error("Create organization error:", error);
      res.status(500).json({ message: "Failed to create organization" });
    }
  });

  // Consolidated organization update route (for both super admin and church admin)
  app.put("/api/organizations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Check if user can update this organization
      const organizationId = req.params.id;
      const isSuperAdmin = user.role === 'SUPER_ADMIN';
      const isOrgOwnerOrAdmin = user.role && ['ORG_OWNER', 'ORG_ADMIN'].includes(user.role) && user.organizationId === organizationId;
      
      if (!isSuperAdmin && !isOrgOwnerOrAdmin) {
        return res.status(403).json({ message: "Insufficient permissions to update this organization" });
      }
      
      // Parse and validate updates
      const allowedFields = isSuperAdmin ? 
        insertOrganizationSchema.partial().parse(req.body) :
        insertOrganizationSchema.pick({ name: true, description: true, website: true, address: true }).partial().parse(req.body);
      
      const organization = await storage.updateOrganization(organizationId, allowedFields);
      res.json(organization);
    } catch (error) {
      console.error("Update organization profile error:", error);
      res.status(500).json({ message: "Failed to update organization profile" });
    }
  });

  // Church Admin Dashboard Routes
  app.get("/api/admin/dashboard/metrics", isAuthenticated, addUserContext(), requireOrgAdmin, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      let organizationId: string;
      
      // Check for view-as context first
      const viewContext = (req.session as any).viewAsContext;
      if (viewContext && viewContext.viewAsOrganizationId) {
        organizationId = viewContext.viewAsOrganizationId;
      } else {
        const user = await storage.getUser(userId);
        if (!user?.organizationId) {
          return res.status(400).json({ message: "User organization not found" });
        }
        organizationId = user.organizationId;
      }
      
      const metrics = await storage.getDashboardMetrics(organizationId);
      res.json(metrics);
    } catch (error) {
      console.error("Get dashboard metrics error:", error);
      res.status(500).json({ message: "Failed to get dashboard metrics" });
    }
  });

  app.get("/api/admin/dashboard/users", isAuthenticated, addUserContext(), requireOrgAdmin, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      let organizationId: string;
      
      // Check for view-as context first
      const viewContext = (req.session as any).viewAsContext;
      if (viewContext && viewContext.viewAsOrganizationId) {
        organizationId = viewContext.viewAsOrganizationId;
        console.log(`Dashboard Users - Using View As context - orgId: ${organizationId}`);
      } else {
        const user = await storage.getUser(userId);
        if (!user?.organizationId) {
          return res.status(400).json({ message: "User organization not found" });
        }
        organizationId = user.organizationId;
        console.log(`Dashboard Users - Using user orgId: ${organizationId} for user: ${userId}`);
      }
      
      const filters = {
        dateRange: req.query.startDate && req.query.endDate ? {
          start: new Date(req.query.startDate as string),
          end: new Date(req.query.endDate as string)
        } : undefined,
        ageRange: req.query.ageRange as any,
        giftKey: req.query.giftKey as any
      };
      
      const users = await storage.getUsersByOrganization(organizationId, filters);
      console.log(`Dashboard Users - Found ${users.length} users for org ${organizationId}`);
      res.json(users);
    } catch (error) {
      console.error("Get organization users error:", error);
      res.status(500).json({ message: "Failed to get organization users" });
    }
  });

  app.get("/api/admin/dashboard/results", isAuthenticated, addUserContext(), requireOrgAdmin, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      let organizationId: string;
      
      // Check for view-as context first
      const viewContext = (req.session as any).viewAsContext;
      if (viewContext && viewContext.viewAsOrganizationId) {
        organizationId = viewContext.viewAsOrganizationId;
      } else {
        const user = await storage.getUser(userId);
        if (!user?.organizationId) {
          return res.status(400).json({ message: "User organization not found" });
        }
        organizationId = user.organizationId;
      }
      
      const filters = {
        dateRange: req.query.startDate && req.query.endDate ? {
          start: new Date(req.query.startDate as string),
          end: new Date(req.query.endDate as string)
        } : undefined,
        giftKey: req.query.giftKey as any
      };
      
      const results = await storage.getResultsByOrganization(organizationId, filters);
      res.json(results);
    } catch (error) {
      console.error("Get organization results error:", error);
      res.status(500).json({ message: "Failed to get organization results" });
    }
  });

  // Super Admin Global Dashboard Routes
  app.get("/api/super-admin/global-metrics", isAuthenticated, requireSuperAdmin, async (req, res) => {
    try {
      const metrics = await storage.getGlobalMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Get global metrics error:", error);
      res.status(500).json({ message: "Failed to get global metrics" });
    }
  });

  // Super Admin single organization detail endpoint
  app.get("/api/super-admin/organizations/:orgId", isAuthenticated, requireSuperAdmin, async (req, res) => {
    try {
      const { orgId } = req.params;
      const organization = await storage.getOrganization(orgId);
      
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      // Get stats for the organization
      const metrics = await storage.getDashboardMetrics(orgId);
      const totalUsers = await storage.getUserCountByOrganization(orgId);
      
      const orgDetail = {
        ...organization,
        totalUsers,
        totalAssessments: metrics.totalCompletions || 0,
        activeUsers: totalUsers, // For now, assume all users are active
        completionRate: totalUsers > 0 ? Math.round((metrics.totalCompletions / totalUsers) * 100) : 0
      };
      
      res.json(orgDetail);
    } catch (error) {
      console.error("Get organization detail error:", error);
      res.status(500).json({ message: "Failed to get organization details" });
    }
  });

  // Super Admin organization members endpoint
  app.get("/api/super-admin/organizations/:orgId/members", isAuthenticated, requireSuperAdmin, async (req, res) => {
    try {
      const { orgId } = req.params;
      
      // Verify organization exists
      const organization = await storage.getOrganization(orgId);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      // Get all users for this organization
      const users = await storage.getUsersByOrganization(orgId);
      
      // Get assessment results for each user
      const membersWithAssessments = await Promise.all(
        users.map(async (user) => {
          const results = await storage.getUserResults(user.id);
          const latestResult = results?.[0]; // Most recent result
          
          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role || 'MEMBER',
            status: 'ACTIVE', // For now, all users are active
            hasCompletedAssessment: !!latestResult,
            assessmentDate: latestResult?.createdAt,
            topGifts: latestResult ? [
              latestResult.top1GiftKey,
              latestResult.top2GiftKey,
              latestResult.top3GiftKey
            ].filter(Boolean) : [],
            joinedAt: user.createdAt,
            lastActive: user.updatedAt
          };
        })
      );

      res.json(membersWithAssessments);
    } catch (error) {
      console.error("Get organization members error:", error);
      res.status(500).json({ message: "Failed to get organization members" });
    }
  });

  // Church Overview API endpoint
  app.get("/api/church-overview/:orgId", isAuthenticated, async (req, res) => {
    try {
      const { orgId } = req.params;
      const user = req.user as User;
      
      // Verify access permissions
      if (!orgId) {
        return res.status(400).json({ message: "Organization ID is required" });
      }
      const organization = await storage.getOrganization(orgId);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      // Check if user has access to this organization
      // SUPER_ADMIN can access any organization
      // Other roles can only access their own organization
      const isSuperAdmin = user.role === 'SUPER_ADMIN';
      const isOrgMember = user.organizationId === orgId && user.role && ['ORG_ADMIN', 'ORG_OWNER', 'ORG_LEADER'].includes(user.role);
      const hasAccess = isSuperAdmin || isOrgMember;
      
      console.log('Church overview access check:', { 
        user: user,
        userRole: user.role, 
        userOrgId: user.organizationId, 
        requestedOrgId: orgId,
        isSuperAdmin,
        isOrgMember,
        hasAccess
      });
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get comprehensive church metrics
      const metrics = await storage.getDashboardMetrics(orgId);
      const allUsers = await storage.getUsersByOrganization(orgId);
      const responses = await storage.getResponsesByOrganization(orgId);
      
      // Calculate member stats
      const totalMembers = allUsers.length;
      const activeMembers = allUsers.filter(u => u.totalAssessments > 0).length;
      const pendingAssessments = totalMembers - metrics.totalCompletions;
      const completionRate = totalMembers > 0 ? Math.round((metrics.totalCompletions / totalMembers) * 100) : 0;

      // Get top gifts with labels
      const topGifts = Object.entries(metrics.topGiftDistribution || {})
        .map(([gift, count]) => ({
          gift,
          giftLabel: gift.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          count,
          percentage: totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      // Get age distribution from all users (not just assessment completions)
      const ageGroupCounts: Record<string, number> = {};
      allUsers.forEach(user => {
        if (user.ageRange) {
          ageGroupCounts[user.ageRange] = (ageGroupCounts[user.ageRange] || 0) + 1;
        }
      });

      const ageDistribution = Object.entries(ageGroupCounts)
        .map(([ageRange, count]) => ({
          ageRange,
          count,
          percentage: totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count);

      // Generate recent activity from responses
      const recentActivity = responses
        .filter(r => r.submittedAt)
        .sort((a, b) => new Date(b.submittedAt!).getTime() - new Date(a.submittedAt!).getTime())
        .slice(0, 10)
        .map(response => {
          const user = allUsers.find(u => u.id === response.userId);
          return {
            type: 'Assessment Completed',
            description: user 
              ? `${user.firstName} ${user.lastName} completed their spiritual gifts assessment`
              : 'A member completed their spiritual gifts assessment',
            timestamp: response.submittedAt!,
            userName: user ? `${user.firstName} ${user.lastName}` : undefined
          };
        });

      const churchMetrics = {
        totalMembers,
        activeMembers,
        totalAssessments: metrics.totalCompletions,
        completionRate,
        completionsLast30Days: metrics.completionsLast30Days,
        averageTimeMinutes: metrics.averageTimeMinutes,
        pendingAssessments,
        topGifts,
        ageDistribution,
        recentActivity,
        ministryOpportunities: 0, // TODO: Implement ministry opportunities count
        placementMatches: 0, // TODO: Implement placement matches count
        availableVolunteers: activeMembers
      };

      res.json(churchMetrics);
    } catch (error) {
      console.error("Church overview error:", error);
      res.status(500).json({ message: "Failed to get church overview" });
    }
  });

  // Platform Overview API endpoint for Super Admin
  app.get("/api/platform-overview", isAuthenticated, requireSuperAdmin, async (req, res) => {
    try {
      // Get all organizations
      const allOrganizations = await storage.getOrganizations();
      const totalChurches = allOrganizations.length;
      
      // Get platform-wide user metrics
      let totalMembers = 0;
      let activeUsers = 0;
      let globalAssessments = 0;
      let globalCompletions = 0;
      let recentActivity = [];
      
      for (const org of allOrganizations) {
        const orgUsers = await storage.getUsersByOrganization(org.id);
        const orgMetrics = await storage.getDashboardMetrics(org.id);
        const orgResponses = await storage.getResponsesByOrganization(org.id);
        
        totalMembers += orgUsers.length;
        activeUsers += orgUsers.filter(u => u.totalAssessments > 0).length;
        globalAssessments += orgResponses.length;
        globalCompletions += orgMetrics.totalCompletions;
        
        // Add recent activity from this org
        const orgActivity = orgResponses
          .filter(r => r.submittedAt)
          .sort((a, b) => new Date(b.submittedAt!).getTime() - new Date(a.submittedAt!).getTime())
          .slice(0, 5)
          .map(response => {
            const user = orgUsers.find(u => u.id === response.userId);
            return {
              type: 'Assessment Completed',
              description: user 
                ? `${user.firstName} ${user.lastName} completed assessment at ${org.name}`
                : `Member completed assessment at ${org.name}`,
              timestamp: response.submittedAt!,
              userName: user ? `${user.firstName} ${user.lastName}` : undefined,
              organizationName: org.name
            };
          });
        recentActivity.push(...orgActivity);
      }
      
      // Sort and limit recent activity
      recentActivity = recentActivity
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 20);
      
      // Calculate growth metrics (mock for now - would need historical data)
      const churchGrowthRate = 8; // Mock 8% growth
      const memberGrowthRate = 12; // Mock 12% growth
      
      // Calculate completion rate
      const globalCompletionRate = totalMembers > 0 ? Math.round((globalCompletions / totalMembers) * 100) : 0;
      
      // Mock system alerts (would be from monitoring system)
      const systemAlerts = [
        {
          type: 'Integration',
          severity: 'warning',
          message: 'Email service experiencing delays',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'Performance',
          severity: 'info',
          message: 'Database query optimization complete',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      // Mock pending approvals (would be from various approval queues)
      const pendingApprovals = {
        newChurches: 2,
        featureRequests: 5,
        supportTickets: 8
      };
      
      const platformMetrics = {
        // Core platform metrics
        totalChurches,
        churchGrowthRate,
        totalMembers,
        memberGrowthRate,
        activeUsers,
        activeUsersLast30Days: Math.round(activeUsers * 0.8), // Mock 80% active in last 30 days
        
        // Assessment metrics
        globalAssessments,
        globalCompletions,
        globalCompletionRate,
        pendingAssessments: globalAssessments - globalCompletions,
        
        // System oversight
        systemAlerts,
        pendingApprovals,
        
        // Activity feed
        recentActivity,
        
        // Top performing churches (mock)
        topChurches: allOrganizations
          .map(org => ({
            name: org.name,
            subdomain: org.subdomain,
            memberCount: Math.floor(Math.random() * 200) + 50, // Mock data
            completionRate: Math.floor(Math.random() * 40) + 60 // Mock 60-100%
          }))
          .sort((a, b) => b.completionRate - a.completionRate)
          .slice(0, 5)
      };
      
      res.json(platformMetrics);
    } catch (error) {
      console.error("Platform overview error:", error);
      res.status(500).json({ message: "Failed to get platform overview" });
    }
  });

  // Super Admin organization update endpoint
  app.patch("/api/super-admin/organizations/:orgId", isAuthenticated, requireSuperAdmin, async (req, res) => {
    try {
      const { orgId } = req.params;
      const updates = req.body;
      
      // Validate the organization exists
      const organization = await storage.getOrganization(orgId);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      // Update the organization
      const updatedOrganization = await storage.updateOrganization(orgId, updates);
      res.json(updatedOrganization);
    } catch (error) {
      console.error("Update organization error:", error);
      res.status(500).json({ message: "Failed to update organization" });
    }
  });

  // Super Admin Organizations endpoint - lists all organizations with stats for admin management  
  app.get("/api/super-admin/organizations", isAuthenticated, requireSuperAdmin, async (req, res) => {
    try {
      const organizations = await storage.getOrganizations();
      
      // Get stats for each organization
      const orgStats = await Promise.all(
        organizations.map(async (org) => {
          const metrics = await storage.getDashboardMetrics(org.id);
          const totalUsers = await storage.getUserCountByOrganization(org.id);
          
          return {
            id: org.id,
            name: org.name,
            contactEmail: org.contactEmail,
            phone: org.address || "",
            address: org.address || "",
            memberCount: totalUsers,
            completedAssessments: metrics.totalCompletions || 0,
            status: org.status,
            createdAt: org.createdAt
          };
        })
      );
      
      res.json(orgStats);
    } catch (error) {
      console.error("Super admin organizations error:", error);
      res.status(500).json({ message: "Failed to fetch organizations" });
    }
  });

  app.get("/api/super-admin/organizations/overview", isAuthenticated, requireSuperAdmin, async (req, res) => {
    try {
      const organizations = await storage.getOrganizations();
      const orgOverviews = await Promise.all(
        organizations.map(async (org) => {
          const metrics = await storage.getDashboardMetrics(org.id);
          return {
            ...org,
            metrics
          };
        })
      );
      res.json(orgOverviews);
    } catch (error) {
      console.error("Get organization overviews error:", error);
      res.status(500).json({ message: "Failed to get organization overviews" });
    }
  });

  // Deactivate/reactivate organization
  app.patch('/api/super-admin/organizations/:orgId/status', isAuthenticated, requireSuperAdmin, async (req: any, res) => {
    try {
      const { orgId } = req.params;
      const { status } = req.body;
      
      if (!['ACTIVE', 'INACTIVE'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be ACTIVE or INACTIVE" });
      }

      const updatedOrg = await storage.updateOrganizationStatus(orgId, status);
      res.json({ 
        success: true, 
        organization: updatedOrg,
        message: `Organization ${status.toLowerCase()} successfully` 
      });
    } catch (error) {
      console.error("Update organization status error:", error);
      res.status(500).json({ message: "Failed to update organization status" });
    }
  });

  // Delete organization permanently
  app.delete('/api/super-admin/organizations/:orgId', isAuthenticated, requireSuperAdmin, async (req: any, res) => {
    try {
      const { orgId } = req.params;
      
      // Prevent deletion of default organization
      if (orgId === 'default-org-001') {
        return res.status(400).json({ message: "Cannot delete the default organization" });
      }

      await storage.deleteOrganization(orgId);
      res.json({ 
        success: true, 
        message: "Organization deleted successfully" 
      });
    } catch (error) {
      console.error("Delete organization error:", error);
      res.status(500).json({ message: "Failed to delete organization" });
    }
  });

  // User Role Management
  app.put("/api/admin/users/:userId/role", isAuthenticated, requireOrgOwner, async (req, res) => {
    try {
      const { role } = req.body;
      const user = await storage.updateUserRole(req.params.userId, role);
      res.json(user);
    } catch (error) {
      console.error("Update user role error:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Ministry Opportunities Management
  // Ministry opportunities - accessible to ORG_LEADER and above
  app.get("/api/ministry-opportunities/:orgId?", isAuthenticated, addUserContext(), requirePermission(PERMISSIONS.PLACEMENTS_VIEW), async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      let organizationId: string;
      
      // Check for view-as context first
      const viewContext = (req.session as any).viewAsContext;
      if (viewContext && viewContext.viewAsOrganizationId) {
        organizationId = viewContext.viewAsOrganizationId;
      } else {
        const user = await storage.getUser(userId);
        if (!user?.organizationId) {
          return res.status(400).json({ message: "User organization not found" });
        }
        organizationId = user.organizationId;
      }
      
      const opportunities = await storage.getMinistryOpportunities(organizationId);
      res.json(opportunities);
    } catch (error) {
      console.error("Get ministry opportunities error:", error);
      res.status(500).json({ message: "Failed to get ministry opportunities" });
    }
  });

  app.post("/api/ministry-opportunities", isAuthenticated, addUserContext(), requirePermission(PERMISSIONS.PLACEMENTS_MANAGE), async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      let organizationId: string;
      
      // Check for view-as context first
      const viewContext = (req.session as any).viewAsContext;
      if (viewContext && viewContext.viewAsOrganizationId) {
        organizationId = viewContext.viewAsOrganizationId;
      } else {
        const user = await storage.getUser(userId);
        if (!user?.organizationId) {
          return res.status(400).json({ message: "User organization not found" });
        }
        organizationId = user.organizationId;
      }
      
      const opportunityData = insertMinistryOpportunitySchema.parse({
        ...req.body,
        organizationId
      });
      
      const opportunity = await storage.createMinistryOpportunity(opportunityData);
      res.status(201).json(opportunity);
    } catch (error) {
      console.error("Create ministry opportunity error:", error);
      res.status(500).json({ message: "Failed to create ministry opportunity" });
    }
  });

  // Smart Matching System - Get recommended matches for an opportunity
  app.get("/api/ministry-opportunities/:opportunityId/matches", isAuthenticated, addUserContext(), requirePermission(PERMISSIONS.PLACEMENTS_VIEW), async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const opportunityId = req.params.opportunityId;
      const opportunity = await storage.getMinistryOpportunity(opportunityId);
      
      if (!opportunity) {
        return res.status(404).json({ message: "Opportunity not found" });
      }

      // Get all users in the organization with assessment results
      const users = await storage.getUsersByOrganization(opportunity.organizationId);
      const matches = [];

      for (const user of users) {
        const results = await storage.getUserResults(user.id);
        if (results.length === 0) continue; // Skip users without assessments

        const latestResult = results[0]; // Most recent result
        let matchScore = 0;
        const reasons = [];

        // Calculate match based on required gifts
        if (opportunity.requiredGifts && opportunity.requiredGifts.length > 0) {
          const userGifts = [
            latestResult.top1GiftKey,
            latestResult.top2GiftKey,
            latestResult.top3GiftKey
          ].filter(Boolean);

          const matchingRequiredGifts = opportunity.requiredGifts.filter(gift => 
            userGifts.includes(gift as any)
          );

          if (matchingRequiredGifts.length > 0) {
            matchScore += (matchingRequiredGifts.length / opportunity.requiredGifts.length) * 60;
            reasons.push(`Has ${matchingRequiredGifts.length} of ${opportunity.requiredGifts.length} required spiritual gifts`);
          } else if (opportunity.requiredGifts.length > 0) {
            // If no required gifts match, low score
            matchScore += 10;
          }
        }

        // Bonus points for preferred gifts
        if (opportunity.preferredGifts && opportunity.preferredGifts.length > 0) {
          const userGifts = [
            latestResult.top1GiftKey,
            latestResult.top2GiftKey,
            latestResult.top3GiftKey
          ].filter(Boolean);

          const matchingPreferredGifts = opportunity.preferredGifts.filter(gift => 
            userGifts.includes(gift as any)
          );

          if (matchingPreferredGifts.length > 0) {
            matchScore += (matchingPreferredGifts.length / opportunity.preferredGifts.length) * 20;
            reasons.push(`Has ${matchingPreferredGifts.length} preferred spiritual gifts`);
          }
        }

        // Bonus for natural abilities match
        if (opportunity.preferredAbilities && opportunity.preferredAbilities.length > 0 && latestResult.naturalAbilities) {
          const userAbilities = latestResult.naturalAbilities as string[];
          const matchingAbilities = opportunity.preferredAbilities.filter(ability => 
            userAbilities.includes(ability)
          );

          if (matchingAbilities.length > 0) {
            matchScore += (matchingAbilities.length / opportunity.preferredAbilities.length) * 20;
            reasons.push(`Has ${matchingAbilities.length} matching natural abilities`);
          }
        }

        // Only include matches with reasonable scores
        if (matchScore >= 30) {
          matches.push({
            user,
            result: latestResult,
            opportunity,
            matchScore: Math.round(matchScore),
            reasons
          });
        }
      }

      // Sort by match score (highest first)
      matches.sort((a, b) => b.matchScore - a.matchScore);

      res.json(matches);
    } catch (error) {
      console.error("Get opportunity matches error:", error);
      res.status(500).json({ message: "Failed to get matches" });
    }
  });

  // Get admin ministry opportunities (legacy endpoint)
  app.get("/api/admin/ministry-opportunities", isAuthenticated, addUserContext(), requireOrgAdmin, async (req, res) => {
    // Redirect to new endpoint
    const userId = (req.user as any)?.claims?.sub;
    const user = await storage.getUser(userId);
    if (user?.organizationId) {
      const opportunities = await storage.getMinistryOpportunities(user.organizationId);
      res.json(opportunities);
    } else {
      res.status(400).json({ message: "User organization not found" });
    }
  });

  app.put("/api/admin/ministry-opportunities/:id", isAuthenticated, requireOrgAdmin, async (req, res) => {
    try {
      const updates = insertMinistryOpportunitySchema.partial().parse(req.body);
      const opportunity = await storage.updateMinistryOpportunity(req.params.id, updates);
      res.json(opportunity);
    } catch (error) {
      console.error("Update ministry opportunity error:", error);
      res.status(500).json({ message: "Failed to update ministry opportunity" });
    }
  });

  // Individual Result Management
  app.put("/api/admin/results/:id/notes", isAuthenticated, requireOrgAdmin, async (req, res) => {
    try {
      const { notes, followUpDate } = req.body;
      const result = await storage.updateResultNotes(
        req.params.id, 
        notes, 
        followUpDate ? new Date(followUpDate) : undefined
      );
      res.json(result);
    } catch (error) {
      console.error("Update result notes error:", error);
      res.status(500).json({ message: "Failed to update result notes" });
    }
  });

  // Legacy Admin routes (updated to use new roles)
  app.get(
    "/api/admin/stats",
    isAuthenticated,
    requireAdmin,
    async (req, res) => {
      try {
        const stats = await storage.getAssessmentStats();
        const giftDistribution = await storage.getGiftDistribution();

        res.json({
          ...stats,
          giftDistribution,
        });
      } catch (error) {
        console.error("Get admin stats error:", error);
        res.status(500).json({ message: "Failed to get statistics" });
      }
    }
  );

  app.get(
    "/api/admin/responses",
    isAuthenticated,
    requireAdmin,
    async (req, res) => {
      try {
        const responses = await storage.getAllResponses();
        const results = await storage.getAllResults();

        // Combine responses with results and user data
        const responseMap = new Map(responses.map((r) => [r.id, r]));
        const resultData = [];

        for (const result of results) {
          const response = responseMap.get(result.responseId);
          if (response) {
            const user = await storage.getUser(response.userId);
            resultData.push({
              id: result.id,
              user: {
                id: user?.id,
                name: user?.firstName || user?.email,
                email: user?.email,
              },
              response: {
                startedAt: response.startedAt,
                submittedAt: response.submittedAt,
              },
              topGift: giftContent[result.top1GiftKey].shortName,
              ageGroups: result.ageGroups,
              ministryInterests: result.ministryInterests,
              scores: result.scoresJson,
            });
          }
        }

        res.json(resultData);
      } catch (error) {
        console.error("Get admin responses error:", error);
        res.status(500).json({ message: "Failed to get responses" });
      }
    }
  );

  app.get(
    "/api/admin/export",
    isAuthenticated,
    requireAdmin,
    async (req, res) => {
      try {
        const responses = await storage.getAllResponses();
        const results = await storage.getAllResults();

        // Create CSV data
        const csvRows = ["Name,Email,Date Completed,Top Gift,Second Gift,Third Gift,Age Groups,Ministry Interests,All Scores"];

        for (const result of results) {
          const response = responses.find((r) => r.id === result.responseId);
          if (response?.submittedAt) {
            const user = await storage.getUser(response.userId);
            const scores = result.scoresJson as Record<GiftKey, number>;
            const allScoresStr = Object.entries(scores)
              .map(([key, value]) => `${key}:${value}`)
              .join(";");

            csvRows.push([
              `"${user?.firstName || user?.email || ""}"`,
              `"${user?.email || ""}"`,
              `"${response.submittedAt.toISOString()}"`,
              `"${giftContent[result.top1GiftKey].shortName}"`,
              `"${giftContent[result.top2GiftKey].shortName}"`,
              `"${giftContent[result.top3GiftKey].shortName}"`,
              `"${(result.ageGroups || []).join(", ")}"`,
              `"${(result.ministryInterests || []).join(", ")}"`,
              `"${allScoresStr}"`,
            ].join(","));
          }
        }

        const csvContent = csvRows.join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=assessment-results.csv");
        res.send(csvContent);
      } catch (error) {
        console.error("Export CSV error:", error);
        res.status(500).json({ message: "Failed to export data" });
      }
    }
  );

  // Dashboard endpoint for Connect-style personalized dashboard
  app.get("/api/dashboard", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get user's assessment results
      const results = await storage.getUserResults(userId);
      const hasCompletedAssessment = results.length > 0;
      const latestResult = results[0];

      // Determine primary CTA
      let primaryCta;
      if (!user.profileCompleted) {
        primaryCta = {
          type: 'complete_profile',
          title: 'Complete Your Profile',
          description: 'Help us personalize your experience with a few details.',
          action: 'Complete Profile'
        };
      } else if (!hasCompletedAssessment) {
        primaryCta = {
          type: 'take_assessment',
          title: 'Discover Your Spiritual Gifts',
          description: 'Take our comprehensive assessment to unlock personalized ministry opportunities.',
          action: 'Take Assessment'
        };
      } else {
        primaryCta = {
          type: 'view_gifts',
          title: 'Your Spiritual Gifts Profile',
          description: `Your top gifts: ${latestResult.top1GiftKey}, ${latestResult.top2GiftKey}, ${latestResult.top3GiftKey}`,
          action: 'Explore Opportunities'
        };
      }

      // Get serve highlights (mock data for now - will implement matching algorithm)
      const serveHighlights = hasCompletedAssessment ? [
        {
          id: 'serve-1',
          title: 'Small Group Leader',
          ministry: 'Adult Ministries',
          matchScore: 92,
          requiredGifts: ['Teaching', 'Shepherding']
        },
        {
          id: 'serve-2', 
          title: 'Worship Team Vocalist',
          ministry: 'Worship Arts',
          matchScore: 87,
          requiredGifts: ['Faith', 'Service']
        }
      ] : [];

      // Get upcoming events (mock data - will implement real events)
      const upcomingEvents = [
        {
          id: 'event-1',
          title: 'Sunday Worship Service',
          startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          location: 'Main Sanctuary',
          isVirtual: false,
          rsvpStatus: null,
          isRegistered: false
        },
        {
          id: 'event-2',
          title: 'Small Group Training',
          startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
          location: null,
          isVirtual: true,
          rsvpStatus: 'interested',
          isRegistered: true
        }
      ];

      // Mock giving data
      const givingCard = {
        lastGift: {
          amount: 50,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // Last week
        },
        recurringSetup: false
      };

      // Mock Connect teaser posts
      const connectTeaser = [
        {
          id: 'post-1',
          type: 'testimony',
          author: {
            name: 'Sarah Johnson',
            avatar: null
          },
          body: 'God showed up in such a powerful way during our small group this week. Grateful for this community!',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          reactionCounts: {
            heart: 12,
            pray: 5
          }
        },
        {
          id: 'post-2',
          type: 'prayer',
          author: {
            name: 'Pastor Smith',
            avatar: null
          },
          body: 'Please pray for our upcoming outreach event this Saturday. We are believing for breakthrough!',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          reactionCounts: {
            pray: 23,
            heart: 8
          }
        }
      ];

      const dashboardData = {
        greeting: {
          name: user.firstName || user.displayName || 'Friend',
          time: new Date().toLocaleDateString()
        },
        primaryCta,
        serveHighlights,
        upcomingEvents,
        givingCard,
        connectTeaser
      };

      res.json(dashboardData);
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ message: "Failed to get dashboard data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
