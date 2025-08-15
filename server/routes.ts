import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { scoreGifts } from "../client/src/lib/scoring";
import { giftContent } from "./content/gifts";
import { emailService } from "./services/email";
import { setupAuth, isAuthenticated } from "./replitAuth";
import rateLimit from "express-rate-limit";
import {
  insertResponseSchema,
  insertAnswerSchema,
  insertResultSchema,
  type GiftKey,
  type User,
} from "@shared/schema";

// Rate limiting
const assessmentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 assessments per hour
  message: "Too many assessment attempts, please try again later.",
});

// Middleware to check admin role
function requireAdmin(req: any, res: any, next: any) {
  const userId = req.user?.claims?.sub;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Get user from storage to check role
  storage.getUser(userId).then(user => {
    if (user?.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  }).catch(() => {
    return res.status(500).json({ message: "Server error" });
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

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
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Assessment routes
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

        const response = await storage.createResponse({
          userId: req.user.userId,
          versionId: activeVersion.id,
        });

        res.json(response);
      } catch (error) {
        console.error("Start assessment error:", error);
        res.status(500).json({ message: "Failed to start assessment" });
      }
    }
  );

  app.post(
    "/api/assessment/:responseId/submit",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const { responseId } = req.params;
        const { answers, ageGroups, ministryInterests } = req.body;

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
        
        console.log('Creating result for responseId:', responseId);
        const result = await storage.createResult({
          responseId,
          scoresJson: scores.totals,
          top1GiftKey: scores.top3[0],
          top2GiftKey: scores.top3[1],
          top3GiftKey: scores.top3[2],
          ageGroups: ageGroups || [],
          ministryInterests: ministryInterests || [],
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
      const userId = req.user.claims.sub;
      
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

      // Enhance results with gift content and expiration info
      const enhancedResult = {
        ...result,
        daysUntilExpiration,
        isNearExpiration: daysUntilExpiration !== null && daysUntilExpiration <= 30,
        isVeryNearExpiration: daysUntilExpiration !== null && daysUntilExpiration <= 7,
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

  // Admin routes
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

  const httpServer = createServer(app);
  return httpServer;
}
