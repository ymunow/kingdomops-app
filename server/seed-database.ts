import { db } from "./db";
import { 
  users, 
  organizations, 
  assessmentVersions, 
  questions, 
  type InsertOrganization, 
  type InsertUser, 
  type InsertAssessmentVersion, 
  type InsertQuestion 
} from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  console.log("🌱 Starting database seeding...");
  
  try {
    // 1. Create default organization first
    const defaultOrgData: InsertOrganization = {
      id: "default-org-001",
      name: "Default Organization",
      description: "Default organization for initial setup",
      contactEmail: "admin@example.com",
      inviteCode: "DEF1001",
      status: "ACTIVE",
      settings: {
        requireApproval: false,
        emailNotifications: true,
        allowSelfRegistration: true
      }
    };

    // Check if organization exists
    const [existingOrg] = await db.select().from(organizations).where(eq(organizations.id, defaultOrgData.id));
    let defaultOrg;
    
    if (!existingOrg) {
      [defaultOrg] = await db.insert(organizations).values(defaultOrgData).returning();
      console.log("✓ Default organization created");
    } else {
      defaultOrg = existingOrg;
      console.log("✓ Default organization already exists");
    }

    // 2. Create default assessment version
    const defaultVersionData: InsertAssessmentVersion = {
      id: "version-1.0",
      title: "Spiritual Gifts Assessment v1.0",
      description: "Comprehensive 60-question spiritual gifts assessment",
      isActive: true
    };

    const [existingVersion] = await db.select().from(assessmentVersions).where(eq(assessmentVersions.id, defaultVersionData.id));
    let defaultVersion;

    if (!existingVersion) {
      [defaultVersion] = await db.insert(assessmentVersions).values(defaultVersionData).returning();
      console.log("✓ Default assessment version created");
    } else {
      defaultVersion = existingVersion;
      console.log("✓ Default assessment version already exists");
    }

    // 3. Create sample questions (just a few for testing)
    const sampleQuestions: InsertQuestion[] = [
      {
        versionId: defaultVersion.id,
        text: "I enjoy organizing events and bringing people together for a common purpose.",
        giftKey: "LEADERSHIP_ORG",
        orderIndex: 1
      },
      {
        versionId: defaultVersion.id,
        text: "I find great satisfaction in explaining biblical concepts to others.",
        giftKey: "TEACHING",
        orderIndex: 2
      },
      {
        versionId: defaultVersion.id,
        text: "I often receive insights about situations that help guide important decisions.",
        giftKey: "WISDOM_INSIGHT",
        orderIndex: 3
      },
      {
        versionId: defaultVersion.id,
        text: "I can sense when something is not spiritually right in a situation.",
        giftKey: "PROPHETIC_DISCERNMENT",
        orderIndex: 4
      },
      {
        versionId: defaultVersion.id,
        text: "I love encouraging others and helping them see their potential.",
        giftKey: "EXHORTATION",
        orderIndex: 5
      }
    ];

    // Check if questions exist
    const existingQuestions = await db.select().from(questions).where(eq(questions.versionId, defaultVersion.id));
    
    if (existingQuestions.length === 0) {
      await db.insert(questions).values(sampleQuestions);
      console.log(`✓ ${sampleQuestions.length} sample questions created`);
    } else {
      console.log(`✓ Questions already exist (${existingQuestions.length} found)`);
    }

    // 4. Ensure super admin user exists
    const superAdminEmail = "tgray@graymusicmedia.com";
    const [existingAdmin] = await db.select().from(users).where(eq(users.email, superAdminEmail));

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("TempPass123!", 10);
      const adminData: InsertUser = {
        id: "super-admin-001",
        email: superAdminEmail,
        firstName: "Super",
        lastName: "Admin",
        displayName: "Super Admin",
        role: "SUPER_ADMIN",
        organizationId: defaultOrg.id,
        password: hashedPassword,
        emailVerified: true,
        profileCompleted: true
      };

      await db.insert(users).values(adminData);
      console.log("✓ Super admin user created");
    } else {
      console.log("✓ Super admin user already exists");
    }

    console.log("🎉 Database seeding completed successfully!");
    
    return {
      organization: defaultOrg,
      version: defaultVersion,
      questionCount: sampleQuestions.length
    };
    
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    throw error;
  }
}

// Export for use by server
export { seedDatabase as default };