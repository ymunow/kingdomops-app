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
export const roleEnum = pgEnum("role", [
  "SUPER_ADMIN", 
  "CHURCH_SUPER_ADMIN", 
  "PASTORAL_STAFF", 
  "FINANCE_ADMIN", 
  "ASSIMILATION_DIRECTOR", 
  "MINISTRY_LEADER", 
  "ASSIMILATION_MEMBER", 
  "VOLUNTEER", 
  "CHURCH_MEMBER"
]);

// Role hierarchy for permission checking
export const ROLE_HIERARCHY = {
  SUPER_ADMIN: 100,           // Platform admin (KingdomOps admin)
  CHURCH_SUPER_ADMIN: 90,     // Senior Pastor, Executive Pastor, Operations Director
  PASTORAL_STAFF: 80,         // Pastors with shepherding responsibilities
  FINANCE_ADMIN: 70,          // Financial oversight and facilities management
  ASSIMILATION_DIRECTOR: 60,  // Visitor pipeline oversight
  MINISTRY_LEADER: 50,        // Department heads, ministry leaders
  ASSIMILATION_MEMBER: 30,    // Follow-up team members
  VOLUNTEER: 20,              // Team members with scheduling access
  CHURCH_MEMBER: 10,          // General attendees
} as const;

// Permission sets for different roles
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['all'],
  CHURCH_SUPER_ADMIN: [
    'kingdom_health_dashboard', 'approve_budgets', 'customize_assessments', 
    'manage_workflows', 'full_access', 'org_manage', 'users_manage', 
    'results_manage', 'placements_manage', 'export_data'
  ],
  PASTORAL_STAFF: [
    'assimilation_overview', 'discipleship_tracking', 'spiritual_gifts_reports', 
    'prayer_care_tracking', 'event_oversight', 'results_manage', 'placements_view'
  ],
  FINANCE_ADMIN: [
    'giving_dashboard', 'budget_tools', 'donor_reports', 'facilities_scheduling', 
    'hr_admin_tools', 'approve_budgets'
  ],
  ASSIMILATION_DIRECTOR: [
    'assimilation_dashboard', 'assign_tasks', 'track_metrics', 'event_planning', 
    'oversee_newcomer_events', 'progress_reports'
  ],
  MINISTRY_LEADER: [
    'event_planning', 'team_management', 'member_insights', 'event_dashboard', 
    'resource_uploads', 'volunteer_schedule', 'team_resources', 'internal_chat',
    'results_view', 'placements_view', 'placements_manage'
  ],
  ASSIMILATION_MEMBER: [
    'task_list', 'log_notes', 'limited_event_tools', 'communication_tools'
  ],
  VOLUNTEER: [
    'volunteer_schedule', 'team_resources', 'internal_chat', 'personal_profile', 
    'spiritual_gifts_personal', 'serving_opportunities', 'events_view', 'giving_personal'
  ],
  CHURCH_MEMBER: [
    'personal_profile', 'spiritual_gifts_personal', 'serving_opportunities', 
    'events_view', 'giving_personal', 'content_hub', 'groups_community', 'assessment_take'
  ],
} as const;

// Legacy role mappings for backward compatibility
export const LEGACY_ROLES = {
  ADMIN: 'FINANCE_ADMIN',
  ORG_ADMIN: 'FINANCE_ADMIN',
  ORG_LEADER: 'MINISTRY_LEADER',
  ORG_VIEWER: 'VOLUNTEER',
  ORG_OWNER: 'CHURCH_SUPER_ADMIN',
  PARTICIPANT: 'CHURCH_MEMBER',
} as const;

export const organizationStatusEnum = pgEnum("organization_status", ["PENDING", "APPROVED", "DENIED", "ACTIVE", "INACTIVE", "TRIAL"]);

export const applicationStatusEnum = pgEnum("application_status", ["PENDING", "APPROVED", "REJECTED"]);

export const placementStatusEnum = pgEnum("placement_status", ["OPEN", "FILLED", "CLOSED"]);

