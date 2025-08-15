import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { scoreGifts } from "../client/src/lib/scoring";
import { giftContent } from "./content/gifts";
import { emailService } from "./services/email";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import {
  insertUserSchema,
  insertResponseSchema,
  insertAnswerSchema,
  insertResultSchema,
  type GiftKey,
  type User,
} from "@shared/schema";

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: "Too many authentication attempts, please try again later.",
});

const assessmentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 assessments per hour
  message: "Too many assessment attempts, please try again later.",
});

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

// Middleware to verify JWT token
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
}

// Middleware to check admin role
function requireAdmin(req: any, res: any, next: any) {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
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
  app.post("/api/auth/signup", authLimiter, async (req, res) => {
    try {
      const { name, email, password } = insertUserSchema
        .extend({
          name: insertUserSchema.shape.name.optional(),
          password: insertUserSchema.shape.passwordHash.optional(),
        })
        .parse(req.body);

      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password || "defaultpass", 10);

      // Create user
      const user = await storage.createUser({
        name,
        email,
        passwordHash,
        role: "PARTICIPANT",
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      res.status(400).json({ message: error.message || "Signup failed" });
    }
  });

  app.post("/api/auth/signin", authLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: any) {
      console.error("Signin error:", error);
      res.status(500).json({ message: "Sign in failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user data" });
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
    authenticateToken,
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
    authenticateToken,
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

        // Save results
        const result = await storage.createResult({
          responseId,
          scoresJson: scores.totals,
          top1GiftKey: scores.top3[0],
          top2GiftKey: scores.top3[1],
          top3GiftKey: scores.top3[2],
          ageGroups: ageGroups || [],
          ministryInterests: ministryInterests || [],
          renderedHtml: null,
        });

        // Update response as submitted
        await storage.updateResponseSubmission(responseId);

        // Send email with results
        try {
          const user = await storage.getUser(req.user.userId);
          if (user?.email) {
            await emailService.sendAssessmentResults(
              user.email,
              user.name || "Friend",
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

  app.get("/api/results/:responseId", authenticateToken, async (req: any, res) => {
    try {
      const { responseId } = req.params;

      // Validate response belongs to user or user is admin
      const response = await storage.getResponse(responseId);
      if (!response) {
        return res.status(404).json({ message: "Response not found" });
      }

      if (response.userId !== req.user.userId && req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Access denied" });
      }

      const result = await storage.getResultByResponse(responseId);
      if (!result) {
        return res.status(404).json({ message: "Results not found" });
      }

      // Enhance results with gift content
      const enhancedResult = {
        ...result,
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
    authenticateToken,
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
    authenticateToken,
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
                name: user?.name,
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
    authenticateToken,
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
              `"${user?.name || ""}"`,
              `"${user?.email || ""}"`,
              `"${response.submittedAt.toISOString()}"`,
              `"${giftContent[result.top1GiftKey].shortName}"`,
              `"${giftContent[result.top2GiftKey].shortName}"`,
              `"${giftContent[result.top3GiftKey].shortName}"`,
              `"${result.ageGroups.join(", ")}"`,
              `"${result.ministryInterests.join(", ")}"`,
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
