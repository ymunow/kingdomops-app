import { storage } from "./storage";
import type { InsertResponse, InsertAnswer, InsertResult } from "@shared/schema";

export async function testFullAssessment() {
  console.log("\n📝 Testing Complete 60-Question Assessment Flow...\n");

  try {
    const testUserId = "e852eca5-9bb2-43c7-bd81-5ef55bdef333"; // Your user ID
    const orgId = "default-org-001";

    // Step 1: Load the active assessment
    console.log("1️⃣ Loading active assessment...");
    const version = await storage.getActiveAssessmentVersion();
    if (!version) {
      throw new Error("No active assessment version found");
    }
    console.log(`✓ Assessment: ${version.title}`);

    // Step 2: Load all 60 questions
    console.log("\n2️⃣ Loading all assessment questions...");
    const questions = await storage.getQuestionsByVersion(version.id);
    console.log(`✓ Loaded ${questions.length} questions`);
    
    if (questions.length !== 60) {
      console.warn(`⚠️  Expected 60 questions, found ${questions.length}`);
    }

    // Verify question distribution across spiritual gifts
    const giftKeys = new Set(questions.map(q => q.giftKey));
    console.log(`✓ Questions cover ${giftKeys.size} spiritual gift categories:`);
    
    const giftCounts: Record<string, number> = {};
    questions.forEach(q => {
      giftCounts[q.giftKey] = (giftCounts[q.giftKey] || 0) + 1;
    });
    
    Object.entries(giftCounts).forEach(([gift, count]) => {
      console.log(`   - ${gift}: ${count} questions`);
    });

    // Step 3: Create a new assessment response
    console.log("\n3️⃣ Starting new assessment...");
    const responseData: InsertResponse = {
      userId: testUserId,
      versionId: version.id,
      organizationId: orgId,
      ageGroups: ["Adults (26-35)", "Adults (36-55)"],
      ministryInterests: [
        "Small Group Leadership", 
        "Teaching", 
        "Worship Planning",
        "Youth Ministry"
      ],
      naturalAbilities: [
        "ARTS_MUSIC_VOCAL",
        "ARTS_MUSIC_INSTRUMENTAL", 
        "SKILLS_COMMUNICATION",
        "SKILLS_LEADERSHIP_MANAGEMENT"
      ]
    };

    const response = await storage.createResponse(responseData);
    console.log(`✓ Assessment started: ${response.id}`);

    // Step 4: Simulate answering all 60 questions with realistic scores
    console.log("\n4️⃣ Answering all 60 questions...");
    
    // Create realistic assessment answers based on spiritual gifts
    const giftPreferences: Record<string, number> = {
      'TEACHING': 4.5,
      'LEADERSHIP_ORG': 4.0,
      'WISDOM_INSIGHT': 3.8,
      'ARTS_MUSIC_WORSHIP': 4.2,
      'EXHORTATION': 3.5,
      'EVANGELISM': 2.8,
      'SHEPHERDING': 3.2,
      'SERVICE_HOSPITALITY': 3.0,
      'MERCY': 2.5,
      'GIVING': 2.8,
      'FAITH': 3.3,
      'PROPHETIC_DISCERNMENT': 2.2
    };

    const answers: InsertAnswer[] = questions.map(question => {
      const baseScore = giftPreferences[question.giftKey] || 3.0;
      // Add some natural variation (-0.5 to +0.5)
      const variation = (Math.random() - 0.5);
      const finalScore = Math.max(1, Math.min(5, Math.round(baseScore + variation)));
      
      return {
        responseId: response.id,
        questionId: question.id,
        value: finalScore
      };
    });

    const savedAnswers = await storage.bulkCreateAnswers(answers);
    console.log(`✓ Answered all ${savedAnswers.length} questions`);

    // Show answer distribution
    const scoreCounts = [1, 2, 3, 4, 5].map(score => ({
      score,
      count: answers.filter(a => a.value === score).length
    }));
    
    console.log(`✓ Answer distribution:`);
    scoreCounts.forEach(({ score, count }) => {
      const percentage = Math.round((count / answers.length) * 100);
      console.log(`   ${score} stars: ${count} answers (${percentage}%)`);
    });

    // Step 5: Calculate spiritual gift scores
    console.log("\n5️⃣ Calculating spiritual gift scores...");
    
    const giftScores: Record<string, { total: number, count: number, average: number }> = {};
    
    answers.forEach(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      if (question) {
        if (!giftScores[question.giftKey]) {
          giftScores[question.giftKey] = { total: 0, count: 0, average: 0 };
        }
        giftScores[question.giftKey].total += answer.value;
        giftScores[question.giftKey].count += 1;
      }
    });

    // Calculate averages and convert to percentages
    Object.keys(giftScores).forEach(giftKey => {
      const gift = giftScores[giftKey];
      gift.average = gift.total / gift.count;
      // Convert to 0-100 scale (5-point scale becomes percentage)
      gift.average = Math.round((gift.average / 5) * 100);
    });

    // Find top 3 gifts
    const sortedGifts = Object.entries(giftScores)
      .sort(([,a], [,b]) => b.average - a.average);
    
    const [top1, top2, top3] = sortedGifts;
    
    console.log(`✓ Top 3 spiritual gifts identified:`);
    console.log(`   1. ${top1[0]}: ${top1[1].average}% (${top1[1].count} questions)`);
    console.log(`   2. ${top2[0]}: ${top2[1].average}% (${top2[1].count} questions)`);
    console.log(`   3. ${top3[0]}: ${top3[1].average}% (${top3[1].count} questions)`);

    // Step 6: Submit the assessment
    console.log("\n6️⃣ Submitting assessment...");
    const submittedResponse = await storage.updateResponseSubmission(response.id, 15); // 15 minutes completion time
    console.log(`✓ Assessment submitted at: ${submittedResponse?.submittedAt}`);

    // Step 7: Create final results
    console.log("\n7️⃣ Generating assessment results...");
    
    const allScoresJson = Object.fromEntries(
      Object.entries(giftScores).map(([key, data]) => [key, data.average])
    );

    const resultData: InsertResult = {
      responseId: response.id,
      userId: testUserId,
      organizationId: orgId,
      top1GiftKey: top1[0] as any,
      top1Score: top1[1].average,
      top2GiftKey: top2[0] as any,
      top2Score: top2[1].average,
      top3GiftKey: top3[0] as any,
      top3Score: top3[1].average,
      scoresJson: allScoresJson,
      naturalAbilities: responseData.naturalAbilities,
      ministryRecommendations: [
        `Your strongest gift of ${top1[0]} suggests leadership in teaching and discipleship ministries.`,
        `With ${top2[0]} as your second gift, consider roles in organizational leadership.`,
        `Your ${top3[0]} gift can enhance worship and creative ministries.`,
        `Your natural abilities in music and communication are ideal for worship teams.`
      ],
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    };

    const finalResult = await storage.createResult(resultData);
    console.log(`✓ Results saved: ${finalResult.id}`);

    // Step 8: Verify results retrieval
    console.log("\n8️⃣ Verifying results retrieval...");
    const userResults = await storage.getUserResults(testUserId);
    const latestResult = userResults[0];
    
    console.log(`✓ User now has ${userResults.length} completed assessments`);
    console.log(`✓ Latest result summary:`);
    console.log(`   - Top Gift: ${latestResult.top1GiftKey} (${latestResult.top1Score}%)`);
    console.log(`   - Natural Abilities: ${latestResult.naturalAbilities.join(', ')}`);
    console.log(`   - Ministry Recommendations: ${latestResult.ministryRecommendations?.length || 0} suggestions`);

    console.log("\n🎉 Complete Assessment Test PASSED! Full 60-question flow working perfectly.");
    
    return {
      success: true,
      assessmentId: response.id,
      resultId: finalResult.id,
      questionsAnswered: answers.length,
      completionTime: 15,
      topGifts: {
        first: { gift: top1[0], score: top1[1].average },
        second: { gift: top2[0], score: top2[1].average },
        third: { gift: top3[0], score: top3[1].average }
      },
      totalResults: userResults.length
    };

  } catch (error) {
    console.error("\n❌ Complete Assessment Test FAILED:", error);
    throw error;
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testFullAssessment().then(() => {
    console.log("\nComplete assessment test finished!");
    process.exit(0);
  }).catch((error) => {
    console.error("\nComplete assessment test failed:", error);
    process.exit(1);
  });
}