export const candidateStatusEnum = pgEnum("candidate_status", ["PENDING", "INVITED", "PLACED", "DECLINED"]);

export const profileStepEnum = pgEnum("profile_step", [
  "profile_photo", 
  "basic_info", 
  "gifts_assessment", 
  "life_verse", 
  "join_group"
]);

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

// Natural abilities and skills enums
export const naturalAbilityEnum = pgEnum("natural_ability", [
  // Arts
  "ARTS_ARTIST",
  "ARTS_BASS_GUITAR",
  "ARTS_DANCE",
  "ARTS_DIRECTOR",
  "ARTS_DRAMA",
  "ARTS_DRUMS",
  "ARTS_GUITAR",
  "ARTS_KEYBOARD_PIANO",
  "ARTS_LEAD_WORSHIP",
  "ARTS_LIGHTING",
  "ARTS_MEDIA_GRAPHICS",
  "ARTS_MUSIC_OTHER",
  "ARTS_PHOTOGRAPHY",
  "ARTS_PRODUCTION",
  "ARTS_SLIDES",
  "ARTS_SOUND_TECH",
  "ARTS_VIDEO",
  "ARTS_VOCALIST",
  "ARTS_WRITER",
  
  // Skills
  "SKILL_BUS_DRIVER",
  "SKILL_BUSINESS_MANAGEMENT",
  "SKILL_CARPENTRY",
  "SKILL_CHILD_CARE",
  "SKILL_CLEANING",
  "SKILL_CONSTRUCTION",
  "SKILL_COOKING",
  "SKILL_COUNSELING",
  "SKILL_CUSTOMER_SERVICE",
  "SKILL_EDUCATION",
  "SKILL_ELECTRICIAN",
  "SKILL_EVENT_COORDINATION",
  "SKILL_FINANCIAL",
  "SKILL_HOSPITALITY_INDUSTRY",
  "SKILL_MARKETING_COMM",
  "SKILL_MECHANIC",
  "SKILL_MECHANICAL",
  "SKILL_MEDIA_GRAPHICS",
  "SKILL_MEDICAL",
  "SKILL_OFFICE",
  "SKILL_PAINTER",
  "SKILL_PEOPLE",
  "SKILL_PROJECT_MANAGEMENT",
  "SKILL_SECURITY",
  "SKILL_SETUP_TEARDOWN",
  "SKILL_SPA_SERVICES",
  "SKILL_TECH_COMPUTERS",
  "SKILL_TRANSLATOR",
  
  // Sports
  "SPORTS_ATHLETE",
  "SPORTS_COACH",
  "SPORTS_OFFICIAL",
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
  inviteCode: varchar("invite_code").unique().notNull(), // Required unique church invite code
  contactEmail: varchar("contact_email"),
  website: varchar("website"),
  address: text("address"),
  description: text("description"),
  status: organizationStatusEnum("status").default("PENDING"),
  deniedReason: text("denied_reason"),
  reviewedBy: varchar("reviewed_by").references(() => users.id), // Admin who reviewed the application
  approvedAt: timestamp("approved_at"),
  deniedAt: timestamp("denied_at"),
  settings: jsonb("settings").default({}), // Custom settings per org
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Church Applications table - separate from organizations for proper review workflow
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  status: applicationStatusEnum("status").default("PENDING"),
  
  // Church Information
  churchName: varchar("church_name").notNull(),
  primaryContact: varchar("primary_contact").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  subdomain: varchar("subdomain"), // Requested subdomain
  
  // Application Data
  answers: jsonb("answers").default({}), // All application form answers
  attachments: jsonb("attachments").default({}), // File uploads and documents
  
  // Review Information
  reviewedById: varchar("reviewed_by_id").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  decisionNotes: text("decision_notes"),
  
  // Link to created organization (only set upon approval)
  organizationId: varchar("organization_id").unique().references(() => organizations.id),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_applications_status").on(table.status),
  index("idx_applications_email").on(table.email),
]);

