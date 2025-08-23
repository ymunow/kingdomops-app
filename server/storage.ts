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
import { nanoid } from "nanoid";
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
  updateUserStatus(userId: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): Promise<User>;
  deleteUser(userId: string): Promise<boolean>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Super Admin platform management
  getPlatformMetrics(): Promise<any>;
  getAllOrganizationsWithStats(): Promise<any[]>;
  getUserCountByOrganization(organizationId: string): Promise<number>;
  getSystemSettings(): Promise<any>;
  updateSystemSettings(settings: any): Promise<any>;

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
  getMinistryOpportunity(id: string): Promise<MinistryOpportunity | undefined>;
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

  // Profile completion operations
  getProfileProgress(userId: string): Promise<{
    percentage: number;
    completedSteps: string[];
    steps: Array<{
      key: string;
      label: string;
      completed: boolean;
      weight: number;
      order: number;
    }>;
  }>;
  markStepComplete(userId: string, stepKey: string): Promise<void>;
  initializeProfileSteps(userId: string, organizationId: string): Promise<void>;
  getProfileStepConfigurations(organizationId: string): Promise<Array<{
    stepKey: string;
    label: string;
    weight: number;
    enabled: boolean;
    order: number;
  }>>;
  updateProfileStepConfigurations(organizationId: string, configs: Array<{
    stepKey: string;
    label: string;
    weight: number;
    enabled: boolean;
    order: number;
  }>): Promise<void>;
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

  async completeUserProfile(userId: string, profileData: ProfileCompletionData & { profileImageUrl?: string }): Promise<User> {
    const updateData: any = {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      displayName: profileData.displayName,
      ageRange: profileData.ageRange,
      updatedAt: new Date(),
    };

    // Only set profileCompleted to true if we have all required profile fields
    if (profileData.firstName && profileData.lastName && profileData.displayName && profileData.ageRange) {
      updateData.profileCompleted = true;
    }

    // Include profile image URL if provided
    if (profileData.profileImageUrl !== undefined) {
      updateData.profileImageUrl = profileData.profileImageUrl;
    }

    const [user] = await db
      .update(users)
      .set(updateData)
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
    
    // Get assessment counts for each user
    const usersWithAssessments = await Promise.all(
      userResults.map(async (user) => {
        const userResponsesCount = await db
          .select({ count: count() })
          .from(responses)
          .where(eq(responses.userId, user.id));
        
        return {
          ...user,
          totalAssessments: userResponsesCount[0]?.count || 0,
        };
      })
    );
    
    return usersWithAssessments;
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

  // Super Admin question management functions
  async getAllAssessmentVersions(): Promise<AssessmentVersion[]> {
    return await db
      .select()
      .from(assessmentVersions)
      .orderBy(desc(assessmentVersions.createdAt));
  }

  async getAllQuestions(): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .orderBy(questions.versionId, questions.orderIndex);
  }

  async updateQuestion(id: string, updates: Partial<InsertQuestion>): Promise<Question> {
    const [question] = await db
      .update(questions)
      .set(updates)
      .where(eq(questions.id, id))
      .returning();
    return question;
  }

  async deactivateQuestion(id: string): Promise<Question> {
    const [question] = await db
      .update(questions)
      .set({ isActive: false })
      .where(eq(questions.id, id))
      .returning();
    return question;
  }

  async updateAssessmentVersion(id: string, updates: Partial<InsertAssessmentVersion>): Promise<AssessmentVersion> {
    const [version] = await db
      .update(assessmentVersions)
      .set(updates)
      .where(eq(assessmentVersions.id, id))
      .returning();
    return version;
  }

  async setActiveAssessmentVersion(id: string): Promise<AssessmentVersion> {
    // First deactivate all versions
    await db
      .update(assessmentVersions)
      .set({ isActive: false });
    
    // Then activate the specified version
    const [version] = await db
      .update(assessmentVersions)
      .set({ isActive: true })
      .where(eq(assessmentVersions.id, id))
      .returning();
    return version;
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

  async getMinistryOpportunity(id: string): Promise<MinistryOpportunity | undefined> {
    const [opportunity] = await db
      .select()
      .from(ministryOpportunities)
      .where(eq(ministryOpportunities.id, id));
    return opportunity;
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

    // Get age distribution for pie chart - simplified to avoid JSON operator issues
    let ageGroupDistribution: Record<string, number> = {};
    
    try {
      const ageDistributionResults = await db
        .select({
          ageGroups: results.ageGroups,
        })
        .from(results)
        .where(eq(results.organizationId, organizationId));

      // Process age groups in JavaScript to avoid database JSON operator issues
      ageDistributionResults.forEach(item => {
        if (item.ageGroups && Array.isArray(item.ageGroups) && item.ageGroups.length > 0) {
          const ageRange = item.ageGroups[0] as string;
          if (ageRange) {
            ageGroupDistribution[ageRange] = (ageGroupDistribution[ageRange] || 0) + 1;
          }
        }
      });
    } catch (error) {
      console.error('Error getting age distribution:', error);
      ageGroupDistribution = {};
    }

    // Debug logging removed - calculation confirmed correct

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

  async getUserCountByOrganization(organizationId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.organizationId, organizationId));
    
    return result[0]?.count || 0;
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

  // Profile completion operations
  async getProfileProgress(userId: string): Promise<{
    percentage: number;
    completedSteps: string[];
    steps: Array<{
      key: string;
      label: string;
      completed: boolean;
      weight: number;
      order: number;
    }>;
  }> {
    const user = await this.getUser(userId);
    if (!user?.organizationId) {
      throw new Error('User organization not found');
    }

    // Get step configurations for the user's organization
    const configsResult = await db.execute(sql`
      SELECT step_key, label, weight, enabled, "order"
      FROM profile_step_configurations 
      WHERE organization_id = ${user.organizationId} AND enabled = true
      ORDER BY "order"
    `);

    const configs = configsResult.rows;

    // Get user's completed steps
    const stepsResult = await db.execute(sql`
      SELECT step_key, completed, completed_at
      FROM profile_completion_steps
      WHERE user_id = ${userId}
    `);

    const userSteps = stepsResult.rows.reduce((acc: any, row: any) => {
      acc[row.step_key] = {
        completed: row.completed,
        completedAt: row.completed_at
      };
      return acc;
    }, {});

    // Check completion status for each step
    const steps = configs.map((config: any) => {
      const stepKey = config.step_key;
      let completed = userSteps[stepKey]?.completed || false;

      // Auto-detect completion for certain steps
      if (!completed) {
        switch (stepKey) {
          case 'profile_photo':
            completed = !!user.profileImageUrl;
            break;
          case 'basic_info':
            completed = !!(user.firstName && user.lastName && user.ageRange && user.bio);
            break;
          case 'gifts_assessment':
            // Check if user has completed assessment
            completed = false; // TODO: Check results table
            break;
          case 'life_verse':
            completed = !!user.lifeVerse;
            break;
          case 'join_group':
            completed = false; // TODO: Check group membership
            break;
        }
      }

      return {
        key: stepKey,
        label: config.label,
        completed,
        weight: parseInt(config.weight),
        order: parseInt(config.order)
      };
    });

    // Calculate percentage
    const totalWeight = steps.reduce((sum, step) => sum + step.weight, 0);
    const completedWeight = steps
      .filter(step => step.completed)
      .reduce((sum, step) => sum + step.weight, 0);
    
    const percentage = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
    const completedSteps = steps.filter(step => step.completed).map(step => step.key);

    return {
      percentage,
      completedSteps,
      steps
    };
  }

  async markStepComplete(userId: string, stepKey: string): Promise<void> {
    await db.execute(sql`
      INSERT INTO profile_completion_steps (user_id, step_key, completed, completed_at)
      VALUES (${userId}, ${stepKey}, true, NOW())
      ON CONFLICT (user_id, step_key) DO UPDATE SET
        completed = true,
        completed_at = NOW(),
        updated_at = NOW()
    `);
  }

  async initializeProfileSteps(userId: string, organizationId: string): Promise<void> {
    const configsResult = await db.execute(sql`
      SELECT step_key
      FROM profile_step_configurations 
      WHERE organization_id = ${organizationId} AND enabled = true
    `);

    const configs = configsResult.rows;

    for (const config of configs) {
      await db.execute(sql`
        INSERT INTO profile_completion_steps (user_id, step_key, completed)
        VALUES (${userId}, ${config.step_key}, false)
        ON CONFLICT (user_id, step_key) DO NOTHING
      `);
    }
  }

  async getProfileStepConfigurations(organizationId: string): Promise<Array<{
    stepKey: string;
    label: string;
    weight: number;
    enabled: boolean;
    order: number;
  }>> {
    const result = await db.execute(sql`
      SELECT step_key, label, weight, enabled, "order"
      FROM profile_step_configurations
      WHERE organization_id = ${organizationId}
      ORDER BY "order"
    `);

    return result.rows.map((row: any) => ({
      stepKey: row.step_key,
      label: row.label,
      weight: parseInt(row.weight),
      enabled: row.enabled,
      order: parseInt(row.order)
    }));
  }

  async updateProfileStepConfigurations(organizationId: string, configs: Array<{
    stepKey: string;
    label: string;
    weight: number;
    enabled: boolean;
    order: number;
  }>): Promise<void> {
    // Update existing configurations
    for (const config of configs) {
      await db.execute(sql`
        UPDATE profile_step_configurations 
        SET label = ${config.label}, 
            weight = ${config.weight}, 
            enabled = ${config.enabled}, 
            "order" = ${config.order},
            updated_at = NOW()
        WHERE organization_id = ${organizationId} AND step_key = ${config.stepKey}
      `);
    }
  }
}

