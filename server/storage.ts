import {
  type User,
  type InsertUser,
  type UpsertUser,
  type Organization,
  type InsertOrganization,
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
  type MinistryOpportunity,
  type InsertMinistryOpportunity,
  type PlacementCandidate,
  type InsertPlacementCandidate,
  type AnalyticsEvent,
  type InsertAnalyticsEvent,
  type GiftKey,
  type ProfileCompletionData,
  type DashboardMetrics,
  type UserWithResults,
  type AdminFilters,
  type OrganizationRole,
  users,
  organizations,
  assessmentVersions,
  questions,
  responses,
  answers,
  results,
  ministryOpportunities,
  placementCandidates,
  analyticsEvents,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, count, sql, inArray, isNull } from "drizzle-orm";

export interface IStorage {
  // Organization operations
  getOrganization(id: string): Promise<Organization | undefined>;
  getOrganizationBySubdomain(subdomain: string): Promise<Organization | undefined>;
  getOrganizationByInviteCode(inviteCode: string): Promise<Organization | undefined>;
  getOrganizations(): Promise<Organization[]>;
  createOrganization(organization: InsertOrganization): Promise<Organization>;
  updateOrganization(id: string, updates: Partial<InsertOrganization>): Promise<Organization>;
  updateOrganizationStatus(organizationId: string, status: 'ACTIVE' | 'INACTIVE'): Promise<Organization>;
  deleteOrganization(organizationId: string): Promise<void>;

  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  completeUserProfile(userId: string, profileData: ProfileCompletionData): Promise<User>;
  getUsersByOrganization(organizationId: string, filters?: AdminFilters): Promise<UserWithResults[]>;
  updateUserRole(userId: string, role: OrganizationRole): Promise<User>;

  // Assessment Version operations
  getActiveAssessmentVersion(): Promise<AssessmentVersion | undefined>;
  createAssessmentVersion(version: InsertAssessmentVersion): Promise<AssessmentVersion>;

  // Question operations
  getQuestionsByVersion(versionId: string): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  bulkCreateQuestions(questions: InsertQuestion[]): Promise<Question[]>;

  // Response operations
  createResponse(response: InsertResponse): Promise<Response>;
  getResponse(id: string): Promise<Response | undefined>;
  getResponsesByUser(userId: string): Promise<Response[]>;
  getResponsesByOrganization(organizationId: string, filters?: AdminFilters): Promise<Response[]>;
  getAllResponses(): Promise<Response[]>;
  updateResponseSubmission(id: string, timeSpentMinutes?: number): Promise<Response | undefined>;

  // Answer operations
  createAnswer(answer: InsertAnswer): Promise<Answer>;
  bulkCreateAnswers(answers: InsertAnswer[]): Promise<Answer[]>;
  getAnswersByResponse(responseId: string): Promise<Answer[]>;

  // Result operations
  createResult(result: InsertResult): Promise<Result>;
  getResultByResponse(responseId: string): Promise<Result | undefined>;
  getResultsByOrganization(organizationId: string, filters?: AdminFilters): Promise<Result[]>;
  getAllResults(): Promise<Result[]>;
  getUserResults(userId: string): Promise<Result[]>;
  updateResultNotes(resultId: string, notes: string, followUpDate?: Date): Promise<Result>;

  // Ministry Opportunity operations
  getMinistryOpportunities(organizationId: string): Promise<MinistryOpportunity[]>;
  createMinistryOpportunity(opportunity: InsertMinistryOpportunity): Promise<MinistryOpportunity>;
  updateMinistryOpportunity(id: string, updates: Partial<InsertMinistryOpportunity>): Promise<MinistryOpportunity>;

  // Placement operations
  getPlacementCandidates(opportunityId: string): Promise<PlacementCandidate[]>;
  createPlacementCandidate(candidate: InsertPlacementCandidate): Promise<PlacementCandidate>;
  updateCandidateStatus(candidateId: string, status: string, adminNotes?: string): Promise<PlacementCandidate>;