// Waitlist for rejected churches who want to be notified when platform launches
export const waitlistChurches = pgTable("waitlist_churches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orgId: varchar("org_id").references(() => organizations.id, { onDelete: "set null" }),
  churchName: varchar("church_name").notNull(),
  contactEmail: varchar("contact_email").notNull(),
  source: varchar("source").default("beta_rejected"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_waitlist_email_church").on(table.contactEmail, table.churchName),
]);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").references(() => organizations.id),
  email: varchar("email").unique(),
  password: varchar("password"), // Supabase compatibility
  emailVerified: boolean("email_verified"), // Supabase compatibility
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  displayName: varchar("display_name"),
  ageRange: ageRangeEnum("age_range"),
  profileImageUrl: varchar("profile_image_url"),
  coverPhotoUrl: varchar("cover_photo_url"),
  profileCompleted: boolean("profile_completed").default(false),
  bio: text("bio"), // User bio/description
  lifeVerse: text("life_verse"), // User's favorite scripture
  role: roleEnum("role").default("CHURCH_MEMBER"),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Profile completion steps tracking
export const profileCompletionSteps = pgTable("profile_completion_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  stepKey: profileStepEnum("step_key").notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_profile_steps_user").on(table.userId),
  index("idx_profile_steps_user_step").on(table.userId, table.stepKey),
]);

// Profile completion configuration for admin
export const profileStepConfigurations = pgTable("profile_step_configurations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organizations.id),
  stepKey: profileStepEnum("step_key").notNull(),
  label: varchar("label").notNull(),
  weight: integer("weight").notNull().default(20), // Percentage weight (total must equal 100)
  enabled: boolean("enabled").default(true),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_step_config_org").on(table.organizationId),
]);

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
  naturalAbilities: json("natural_abilities").$type<string[]>().default([]),
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
  requiredAbilities: json("required_abilities").$type<string[]>().default([]),
  preferredAbilities: json("preferred_abilities").$type<string[]>().default([]),
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

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reviewedAt: true,
  organizationId: true,
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

// Add Connect permissions to role permissions
export const CONNECT_PERMISSIONS = {
  SUPER_ADMIN: ['all_connect'],
  CHURCH_SUPER_ADMIN: [
    'create_church_posts', 'moderate_all', 'manage_groups', 'create_events', 
    'create_serve_roles', 'feature_toggles', 'view_reports'
  ],
  PASTORAL_STAFF: [
    'create_church_posts', 'moderate_church', 'pin_announcements', 
    'create_events', 'view_reports'
  ],
  FINANCE_ADMIN: [
    'create_posts', 'comment_react', 'create_events', 'view_groups'
  ],
  ASSIMILATION_DIRECTOR: [
    'create_newcomer_posts', 'moderate_newcomer', 'create_events', 
    'manage_newcomer_groups'
  ],
  MINISTRY_LEADER: [
    'create_group_posts', 'manage_own_groups', 'create_group_events', 
    'create_serve_roles', 'moderate_own_groups'
  ],
  ASSIMILATION_MEMBER: [
    'create_posts', 'comment_react', 'view_groups', 'newcomer_groups_only'
  ],
  VOLUNTEER: [
    'create_posts', 'comment_react', 'view_groups', 'apply_serve_roles'
  ],
  CHURCH_MEMBER: [
    'create_posts', 'comment_react', 'view_groups', 'apply_serve_roles', 
    'create_testimonies', 'create_prayers'
  ],
} as const;

// Types
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

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

// Feed-specific types for ranking and filtering
export type FeedPostWithAuthor = Post & {
  author?: User;
  userReaction?: PostReaction;
  isUserFollowing?: boolean;
  userGroups?: string[];
};

export type FeedFilters = {
  scope?: 'church' | 'group' | 'personal';
  type?: typeof postTypeEnum.enumValues[number];
  groupId?: string;
  authorId?: string;
  limit?: number;
  offset?: number;
};

// KingdomOps Connect Enums
export const postTypeEnum = pgEnum("post_type", [
  "announcement",
  "testimony", 
  "prayer",
  "event",
  "volunteer",
  "photo",
  "video",
  "link",
  "poll",
  "group_post",
  "digest"
]);

