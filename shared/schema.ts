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
export const roleEnum = pgEnum("role", ["ADMIN", "PARTICIPANT"]);

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

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  displayName: varchar("display_name"),
  ageRange: ageRangeEnum("age_range"),
  profileImageUrl: varchar("profile_image_url"),
  profileCompleted: boolean("profile_completed").default(false),
  role: roleEnum("role").default("PARTICIPANT"),
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
  versionId: varchar("version_id")
    .notNull()
    .references(() => assessmentVersions.id),
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
  scoresJson: json("scores_json").notNull(),
  top1GiftKey: giftKeyEnum("top1_gift_key").notNull(),
  top2GiftKey: giftKeyEnum("top2_gift_key").notNull(),
  top3GiftKey: giftKeyEnum("top3_gift_key").notNull(),
  ageGroups: json("age_groups").$type<string[]>().default([]),
  ministryInterests: json("ministry_interests").$type<string[]>().default([]),
  renderedHtml: text("rendered_html"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

// Types
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
