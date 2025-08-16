import {
  type User,
  type InsertUser,
  type UpsertUser,
  type AssessmentVersion,
  type InsertAssessmentVersion,
  type Question,
  type InsertQuestion,
  type Response,
  type InsertResponse,
  type Answer,
  type InsertAnswer,
  type Result,
  type InsertResult,
  type GiftKey,
  type ProfileCompletionData,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  completeUserProfile(userId: string, profileData: ProfileCompletionData): Promise<User>;

  // Assessment Version operations
  getActiveAssessmentVersion(): Promise<AssessmentVersion | undefined>;
  createAssessmentVersion(
    version: InsertAssessmentVersion
  ): Promise<AssessmentVersion>;

  // Question operations
  getQuestionsByVersion(versionId: string): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  bulkCreateQuestions(questions: InsertQuestion[]): Promise<Question[]>;

  // Response operations
  createResponse(response: InsertResponse): Promise<Response>;
  getResponse(id: string): Promise<Response | undefined>;
  getResponsesByUser(userId: string): Promise<Response[]>;
  getAllResponses(): Promise<Response[]>;
  updateResponseSubmission(id: string): Promise<Response | undefined>;

  // Answer operations
  createAnswer(answer: InsertAnswer): Promise<Answer>;
  bulkCreateAnswers(answers: InsertAnswer[]): Promise<Answer[]>;
  getAnswersByResponse(responseId: string): Promise<Answer[]>;

  // Result operations
  createResult(result: InsertResult): Promise<Result>;
  getResultByResponse(responseId: string): Promise<Result | undefined>;
  getAllResults(): Promise<Result[]>;
  getUserResults(userId: string): Promise<Result[]>;

  // Admin operations
  getAssessmentStats(): Promise<{
    totalAssessments: number;
    completionRate: number;
    avgTimeMinutes: number;
    thisMonth: number;
  }>;
  getGiftDistribution(): Promise<Record<GiftKey, number>>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private assessmentVersions: Map<string, AssessmentVersion> = new Map();
  private questions: Map<string, Question> = new Map();
  private responses: Map<string, Response> = new Map();
  private answers: Map<string, Answer> = new Map();
  private results: Map<string, Result> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    
    if (existingUser) {
      // Update existing user
      const updatedUser: User = {
        ...existingUser,
        ...userData,
        email: userData.email ?? existingUser.email ?? null,
        firstName: userData.firstName ?? existingUser.firstName ?? null,
        lastName: userData.lastName ?? existingUser.lastName ?? null,
        displayName: userData.displayName ?? existingUser.displayName ?? null,
        ageRange: userData.ageRange ?? existingUser.ageRange ?? null,
        profileImageUrl: userData.profileImageUrl ?? existingUser.profileImageUrl ?? null,
        profileCompleted: userData.profileCompleted ?? existingUser.profileCompleted ?? false,
        updatedAt: new Date(),
      };
      this.users.set(userData.id!, updatedUser);
      return updatedUser;
    } else {
      // Create new user
      const user: User = {
        ...userData,
        id: userData.id || randomUUID(),
        email: userData.email ?? null,
        firstName: userData.firstName ?? null,
        lastName: userData.lastName ?? null,
        displayName: userData.displayName ?? null,
        ageRange: userData.ageRange ?? null,
        profileImageUrl: userData.profileImageUrl ?? null,
        profileCompleted: userData.profileCompleted ?? false,
        role: userData.role || "PARTICIPANT",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(user.id, user);
      return user;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      email: insertUser.email ?? null,
      firstName: insertUser.firstName ?? null,
      lastName: insertUser.lastName ?? null,
      displayName: insertUser.displayName ?? null,
      ageRange: insertUser.ageRange ?? null,
      profileImageUrl: insertUser.profileImageUrl ?? null,
      profileCompleted: insertUser.profileCompleted ?? false,
      role: insertUser.role || "PARTICIPANT",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async completeUserProfile(userId: string, profileData: ProfileCompletionData): Promise<User> {
    const existingUser = this.users.get(userId);
    if (!existingUser) {
      throw new Error("User not found");
    }

    const updatedUser: User = {
      ...existingUser,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      displayName: profileData.displayName,
      ageRange: profileData.ageRange,
      profileCompleted: true,
      updatedAt: new Date(),
    };

    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getActiveAssessmentVersion(): Promise<AssessmentVersion | undefined> {
    return Array.from(this.assessmentVersions.values()).find(
      (version) => version.isActive
    );
  }

  async createAssessmentVersion(
    insertVersion: InsertAssessmentVersion
  ): Promise<AssessmentVersion> {
    const id = randomUUID();
    const version: AssessmentVersion = {
      ...insertVersion,
      id,
      isActive: insertVersion.isActive || false,
      createdAt: new Date(),
    };
    this.assessmentVersions.set(id, version);
    return version;
  }

  async getQuestionsByVersion(versionId: string): Promise<Question[]> {
    return Array.from(this.questions.values())
      .filter((q) => q.versionId === versionId && q.isActive)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = randomUUID();
    const question: Question = {
      ...insertQuestion,
      id,
      isActive: insertQuestion.isActive !== undefined ? insertQuestion.isActive : true,
    };
    this.questions.set(id, question);
    return question;
  }

  async bulkCreateQuestions(
    insertQuestions: InsertQuestion[]
  ): Promise<Question[]> {
    const questions = insertQuestions.map((insertQuestion) => {
      const id = randomUUID();
      const question: Question = {
        ...insertQuestion,
        id,
        isActive: insertQuestion.isActive !== undefined ? insertQuestion.isActive : true,
      };
      this.questions.set(id, question);
      return question;
    });
    return questions;
  }

  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const id = randomUUID();
    const response: Response = {
      ...insertResponse,
      id,
      startedAt: new Date(),
      submittedAt: null,
    };
    this.responses.set(id, response);
    return response;
  }

  async getResponse(id: string): Promise<Response | undefined> {
    return this.responses.get(id);
  }

  async getResponsesByUser(userId: string): Promise<Response[]> {
    return Array.from(this.responses.values()).filter(
      (r) => r.userId === userId
    );
  }

  async getAllResponses(): Promise<Response[]> {
    return Array.from(this.responses.values());
  }

  async updateResponseSubmission(id: string): Promise<Response | undefined> {
    const response = this.responses.get(id);
    if (response) {
      const updatedResponse = {
        ...response,
        submittedAt: new Date(),
      };
      this.responses.set(id, updatedResponse);
      return updatedResponse;
    }
    return undefined;
  }

  async createAnswer(insertAnswer: InsertAnswer): Promise<Answer> {
    const id = randomUUID();
    const answer: Answer = {
      ...insertAnswer,
      id,
    };
    this.answers.set(id, answer);
    return answer;
  }

  async bulkCreateAnswers(insertAnswers: InsertAnswer[]): Promise<Answer[]> {
    const answers = insertAnswers.map((insertAnswer) => {
      const id = randomUUID();
      const answer: Answer = {
        ...insertAnswer,
        id,
      };
      this.answers.set(id, answer);
      return answer;
    });
    return answers;
  }

  async getAnswersByResponse(responseId: string): Promise<Answer[]> {
    return Array.from(this.answers.values()).filter(
      (a) => a.responseId === responseId
    );
  }

  async createResult(insertResult: InsertResult): Promise<Result> {
    const id = randomUUID();
    const result: Result = {
      ...insertResult,
      id,
      ageGroups: (insertResult.ageGroups as string[]) || [],
      ministryInterests: (insertResult.ministryInterests as string[]) || [],
      createdAt: new Date(),
    };
    this.results.set(id, result);
    return result;
  }

  async getResultByResponse(responseId: string): Promise<Result | undefined> {
    return Array.from(this.results.values()).find(
      (r) => r.responseId === responseId
    );
  }

  async getAllResults(): Promise<Result[]> {
    return Array.from(this.results.values());
  }

  async getUserResults(userId: string): Promise<Result[]> {
    // Get user's responses first
    const userResponses = await this.getResponsesByUser(userId);
    const responseIds = userResponses.map(r => r.id);
    
    // Filter results by user's response IDs and sort by creation date (newest first)
    return Array.from(this.results.values())
      .filter(result => responseIds.includes(result.responseId))
      .sort((a, b) => {
        const aDate = a.createdAt || new Date(0);
        const bDate = b.createdAt || new Date(0);
        return bDate.getTime() - aDate.getTime();
      });
  }

  async getAssessmentStats(): Promise<{
    totalAssessments: number;
    completionRate: number;
    avgTimeMinutes: number;
    thisMonth: number;
  }> {
    const allResponses = Array.from(this.responses.values());
    const completedResponses = allResponses.filter((r) => r.submittedAt);
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const thisMonthResponses = allResponses.filter(
      (r) => r.startedAt && r.startedAt >= thisMonth
    );

    // Calculate average completion time
    const completionTimes = completedResponses
      .filter((r) => r.submittedAt && r.startedAt)
      .map(
        (r) =>
          (r.submittedAt!.getTime() - r.startedAt!.getTime()) / (1000 * 60)
      ); // in minutes

    const avgTimeMinutes =
      completionTimes.length > 0
        ? Math.round(
            completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
          )
        : 0;

    return {
      totalAssessments: allResponses.length,
      completionRate:
        allResponses.length > 0
          ? Math.round((completedResponses.length / allResponses.length) * 100)
          : 0,
      avgTimeMinutes,
      thisMonth: thisMonthResponses.length,
    };
  }

  async getGiftDistribution(): Promise<Record<GiftKey, number>> {
    const results = Array.from(this.results.values());
    const distribution: Record<GiftKey, number> = {
      LEADERSHIP_ORG: 0,
      TEACHING: 0,
      WISDOM_INSIGHT: 0,
      PROPHETIC_DISCERNMENT: 0,
      EXHORTATION: 0,
      SHEPHERDING: 0,
      FAITH: 0,
      EVANGELISM: 0,
      APOSTLESHIP: 0,
      SERVICE_HOSPITALITY: 0,
      MERCY: 0,
      GIVING: 0,
    };

    results.forEach((result) => {
      distribution[result.top1GiftKey]++;
    });

    return distribution;
  }
}

export const storage = new MemStorage();