export const postScopeEnum = pgEnum("post_scope", [
  "church",
  "group", 
  "personal"
]);

export const postVisibilityEnum = pgEnum("post_visibility", [
  "public",
  "members",
  "leaders", 
  "group_members"
]);

export const postAudienceTypeEnum = pgEnum("post_audience_type", [
  "church",
  "group", 
  "event",
  "leaders_only",
  "custom"
]);

export const reactionTypeEnum = pgEnum("reaction_type", [
  "like",
  "heart",
  "pray"
]);

export const groupVisibilityEnum = pgEnum("group_visibility", [
  "public",
  "private", 
  "secret"
]);

export const groupMemberRoleEnum = pgEnum("group_member_role", [
  "member",
  "moderator",
  "admin"
]);

export const eventRsvpStatusEnum = pgEnum("event_rsvp_status", [
  "going",
  "interested",
  "cant"
]);

export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "reviewed",
  "resolved",
  "dismissed"
]);

export const reportTargetTypeEnum = pgEnum("report_target_type", [
  "post",
  "comment", 
  "user",
  "group",
  "event"
]);

// KingdomOps Connect Tables

// Posts - Core content system (Enhanced for Feed specification)
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organizations.id),
  authorId: varchar("author_id")
    .references(() => users.id), // Nullable for system-generated posts
  type: postTypeEnum("type").notNull(),
  
  // Feed-specific fields
  scope: postScopeEnum("scope").notNull().default("church"),
  visibility: postVisibilityEnum("visibility").notNull().default("members"),
  groupId: varchar("group_id"), // References groups table for group-scoped posts
  
  // Audience configuration (legacy, keeping for backward compatibility)
  audienceType: postAudienceTypeEnum("audience_type").default("church"),
  audienceGroupId: varchar("audience_group_id"),
  audienceEventId: varchar("audience_event_id"),
  audienceCustomList: json("audience_custom_list").$type<string[]>().default([]),
  
  // Content
  title: varchar("title"),
  body: text("body"),
  payload: jsonb("payload").default({}), // Flexible data for different post types
  media: jsonb("media").default({}), // {images: [], videos: [], files: []}
  poll: jsonb("poll").default({}), // {question: string, options: [], votes: {}}
  
  // Metadata and ranking
  isPinned: boolean("is_pinned").default(false),
  isHidden: boolean("is_hidden").default(false),
  reactionCounts: jsonb("reaction_counts").default({}), // {like: 0, heart: 0, pray: 0}
  commentCount: integer("comment_count").default(0),
  engagementScore: integer("engagement_score").default(0), // For ranking algorithm
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_posts_org_scope").on(table.organizationId, table.scope),
  index("idx_posts_group").on(table.groupId),
  index("idx_posts_engagement").on(table.engagementScore),
  index("idx_posts_created").on(table.createdAt),
]);