  // Analytics operations
  logAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  getDashboardMetrics(organizationId: string): Promise<DashboardMetrics>;
  getGlobalMetrics(): Promise<DashboardMetrics>;
  getAssessmentStats(organizationId?: string): Promise<{
    totalAssessments: number;
    completionRate: number;
    avgTimeMinutes: number;
    thisMonth: number;
  }>;
  getGiftDistribution(organizationId?: string): Promise<Record<GiftKey, number>>;

  // Permission helpers
  hasPermission(userId: string, permission: string, organizationId?: string): Promise<boolean>;
  canAccessOrganization(userId: string, organizationId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Organization operations
  async getOrganization(id: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org;
  }

  async getOrganizations(): Promise<Organization[]> {
    return await db.select().from(organizations).orderBy(organizations.name);
  }

  async getOrganizationBySubdomain(subdomain: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.subdomain, subdomain));
    return org;
  }

  async getOrganizationByInviteCode(inviteCode: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.inviteCode, inviteCode));
    return org;
  }

  async createOrganization(orgData: InsertOrganization): Promise<Organization> {
    const [org] = await db.insert(organizations).values(orgData).returning();
    return org;
  }

  async updateOrganization(id: string, updates: Partial<InsertOrganization>): Promise<Organization> {
    const [org] = await db
      .update(organizations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    return org;
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        organizationId: userData.organizationId || 'default-org-001', // Default org for existing users
        lastActiveAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
          lastActiveAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!insertUser.organizationId) {
      throw new Error("Organization ID is required when creating a user");
    }
    
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        lastActiveAt: new Date(),
      })
      .returning();
    return user;
  }

  async completeUserProfile(userId: string, profileData: ProfileCompletionData): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        displayName: profileData.displayName,
        ageRange: profileData.ageRange,
        profileCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getUsersByOrganization(organizationId: string, filters?: AdminFilters): Promise<UserWithResults[]> {
    let conditions = [eq(users.organizationId, organizationId)];
    
    // Add filters if provided
    if (filters?.dateRange) {
      conditions.push(
        gte(users.createdAt, filters.dateRange.start),
        lte(users.createdAt, filters.dateRange.end)
      );
    }
    
    if (filters?.ageRange) {
      conditions.push(eq(users.ageRange, filters.ageRange));
    }

    const userResults = await db
      .select()
      .from(users)
      .where(and(...conditions))
      .orderBy(desc(users.createdAt));
    
    // Transform to UserWithResults type (simplified for now)
    return userResults.map(user => ({
      ...user,
      totalAssessments: 0, // Would need a join to calculate
    }));
  }

  async updateUserRole(userId: string, role: OrganizationRole): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateOrganizationStatus(organizationId: string, status: 'ACTIVE' | 'INACTIVE'): Promise<Organization> {
    const [organization] = await db
      .update(organizations)
      .set({ status, updatedAt: new Date() })
      .where(eq(organizations.id, organizationId))
      .returning();
    return organization;
  }

  async deleteOrganization(organizationId: string): Promise<void> {
    // Delete all related data first
    // Delete results
    await db.delete(results).where(eq(results.organizationId, organizationId));
    
    // Delete responses  
    await db.delete(responses).where(eq(responses.organizationId, organizationId));
    
    // Delete users
    await db.delete(users).where(eq(users.organizationId, organizationId));
    
    // Delete organization
    await db.delete(organizations).where(eq(organizations.id, organizationId));
  }

  // Assessment Version operations
  async getActiveAssessmentVersion(): Promise<AssessmentVersion | undefined> {
    const [version] = await db
      .select()
      .from(assessmentVersions)
      .where(eq(assessmentVersions.isActive, true));
    return version;
  }

  async createAssessmentVersion(insertVersion: InsertAssessmentVersion): Promise<AssessmentVersion> {
    const [version] = await db.insert(assessmentVersions).values(insertVersion).returning();
    return version;
  }

  // Question operations
  async getQuestionsByVersion(versionId: string): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(and(eq(questions.versionId, versionId), eq(questions.isActive, true)))
      .orderBy(questions.orderIndex);
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const [question] = await db.insert(questions).values(insertQuestion).returning();
    return question;
  }

  async bulkCreateQuestions(insertQuestions: InsertQuestion[]): Promise<Question[]> {
    return await db.insert(questions).values(insertQuestions).returning();
  }

  // Response operations
  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    if (!insertResponse.organizationId) {
      throw new Error("Organization ID is required when creating a response");
    }
    
    const [response] = await db.insert(responses).values(insertResponse).returning();
    return response;
  }

  async getResponse(id: string): Promise<Response | undefined> {
    const [response] = await db.select().from(responses).where(eq(responses.id, id));
    return response;
  }

  async getResponsesByUser(userId: string): Promise<Response[]> {
    return await db
      .select()
      .from(responses)
      .where(eq(responses.userId, userId))
      .orderBy(desc(responses.startedAt));
  }

  async getResponsesByOrganization(organizationId: string, filters?: AdminFilters): Promise<Response[]> {
    let conditions = [eq(responses.organizationId, organizationId)];
    
    if (filters?.dateRange) {
      conditions.push(
        gte(responses.startedAt, filters.dateRange.start),
        lte(responses.startedAt, filters.dateRange.end)
      );
    }

    return await db
      .select()
      .from(responses)
      .where(and(...conditions))
      .orderBy(desc(responses.startedAt));
  }

  async getAllResponses(): Promise<Response[]> {
    return await db.select().from(responses).orderBy(desc(responses.startedAt));
  }

  async updateResponseSubmission(id: string, timeSpentMinutes?: number): Promise<Response | undefined> {
    const [response] = await db
      .update(responses)
      .set({
        submittedAt: new Date(),
        timeSpentMinutes: timeSpentMinutes || null,
      })
      .where(eq(responses.id, id))
      .returning();
    return response;
  }

  // Answer operations
  async createAnswer(insertAnswer: InsertAnswer): Promise<Answer> {
    const [answer] = await db.insert(answers).values(insertAnswer).returning();
    return answer;
  }

  async bulkCreateAnswers(insertAnswers: InsertAnswer[]): Promise<Answer[]> {
    return await db.insert(answers).values(insertAnswers).returning();
  }

  async getAnswersByResponse(responseId: string): Promise<Answer[]> {
    return await db.select().from(answers).where(eq(answers.responseId, responseId));
  }

  // Result operations
  async createResult(insertResult: InsertResult): Promise<Result> {
    const resultsList = await db.insert(results).values([insertResult]).returning();
    return resultsList[0];
  }

  async getResultByResponse(responseId: string): Promise<Result | undefined> {
    const [result] = await db.select().from(results).where(eq(results.responseId, responseId));
    return result;
  }

  async getResultsByOrganization(organizationId: string, filters?: AdminFilters): Promise<Result[]> {
    let conditions = [eq(results.organizationId, organizationId)];
    
    if (filters?.dateRange) {
      conditions.push(
        gte(results.createdAt, filters.dateRange.start),
        lte(results.createdAt, filters.dateRange.end)
      );
    }
    
    if (filters?.giftKey) {
      conditions.push(
        sql`${results.top1GiftKey} = ${filters.giftKey} OR ${results.top2GiftKey} = ${filters.giftKey} OR ${results.top3GiftKey} = ${filters.giftKey}`
      );
    }

    return await db
      .select()
      .from(results)
      .where(and(...conditions))
      .orderBy(desc(results.createdAt));
  }

  async getAllResults(): Promise<Result[]> {
    return await db.select().from(results).orderBy(desc(results.createdAt));
  }

  async getUserResults(userId: string): Promise<Result[]> {
    return await db
      .select()
      .from(results)
      .innerJoin(responses, eq(results.responseId, responses.id))
      .where(eq(responses.userId, userId))
      .orderBy(desc(results.createdAt))
      .then(rows => rows.map(row => row.results));
  }

  async updateResultNotes(resultId: string, notes: string, followUpDate?: Date): Promise<Result> {
    const [result] = await db
      .update(results)
      .set({ notes, followUpDate })
      .where(eq(results.id, resultId))
      .returning();
    return result;
  }

  // Ministry Opportunity operations
  async getMinistryOpportunities(organizationId: string): Promise<MinistryOpportunity[]> {
    return await db
      .select()
      .from(ministryOpportunities)
      .where(eq(ministryOpportunities.organizationId, organizationId))
      .orderBy(ministryOpportunities.title);
  }

  async createMinistryOpportunity(opportunity: InsertMinistryOpportunity): Promise<MinistryOpportunity> {
    const opps = await db.insert(ministryOpportunities).values([opportunity]).returning();
    return opps[0];
  }

  async updateMinistryOpportunity(id: string, updates: Partial<InsertMinistryOpportunity>): Promise<MinistryOpportunity> {
    const updatedData = {
      ...updates,
      updatedAt: new Date()
    };
    const [opp] = await db
      .update(ministryOpportunities)
      .set(updatedData)
      .where(eq(ministryOpportunities.id, id))
      .returning();
    return opp;
  }

  // Placement operations
  async getPlacementCandidates(opportunityId: string): Promise<PlacementCandidate[]> {
    return await db
      .select()
      .from(placementCandidates)
      .where(eq(placementCandidates.opportunityId, opportunityId))
      .orderBy(desc(placementCandidates.createdAt));
  }

  async createPlacementCandidate(candidate: InsertPlacementCandidate): Promise<PlacementCandidate> {
    const [cand] = await db.insert(placementCandidates).values(candidate).returning();
    return cand;
  }

  async updateCandidateStatus(candidateId: string, status: string, adminNotes?: string): Promise<PlacementCandidate> {
    const [candidate] = await db
      .update(placementCandidates)
      .set({ 
        adminNotes,
        respondedAt: new Date()
      })
      .where(eq(placementCandidates.id, candidateId))
      .returning();
    return candidate;
  }

  // Analytics operations
  async logAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const [analyticsEvent] = await db.insert(analyticsEvents).values(event).returning();
    return analyticsEvent;
  }

  async getDashboardMetrics(organizationId: string): Promise<DashboardMetrics> {
    // Calculate comprehensive metrics for organization dashboard
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get total started and completed responses
    const [totalStarted] = await db
      .select({ count: count() })
      .from(responses)
      .where(eq(responses.organizationId, organizationId));

    const [totalCompletions] = await db
      .select({ count: count() })
      .from(responses)
      .where(and(
        eq(responses.organizationId, organizationId),
        sql`${responses.submittedAt} IS NOT NULL`
      ));

    const last30DaysCompletions = await db
      .select({ count: count() })
      .from(responses)
      .where(and(
        eq(responses.organizationId, organizationId),
        sql`${responses.submittedAt} IS NOT NULL`,
        gte(responses.submittedAt, thirtyDaysAgo)
      ));
    
    const last30DaysCount = last30DaysCompletions[0]?.count || 0;

    // Calculate completion rate
    const totalStartedCount = totalStarted.count || 0;
    const totalCompletedCount = totalCompletions.count || 0;
    const dropOffRate = totalStartedCount > 0 ? 
      (totalStartedCount - totalCompletedCount) / totalStartedCount : 0;

    // Get gift distribution
    const giftResults = await db
      .select({
        top1GiftKey: results.top1GiftKey,
        count: count()
      })
      .from(results)
      .where(eq(results.organizationId, organizationId))
      .groupBy(results.top1GiftKey);

    const topGiftDistribution = giftResults.reduce((acc, item) => {
      acc[item.top1GiftKey] = item.count;
      return acc;
    }, {} as Record<GiftKey, number>);

    // Get age distribution for pie chart
    const ageDistributionResults = await db
      .select({
        ageRange: sql`${results.ageGroups}->0`.as('age_range'),
        count: count()
      })
      .from(results)
      .where(and(
        eq(results.organizationId, organizationId),
        sql`${results.ageGroups} IS NOT NULL`
      ))
      .groupBy(sql`${results.ageGroups}->0`);

    const ageGroupDistribution = ageDistributionResults.reduce((acc, item) => {
      const ageRange = item.ageRange as string;
      if (ageRange) {
        acc[ageRange] = item.count;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCompletions: totalCompletedCount,
      completionsLast30Days: last30DaysCount,
      averageTimeMinutes: 15, // Simplified for now
      dropOffRate,
      topGiftDistribution,
      ageGroupDistribution,
      weeklyCompletions: [], // Simplified for now
    };
  }

  async getGlobalMetrics(): Promise<DashboardMetrics> {
    // Similar to getDashboardMetrics but across all organizations
    return this.getDashboardMetrics(''); // Empty string to indicate global
  }

  async getAssessmentStats(organizationId?: string): Promise<{
    totalAssessments: number;
    completionRate: number;
    avgTimeMinutes: number;
    thisMonth: number;
  }> {
    let totalAssessments;
    let completedAssessments;
    
    if (organizationId) {
      totalAssessments = await db
        .select({ count: count() })
        .from(responses)
        .where(eq(responses.organizationId, organizationId));
        
      completedAssessments = await db
        .select({ count: count() })
        .from(responses)
        .where(and(
          eq(responses.organizationId, organizationId),
          sql`${responses.submittedAt} IS NOT NULL`
        ));
    } else {
      totalAssessments = await db.select({ count: count() }).from(responses);
      completedAssessments = await db
        .select({ count: count() })
        .from(responses)
        .where(sql`${responses.submittedAt} IS NOT NULL`);
    }

    const totalCount = totalAssessments[0]?.count || 0;
    const completedCount = completedAssessments[0]?.count || 0;

    const completionRate = totalCount > 0 
      ? Math.round((completedCount / totalCount) * 100)
      : 0;

    return {
      totalAssessments: totalCount,
      completionRate,
      avgTimeMinutes: 15, // Simplified
      thisMonth: 0, // Simplified
    };
  }

  async getGiftDistribution(organizationId?: string): Promise<Record<GiftKey, number>> {
    let giftResults;
    
    if (organizationId) {
      giftResults = await db
        .select({
          top1GiftKey: results.top1GiftKey,
          count: count()
        })
        .from(results)
        .where(eq(results.organizationId, organizationId))
        .groupBy(results.top1GiftKey);
    } else {
      giftResults = await db
        .select({
          top1GiftKey: results.top1GiftKey,
          count: count()
        })
        .from(results)
        .groupBy(results.top1GiftKey);
    }
    
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

    giftResults.forEach((result) => {
      distribution[result.top1GiftKey] = result.count;
    });

    return distribution;
  }

  // Permission helpers
  async hasPermission(userId: string, permission: string, organizationId?: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;

    const userPermissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [];
    
    // Super admin has all permissions
    if (user.role === 'SUPER_ADMIN') return true;
    
    // Check if user has the specific permission
    return userPermissions.includes(permission as never) || userPermissions.includes('all' as never);
  }

  async canAccessOrganization(userId: string, organizationId: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;

    // Super admin can access all organizations
    if (user.role === 'SUPER_ADMIN') return true;
    
    // User can access their own organization
    return user.organizationId === organizationId;
  }
}

export const storage = new DatabaseStorage();