import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  json,
  pgEnum,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum("role", ["SUPER_ADMIN", "ORG_OWNER", "ORG_ADMIN", "ORG_LEADER", "ORG_VIEWER", "PARTICIPANT"]);

// Role hierarchy for permission checking
export const ROLE_HIERARCHY = {
  SUPER_ADMIN: 100,
  ORG_OWNER: 80,
  ORG_ADMIN: 60,
  ORG_LEADER: 40,
  ORG_VIEWER: 20,
  PARTICIPANT: 10,
} as const;

// Permission sets for different roles
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['all'],
  ORG_OWNER: ['org_manage', 'org_view', 'users_manage', 'results_manage', 'placements_manage', 'export_data'],
  ORG_ADMIN: ['users_manage', 'results_manage', 'placements_manage', 'export_data'],
  ORG_LEADER: ['results_view', 'placements_view', 'placements_manage'],
  ORG_VIEWER: ['results_view'],
  PARTICIPANT: ['assessment_take'],
} as const;

export const organizationStatusEnum = pgEnum("organization_status", ["ACTIVE", "INACTIVE", "TRIAL"]);

export const placementStatusEnum = pgEnum("placement_status", ["OPEN", "FILLED", "CLOSED"]);

export const candidateStatusEnum = pgEnum("candidate_status", ["PENDING", "INVITED", "PLACED", "DECLINED"]);

export const giftKeyEnum = pgEnum("gift_key", [
  "LEADERSHIP_ORG",
  "TEACHING",
  "WISDOM_INSIGHT",
  "PROPHETIC_DISCERNMENT",
  "EXHORTATION",
  "SHEPHERDING",
  "FAITH",
  "EVANGELISM",
  "APOSTLESHIP",
  "SERVICE_HOSPITALITY",
  "MERCY",
  "GIVING",
]);

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Age range enum for profile
export const ageRangeEnum = pgEnum("age_range", [
  "18-25",
  "26-35", 
  "36-45",
  "46-55",
  "56-65",
  "66+"
]);

// Organizations/Churches table
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  subdomain: varchar("subdomain").unique(), // Optional custom subdomain
  contactEmail: varchar("contact_email"),
  website: varchar("website"),
  address: text("address"),
  description: text("description"),
  status: organizationStatusEnum("status").default("ACTIVE"),
  settings: jsonb("settings").default({}), // Custom settings per org
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").references(() => organizations.id),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  displayName: varchar("display_name"),
  ageRange: ageRangeEnum("age_range"),
  profileImageUrl: varchar("profile_image_url"),
  profileCompleted: boolean("profile_completed").default(false),
  role: roleEnum("role").default("PARTICIPANT"),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const assessmentVersions = pgTable("assessment_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  versionId: varchar("version_id")
    .notNull()
    .references(() => assessmentVersions.id),
  text: text("text").notNull(),
  giftKey: giftKeyEnum("gift_key").notNull(),
  orderIndex: integer("order_index").notNull(),
  isActive: boolean("is_active").default(true),
});

export const responses = pgTable("responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  organizationId: varchar("organization_id")
    .references(() => organizations.id),
  versionId: varchar("version_id")
    .notNull()
    .references(() => assessmentVersions.id),
  timeSpentMinutes: integer("time_spent_minutes"), // Track completion time
  dropOffQuestionId: varchar("drop_off_question_id"), // Track where users stopped
  startedAt: timestamp("started_at").defaultNow(),
  submittedAt: timestamp("submitted_at"),
});

export const answers = pgTable("answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  responseId: varchar("response_id")
    .notNull()
    .references(() => responses.id),
  questionId: varchar("question_id")
    .notNull()
    .references(() => questions.id),
  value: integer("value").notNull(),
});