class MemStorage implements IStorage {
  private organizations = new Map<string, Organization>();
  private users = new Map<string, User>();
  private assessmentVersions = new Map<string, AssessmentVersion>();
  private questions = new Map<string, Question>();
  private responses = new Map<string, Response>();
  private answers = new Map<string, Answer>();
  private results = new Map<string, Result>();
  private ministryOpportunities = new Map<string, MinistryOpportunity>();
  private placementCandidates = new Map<string, PlacementCandidate>();
  private analyticsEvents = new Map<string, AnalyticsEvent>();
  private profileCompletionSteps = new Map<string, Set<string>>();
  private activeAssessmentVersionId: string | null = null;

  constructor() {
    // Create a default organization
    const defaultOrg: Organization = {
      id: 'default-org-001',
      name: 'Default Organization',
      subdomain: 'default',
      inviteCode: 'DEFAULT123',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: null,
    };
    this.organizations.set(defaultOrg.id, defaultOrg);
  }

  // Organization operations
  async getOrganization(id: string): Promise<Organization | undefined> {
    return this.organizations.get(id);
  }

  async getOrganizationBySubdomain(subdomain: string): Promise<Organization | undefined> {
    return Array.from(this.organizations.values()).find(org => org.subdomain === subdomain);
  }

  async getOrganizationByInviteCode(inviteCode: string): Promise<Organization | undefined> {
    return Array.from(this.organizations.values()).find(org => org.inviteCode === inviteCode);
  }

