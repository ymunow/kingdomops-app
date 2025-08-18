import { storage } from "./storage";
import type { InsertResponse, InsertAnswer, InsertResult } from "@shared/schema";

export async function testAssessmentFlow() {
  console.log("\n🧪 Testing Complete Assessment Flow...\n");

  try {
    // Step 1: Get active assessment version
    console.log("1️⃣ Checking active assessment version...");
    const version = await storage.getActiveAssessmentVersion();
    if (!version) {
      throw new Error("No active assessment version found");
    }
    console.log(`✓ Found version: ${version.title} (${version.id})`);

    // Step 2: Get questions
    console.log("\n2️⃣ Loading assessment questions...");
    const questions = await storage.getQuestionsByVersion(version.id);
    console.log(`✓ Loaded ${questions.length} questions`);
    if (questions.length === 0) {
      throw new Error("No questions found for active version");
    }

    // Step 3: Create a test user response
    console.log("\n3️⃣ Creating test assessment response...");
    const testUserId = "e852eca5-9bb2-43c7-bd81-5ef55bdef333"; // Your user ID
    const testOrgId = "default-org-001";

    const responseData: InsertResponse = {
      userId: testUserId,
      versionId: version.id,
      organizationId: testOrgId,
      ageGroups: ["Adults (36-55)"],
      ministryInterests: ["Small Group Leadership", "Teaching"],
      naturalAbilities: ["ARTS_MUSIC_OTHER", "SKILLS_COMMUNICATION"]
    };

    const response = await storage.createResponse(responseData);
    console.log(`✓ Created response: ${response.id}`);

    // Step 4: Add sample answers
    console.log("\n4️⃣ Adding test answers...");
    const sampleAnswers: InsertAnswer[] = questions.slice(0, 5).map((question, index) => ({
      responseId: response.id,
      questionId: question.id,
      value: Math.floor(Math.random() * 5) + 1 // Random 1-5 rating
    }));

    const answers = await storage.bulkCreateAnswers(sampleAnswers);
    console.log(`✓ Added ${answers.length} answers`);

    // Step 5: Submit the response
    console.log("\n5️⃣ Submitting assessment...");
    const submittedResponse = await storage.updateResponseSubmission(response.id, 15);
    console.log(`✓ Response submitted at: ${submittedResponse?.submittedAt}`);

    // Step 6: Create test results
    console.log("\n6️⃣ Generating test results...");
    const resultData: InsertResult = {
      responseId: response.id,
      userId: testUserId,
      organizationId: testOrgId,
      top1GiftKey: "TEACHING",
      top1Score: 85,
      top2GiftKey: "LEADERSHIP_ORG",
      top2Score: 78,
      top3GiftKey: "WISDOM_INSIGHT",
      top3Score: 72,
      scoresJson: {
        TEACHING: 85,
        LEADERSHIP_ORG: 78,
        WISDOM_INSIGHT: 72,
        EXHORTATION: 65,
        SHEPHERDING: 60,
        FAITH: 58,
        EVANGELISM: 55,
        APOSTLESHIP: 52,
        SERVICE_HOSPITALITY: 48,
        MERCY: 45,
        GIVING: 42,
        PROPHETIC_DISCERNMENT: 40
      },
      naturalAbilities: ["ARTS_MUSIC_OTHER", "SKILLS_COMMUNICATION"],
      ministryRecommendations: [
        "Consider joining the teaching ministry team",
        "Explore small group leadership opportunities",
        "Use your communication skills in worship planning"
      ],
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    };

    const result = await storage.createResult(resultData);
    console.log(`✓ Created result: ${result.id}`);

    // Step 7: Verify data retrieval
    console.log("\n7️⃣ Verifying data retrieval...");
    
    const userResults = await storage.getUserResults(testUserId);
    console.log(`✓ User has ${userResults.length} completed assessments`);

    const userResponses = await storage.getResponsesByUser(testUserId);
    console.log(`✓ User has ${userResponses.length} responses`);

    const orgResponses = await storage.getResponsesByOrganization(testOrgId);
    console.log(`✓ Organization has ${orgResponses.length} responses`);

    // Step 8: Test analytics
    console.log("\n8️⃣ Testing analytics...");
    const metrics = await storage.getDashboardMetrics(testOrgId);
    console.log(`✓ Dashboard metrics: ${metrics.totalCompletions} completions, ${metrics.completionsLast30Days} this month`);

    const giftDistribution = await storage.getGiftDistribution(testOrgId);
    const topGifts = Object.entries(giftDistribution)
      .filter(([, count]) => count > 0)
      .slice(0, 3);
    console.log(`✓ Top spiritual gifts: ${topGifts.map(([gift, count]) => `${gift}(${count})`).join(', ')}`);

    console.log("\n🎉 Assessment Flow Test PASSED! PostgreSQL integration is working perfectly.");
    
    return {
      success: true,
      version,
      questionCount: questions.length,
      responseId: response.id,
      resultId: result.id,
      metrics
    };

  } catch (error) {
    console.error("\n❌ Assessment Flow Test FAILED:", error);
    throw error;
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAssessmentFlow().then(() => {
    console.log("\nTest completed successfully!");
    process.exit(0);
  }).catch((error) => {
    console.error("\nTest failed:", error);
    process.exit(1);
  });
}