export const results = pgTable("results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  responseId: varchar("response_id")
    .notNull()
    .references(() => responses.id),
  organizationId: varchar("organization_id")
    .references(() => organizations.id),
  scoresJson: json("scores_json").notNull(),
  top1GiftKey: giftKeyEnum("top1_gift_key").notNull(),
  top2GiftKey: giftKeyEnum("top2_gift_key").notNull(),
  top3GiftKey: giftKeyEnum("top3_gift_key").notNull(),
  ageGroups: json("age_groups").$type<string[]>().default([]),
  ministryInterests: json("ministry_interests").$type<string[]>().default([]),
  renderedHtml: text("rendered_html"),
  notes: text("notes"), // Admin notes
  followUpDate: timestamp("follow_up_date"), // Follow-up scheduling
  placementStatus: varchar("placement_status").default("UNPLACED"), // Placement tracking
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

// Ministry Opportunities (for placement system)
export const ministryOpportunities = pgTable("ministry_opportunities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organizations.id),
  title: varchar("title").notNull(),
  description: text("description"),
  requiredGifts: json("required_gifts").$type<string[]>().default([]),
  preferredGifts: json("preferred_gifts").$type<string[]>().default([]),
  capacity: integer("capacity").default(1),
  currentCount: integer("current_count").default(0),
  ageGroupPreference: json("age_group_preference").$type<string[]>().default([]),
  timeCommitment: varchar("time_commitment"),
  contactPerson: varchar("contact_person"),
  contactEmail: varchar("contact_email"),
  status: placementStatusEnum("status").default("OPEN"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Placement candidates (linking people to opportunities)
export const placementCandidates = pgTable("placement_candidates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  opportunityId: varchar("opportunity_id")
    .notNull()
    .references(() => ministryOpportunities.id),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  resultId: varchar("result_id")
    .references(() => results.id),
  status: candidateStatusEnum("status").default("PENDING"),
  matchScore: integer("match_score"), // Algorithm-calculated match percentage
  adminNotes: text("admin_notes"),
  invitedAt: timestamp("invited_at"),
  respondedAt: timestamp("responded_at"),
  placedAt: timestamp("placed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Analytics tracking events
export const analyticsEvents = pgTable("analytics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id")
    .references(() => organizations.id),
  userId: varchar("user_id")
    .references(() => users.id),
  eventType: varchar("event_type").notNull(), // assessment_started, assessment_completed, page_view, etc.
  eventData: jsonb("event_data").default({}),
  sessionId: varchar("session_id"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastActiveAt: true,
});

export const profileCompletionSchema = createInsertSchema(users).pick({
  firstName: true,
  lastName: true,
  displayName: true,
  ageRange: true,
}).extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  displayName: z.string().min(1, "Display name is required"),
  ageRange: z.enum(["18-25", "26-35", "36-45", "46-55", "56-65", "66+"], {
    required_error: "Please select an age range"
  })
});

export const insertAssessmentVersionSchema = createInsertSchema(
  assessmentVersions
).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

export const insertResponseSchema = createInsertSchema(responses).omit({
  id: true,
  startedAt: true,
});

export const insertAnswerSchema = createInsertSchema(answers).omit({
  id: true,
});

export const insertResultSchema = createInsertSchema(results).omit({
  id: true,
  createdAt: true,
});

export const insertMinistryOpportunitySchema = createInsertSchema(ministryOpportunities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlacementCandidateSchema = createInsertSchema(placementCandidates).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({
  id: true,
  createdAt: true,
});

// Types
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;

export type AssessmentVersion = typeof assessmentVersions.$inferSelect;
export type InsertAssessmentVersion = z.infer<
  typeof insertAssessmentVersionSchema
>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type Response = typeof responses.$inferSelect;
export type InsertResponse = z.infer<typeof insertResponseSchema>;

export type Answer = typeof answers.$inferSelect;
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;

export type Result = typeof results.$inferSelect;
export type InsertResult = z.infer<typeof insertResultSchema>;

export type MinistryOpportunity = typeof ministryOpportunities.$inferSelect;
export type InsertMinistryOpportunity = z.infer<typeof insertMinistryOpportunitySchema>;

export type PlacementCandidate = typeof placementCandidates.$inferSelect;
export type InsertPlacementCandidate = z.infer<typeof insertPlacementCandidateSchema>;

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;

// Additional types for frontend
export type GiftKey =
  | "LEADERSHIP_ORG"
  | "TEACHING"
  | "WISDOM_INSIGHT"
  | "PROPHETIC_DISCERNMENT"
  | "EXHORTATION"
  | "SHEPHERDING"
  | "FAITH"
  | "EVANGELISM"
  | "APOSTLESHIP"
  | "SERVICE_HOSPITALITY"
  | "MERCY"
  | "GIVING";

export type AgeRange = "18-25" | "26-35" | "36-45" | "46-55" | "56-65" | "66+";

export type ProfileCompletionData = {
  firstName: string;
  lastName: string;
  displayName: string;
  ageRange: AgeRange;
};

export type AssessmentState = {
  currentStep: number;
  answers: Record<string, number>;
  ageGroups: string[];
  ministryInterests: string[];
};

export type ScoreResult = {
  totals: Record<GiftKey, number>;
  top3: GiftKey[];
};

// Admin dashboard types
export type OrganizationRole = "SUPER_ADMIN" | "ORG_OWNER" | "ORG_ADMIN" | "ORG_LEADER" | "ORG_VIEWER" | "PARTICIPANT";

export type DashboardMetrics = {
  totalCompletions: number;
  completionsLast30Days: number;
  averageTimeMinutes: number;
  dropOffRate: number;
  topGiftDistribution: Record<GiftKey, number>;
  ageGroupDistribution: Record<string, number>;
  weeklyCompletions: { week: string; count: number }[];
};

export type UserWithResults = User & {
  latestResult?: Result;
  totalAssessments: number;
  lastSubmission?: Date;
};

export type AdminFilters = {
  dateRange?: { start: Date; end: Date };
  status?: string;
  giftKey?: GiftKey;
  ageRange?: AgeRange;
  ministryInterests?: string[];
};

export type PlacementMatch = {
  user: User;
  result: Result;
  opportunity: MinistryOpportunity;
  matchScore: number;
  reasons: string[];
};