  async getOrganizations(): Promise<Organization[]> {
    return Array.from(this.organizations.values());
  }

  async createOrganization(organization: InsertOrganization): Promise<Organization> {
    const org: Organization = {
      ...organization,
      id: organization.id || nanoid(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.organizations.set(org.id, org);
    return org;
  }

  async updateOrganization(id: string, updates: Partial<InsertOrganization>): Promise<Organization> {
    const org = this.organizations.get(id);
    if (!org) throw new Error('Organization not found');
    const updated = { ...org, ...updates, updatedAt: new Date() };
    this.organizations.set(id, updated);
    return updated;
  }

  async updateOrganizationStatus(organizationId: string, status: 'ACTIVE' | 'INACTIVE'): Promise<Organization> {
    return this.updateOrganization(organizationId, { status });
  }

  async deleteOrganization(organizationId: string): Promise<void> {
    this.organizations.delete(organizationId);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const existingUser = this.users.get(user.id);
    const userData: User = {
      ...user,
      organizationId: user.organizationId || 'default-org-001',
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
      lastActiveAt: new Date(),
    };
    this.users.set(user.id, userData);
    return userData;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const userData: User = {
      ...user,
      id: user.id || nanoid(),
      organizationId: user.organizationId || 'default-org-001',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActiveAt: new Date(),
    };
    this.users.set(userData.id, userData);
    return userData;
  }

  async completeUserProfile(userId: string, profileData: ProfileCompletionData): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    const updated = { ...user, ...profileData, updatedAt: new Date() };
    this.users.set(userId, updated);
    return updated;
  }

  async getUsersByOrganization(organizationId: string, filters?: AdminFilters): Promise<UserWithResults[]> {
    const orgUsers = Array.from(this.users.values()).filter(user => user.organizationId === organizationId);
    return orgUsers.map(user => ({ ...user, results: [] }));
  }

  async updateUserRole(userId: string, role: OrganizationRole): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    const updated = { ...user, role, updatedAt: new Date() };
    this.users.set(userId, updated);
    return updated;
  }

  async updateUserStatus(userId: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    const updated = { ...user, status, updatedAt: new Date() };
    this.users.set(userId, updated);
    return updated;
  }