// Post reactions
export const postReactions = pgTable("post_reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  type: reactionTypeEnum("type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Post comments (with threading support)
export const postComments = pgTable("post_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  parentId: varchar("parent_id"), // For threading - self-reference
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  body: text("body").notNull(),
  media: jsonb("media").default({}), // Support for image replies
  reactionCounts: jsonb("reaction_counts").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Groups for community organization
export const groups = pgTable("groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organizations.id),
  name: varchar("name").notNull(),
  description: text("description"),
  bannerImageUrl: varchar("banner_image_url"),
  visibility: groupVisibilityEnum("visibility").default("public"),
  memberCount: integer("member_count").default(0),
  createdBy: varchar("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Group membership
export const groupMembers = pgTable("group_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  role: groupMemberRoleEnum("role").default("member"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced events with social features
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organizations.id),
  groupId: varchar("group_id").references(() => groups.id), // Optional group association
  title: varchar("title").notNull(),
  description: text("description"),
  coverImageUrl: varchar("cover_image_url"),
  
  // Timing
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at"),
  
  // Location
  location: text("location"),
  isVirtual: boolean("is_virtual").default(false),
  meetingPlatform: varchar("meeting_platform"), // "zoom", "teams", "google_meet", etc.
  meetingUrl: text("meeting_url"), // Public join link
  meetingPasscode: varchar("meeting_passcode"),
  hostMeetingUrl: text("host_meeting_url"), // Private host link
  
  // Registration
  requiresRegistration: boolean("requires_registration").default(false),
  maxAttendees: integer("max_attendees"),
  registrationDeadline: timestamp("registration_deadline"),
  
  // Visibility & metadata
  visibility: varchar("visibility").default("church"), // "church", "group", "public"
  rsvpCount: jsonb("rsvp_count").default({}), // {going: 0, interested: 0, cant: 0}
  registrationCount: integer("registration_count").default(0),
  
  createdBy: varchar("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event RSVPs
export const eventRsvps = pgTable("event_rsvps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  status: eventRsvpStatusEnum("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event registrations (for ticketed/managed events)
export const eventRegistrations = pgTable("event_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  tickets: integer("tickets").default(1),
  registrationData: jsonb("registration_data").default({}), // Custom form fields
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced serving roles (extending existing ministry opportunities)
export const servingRoles = pgTable("serving_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organizations.id),
  ministry: varchar("ministry").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  requiredGifts: json("required_gifts").$type<string[]>().default([]),
  preferredGifts: json("preferred_gifts").$type<string[]>().default([]),
  requiredAbilities: json("required_abilities").$type<string[]>().default([]),
  timeCommitment: varchar("time_commitment"),
  isOpen: boolean("is_open").default(true),
  createdBy: varchar("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Role applications for serve central
export const roleApplications = pgTable("role_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roleId: varchar("role_id")
    .notNull()
    .references(() => servingRoles.id),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  status: varchar("status").default("pending"), // "pending", "approved", "declined"
  note: text("note"), // Application message from user
  adminResponse: text("admin_response"), // Response from ministry leader
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Prayer posts (specialized post tracking)
export const prayers = pgTable("prayers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  prayedCount: integer("prayed_count").default(0),
  isSensitive: boolean("is_sensitive").default(false), // Restricts resharing
  createdAt: timestamp("created_at").defaultNow(),
});

// Prayer interactions (who prayed)
export const prayerInteractions = pgTable("prayer_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  prayerId: varchar("prayer_id")
    .notNull()
    .references(() => prayers.id, { onDelete: "cascade" }),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Content moderation and reports
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organizations.id),
  targetType: reportTargetTypeEnum("target_type").notNull(),
  targetId: varchar("target_id").notNull(), // ID of the reported content
  reporterId: varchar("reporter_id")
    .notNull()
    .references(() => users.id),
  reason: varchar("reason").notNull(),
  description: text("description"),
  status: reportStatusEnum("status").default("pending"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  action: varchar("action"), // "hide", "delete", "warn", "dismiss"
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications for Connect features
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => organizations.id),
  type: varchar("type").notNull(), // "mention", "reply", "event_reminder", "application_update"
  title: varchar("title").notNull(),
  message: text("message"),
  actionUrl: varchar("action_url"), // Deep link to relevant content
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

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
  naturalAbilities: string[];
};

export type ScoreResult = {
  totals: Record<GiftKey, number>;
  top3: GiftKey[];
};

// Admin dashboard types
export type OrganizationRole = "SUPER_ADMIN" | "CHURCH_SUPER_ADMIN" | "PASTORAL_STAFF" | "FINANCE_ADMIN" | "ASSIMILATION_DIRECTOR" | "MINISTRY_LEADER" | "ASSIMILATION_MEMBER" | "VOLUNTEER" | "CHURCH_MEMBER";

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

// Connect insert schemas
export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reactionCounts: true,
  commentCount: true,
});

export const insertPostReactionSchema = createInsertSchema(postReactions).omit({
  id: true,
  createdAt: true,
});

export const insertPostCommentSchema = createInsertSchema(postComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reactionCounts: true,
});

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  memberCount: true,
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).omit({
  id: true,
  createdAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rsvpCount: true,
  registrationCount: true,
});

export const insertEventRsvpSchema = createInsertSchema(eventRsvps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).omit({
  id: true,
  createdAt: true,
});

export const insertServingRoleSchema = createInsertSchema(servingRoles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRoleApplicationSchema = createInsertSchema(roleApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPrayerSchema = createInsertSchema(prayers).omit({
  id: true,
  createdAt: true,
});

export const insertPrayerInteractionSchema = createInsertSchema(prayerInteractions).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Connect types
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type PostReaction = typeof postReactions.$inferSelect;
export type InsertPostReaction = z.infer<typeof insertPostReactionSchema>;

export type PostComment = typeof postComments.$inferSelect;
export type InsertPostComment = z.infer<typeof insertPostCommentSchema>;

export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;

export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type EventRsvp = typeof eventRsvps.$inferSelect;
export type InsertEventRsvp = z.infer<typeof insertEventRsvpSchema>;

export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;

export type ServingRole = typeof servingRoles.$inferSelect;
export type InsertServingRole = z.infer<typeof insertServingRoleSchema>;

export type RoleApplication = typeof roleApplications.$inferSelect;
export type InsertRoleApplication = z.infer<typeof insertRoleApplicationSchema>;

export type Prayer = typeof prayers.$inferSelect;
export type InsertPrayer = z.infer<typeof insertPrayerSchema>;

export type PrayerInteraction = typeof prayerInteractions.$inferSelect;
export type InsertPrayerInteraction = z.infer<typeof insertPrayerInteractionSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Extended types for Connect features
export type PostType = "announcement" | "testimony" | "prayer" | "event" | "serve_opportunity" | "photo" | "video" | "link" | "poll";
export type PostAudienceType = "church" | "group" | "event" | "leaders_only" | "custom";
export type ReactionType = "like" | "heart" | "pray";
export type GroupVisibility = "public" | "private" | "secret";
export type GroupMemberRole = "member" | "moderator" | "admin";
export type EventRsvpStatus = "going" | "interested" | "cant";
export type ReportStatus = "pending" | "reviewed" | "resolved" | "dismissed";
export type ReportTargetType = "post" | "comment" | "user" | "group" | "event";

// Feed and dashboard types
export type FeedPost = Post & {
  author: Pick<User, 'id' | 'firstName' | 'lastName' | 'displayName' | 'profileImageUrl' | 'role'>;
  group?: Pick<Group, 'id' | 'name'>;
  event?: Pick<Event, 'id' | 'title'>;
  prayer?: Prayer;
  userReaction?: PostReaction;
  topComments?: (PostComment & {
    author: Pick<User, 'id' | 'firstName' | 'lastName' | 'displayName' | 'profileImageUrl'>;
  })[];
};

// Profile completion types
export type ProfileCompletionStep = typeof profileCompletionSteps.$inferSelect;
export type InsertProfileCompletionStep = typeof profileCompletionSteps.$inferInsert;
export type ProfileStepConfiguration = typeof profileStepConfigurations.$inferSelect;
export type InsertProfileStepConfiguration = typeof profileStepConfigurations.$inferInsert;

export type WaitlistChurch = typeof waitlistChurches.$inferSelect;
export type InsertWaitlistChurch = typeof waitlistChurches.$inferInsert;

// Profile completion progress data structure
export type ProfileProgress = {
  percentage: number;
  completedSteps: string[];
  steps: {
    key: string;
    label: string;
    completed: boolean;
    weight: number;
    order: number;
  }[];
};

export type DashboardData = {
  greeting: {
    name: string;
    time: string;
  };
  primaryCta: {
    type: 'take_assessment' | 'view_gifts' | 'complete_profile';
    title: string;
    description: string;
    action: string;
  };
  serveHighlights: {
    id: string;
    title: string;
    ministry: string;
    matchScore: number;
    requiredGifts: string[];
  }[];
  upcomingEvents: (Event & {
    rsvpStatus?: EventRsvpStatus;
    isRegistered?: boolean;
  })[];
  givingCard: {
    lastGift?: {
      amount: number;
      date: string;
    };
    recurringSetup: boolean;
  };
  connectTeaser: FeedPost[];
};