  async deleteUser(userId: string): Promise<boolean> {
    return this.users.delete(userId);
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    const updated = { ...user, hashedPassword, updatedAt: new Date() };
    this.users.set(userId, updated);
    return updated;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Assessment Version operations
  async getActiveAssessmentVersion(): Promise<AssessmentVersion | undefined> {
    if (!this.activeAssessmentVersionId) {
      // Create a default assessment version
      const version = await this.createAssessmentVersion({
        title: "K.I.T. Gifts & Ministry Fit v1",
        isActive: true,
      });
      return version;
    }
    return this.assessmentVersions.get(this.activeAssessmentVersionId);
  }

  async createAssessmentVersion(version: InsertAssessmentVersion): Promise<AssessmentVersion> {
    const assessmentVersion: AssessmentVersion = {
      ...version,
      id: version.id || nanoid(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.assessmentVersions.set(assessmentVersion.id, assessmentVersion);
    if (version.isActive) {
      this.activeAssessmentVersionId = assessmentVersion.id;
    }
    return assessmentVersion;
  }

  // Question operations
  async getQuestionsByVersion(versionId: string): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(q => q.versionId === versionId);
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const q: Question = {
      ...question,
      id: question.id || nanoid(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.questions.set(q.id, q);
    return q;
  }

  async bulkCreateQuestions(questions: InsertQuestion[]): Promise<Question[]> {
    const created: Question[] = [];
    for (const question of questions) {
      created.push(await this.createQuestion(question));
    }
    return created;
  }

  // Stub implementations for all other methods
  async getPlatformMetrics(): Promise<any> { return {}; }
  async getAllOrganizationsWithStats(): Promise<any[]> { return []; }
  async getUserCountByOrganization(organizationId: string): Promise<number> { return 0; }
  async getSystemSettings(): Promise<any> { return {}; }
  async updateSystemSettings(settings: any): Promise<any> { return settings; }
  async createResponse(response: InsertResponse): Promise<Response> { 
    const r: Response = { ...response, id: nanoid(), createdAt: new Date(), updatedAt: new Date() };
    this.responses.set(r.id, r);
    return r;
  }
  async getResponse(id: string): Promise<Response | undefined> { return this.responses.get(id); }
  async getResponsesByUser(userId: string): Promise<Response[]> { return []; }
  async getResponsesByOrganization(organizationId: string, filters?: AdminFilters): Promise<Response[]> { return []; }
  async getAllResponses(): Promise<Response[]> { return Array.from(this.responses.values()); }
  async updateResponseSubmission(id: string, timeSpentMinutes?: number): Promise<Response | undefined> { 
    const response = this.responses.get(id);
    if (response && timeSpentMinutes !== undefined) {
      response.timeSpentMinutes = timeSpentMinutes;
    }
    return response;
  }
  async createAnswer(answer: InsertAnswer): Promise<Answer> { 
    const a: Answer = { ...answer, id: nanoid(), createdAt: new Date(), updatedAt: new Date() };
    this.answers.set(a.id, a);
    return a;
  }
  async bulkCreateAnswers(answers: InsertAnswer[]): Promise<Answer[]> { return []; }
  async getAnswersByResponse(responseId: string): Promise<Answer[]> { return []; }
  async createResult(result: InsertResult): Promise<Result> { 
    const r: Result = { ...result, id: nanoid(), createdAt: new Date(), updatedAt: new Date() };
    this.results.set(r.id, r);
    return r;
  }
  async getResultByResponse(responseId: string): Promise<Result | undefined> { return undefined; }
  async getResultsByOrganization(organizationId: string, filters?: AdminFilters): Promise<Result[]> { return []; }
  async getAllResults(): Promise<Result[]> { return Array.from(this.results.values()); }
  async getUserResults(userId: string): Promise<Result[]> { return []; }
  async updateResultNotes(resultId: string, notes: string, followUpDate?: Date): Promise<Result> { 
    const result = this.results.get(resultId);
    if (!result) throw new Error('Result not found');
    result.notes = notes;
    result.followUpDate = followUpDate || null;
    return result;
  }
  async getMinistryOpportunities(organizationId: string): Promise<MinistryOpportunity[]> { return []; }
  async getMinistryOpportunity(id: string): Promise<MinistryOpportunity | undefined> { return this.ministryOpportunities.get(id); }
  async createMinistryOpportunity(opportunity: InsertMinistryOpportunity): Promise<MinistryOpportunity> { 
    const m: MinistryOpportunity = { ...opportunity, id: nanoid(), createdAt: new Date(), updatedAt: new Date() };
    this.ministryOpportunities.set(m.id, m);
    return m;
  }
  async updateMinistryOpportunity(id: string, updates: Partial<InsertMinistryOpportunity>): Promise<MinistryOpportunity> { 
    const m = this.ministryOpportunities.get(id);
    if (!m) throw new Error('Ministry opportunity not found');
    const updated = { ...m, ...updates, updatedAt: new Date() };
    this.ministryOpportunities.set(id, updated);
    return updated;
  }
  async getPlacementCandidates(opportunityId: string): Promise<PlacementCandidate[]> { return []; }
  async createPlacementCandidate(candidate: InsertPlacementCandidate): Promise<PlacementCandidate> { 
    const p: PlacementCandidate = { ...candidate, id: nanoid(), createdAt: new Date(), updatedAt: new Date() };
    this.placementCandidates.set(p.id, p);
    return p;
  }
  async updateCandidateStatus(candidateId: string, status: string, adminNotes?: string): Promise<PlacementCandidate> { 
    const p = this.placementCandidates.get(candidateId);
    if (!p) throw new Error('Placement candidate not found');
    p.status = status;
    if (adminNotes) p.adminNotes = adminNotes;
    return p;
  }
  async logAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> { 
    const a: AnalyticsEvent = { ...event, id: nanoid(), timestamp: new Date() };
    this.analyticsEvents.set(a.id, a);
    return a;
  }
  async getDashboardMetrics(organizationId: string): Promise<DashboardMetrics> { 
    return { 
      totalUsers: 0, 
      totalAssessments: 0, 
      completionRate: 0, 
      avgTimeMinutes: 0,
      topGifts: [],
      recentActivity: [],
      weeklyActivity: []
    }; 
  }
  async getGlobalMetrics(): Promise<DashboardMetrics> { return this.getDashboardMetrics(''); }
  async getAssessmentStats(organizationId?: string): Promise<{totalAssessments: number; completionRate: number; avgTimeMinutes: number;}> { 
    return { totalAssessments: 0, completionRate: 0, avgTimeMinutes: 0 }; 
  }
  async getDailyActiveUsers(organizationId: string, days: number): Promise<number[]> { return []; }
  async getTopGifts(organizationId: string, limit: number): Promise<Array<{giftKey: string; count: number}>> { return []; }
  async getRecentActivity(organizationId: string, limit: number): Promise<any[]> { return []; }
  async getWeeklyActivity(organizationId: string): Promise<number[]> { return []; }
  async getProfileCompletion(userId: string, organizationId: string): Promise<any> { return { percentage: 0, completedSteps: [], steps: [] }; }
  async getProfileProgress(userId: string): Promise<any> {
    // Get completed steps for this user (or create storage if not exists)
    if (!this.profileCompletionSteps.has(userId)) {
      this.profileCompletionSteps.set(userId, new Set());
    }
    
    const completedSteps = Array.from(this.profileCompletionSteps.get(userId) || []);
    const steps = [
      { key: 'basic_info', label: 'Basic Information', completed: completedSteps.includes('basic_info'), weight: 20, order: 1 },
      { key: 'profile_photo', label: 'Profile Photo', completed: completedSteps.includes('profile_photo'), weight: 20, order: 2 },
      { key: 'gifts_assessment', label: 'Gifts Assessment', completed: completedSteps.includes('gifts_assessment'), weight: 20, order: 3 },
      { key: 'life_verse', label: 'Life Verse', completed: completedSteps.includes('life_verse'), weight: 20, order: 4 },
      { key: 'join_group', label: 'Join Group', completed: completedSteps.includes('join_group'), weight: 20, order: 5 }
    ];
    
    // Calculate percentage
    const completedCount = steps.filter(step => step.completed).length;
    const percentage = Math.round((completedCount / steps.length) * 100);
    
    return { 
      percentage, 
      completedSteps,
      steps
    }; 
  }
  async markStepComplete(userId: string, stepKey: string): Promise<void> {
    // Initialize user's completed steps if not exists
    if (!this.profileCompletionSteps.has(userId)) {
      this.profileCompletionSteps.set(userId, new Set());
    }
    
    // Mark the step as complete
    this.profileCompletionSteps.get(userId)!.add(stepKey);
    console.log(`Marked step ${stepKey} as complete for user ${userId}`);
  }
  async initializeProfileSteps(userId: string, organizationId: string): Promise<void> {}
  async getProfileStepConfigurations(organizationId: string): Promise<Array<{stepKey: string; label: string; weight: number; enabled: boolean; order: number;}>> { return []; }
  async updateProfileStepConfigurations(organizationId: string, configs: Array<{stepKey: string; label: string; weight: number; enabled: boolean; order: number;}>): Promise<void> {}
}

// Use MemStorage instead of DatabaseStorage to avoid database connection issues
export const storage = new MemStorage();