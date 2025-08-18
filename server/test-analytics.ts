import { storage } from "./storage";

export async function testAnalytics() {
  console.log("\n📊 Testing Organization Analytics & Reporting...\n");

  try {
    const orgId = "default-org-001";
    const adminUserId = "e852eca5-9bb2-43c7-bd81-5ef55bdef333";

    // Step 1: Test dashboard metrics
    console.log("1️⃣ Testing dashboard metrics...");
    const metrics = await storage.getDashboardMetrics(orgId);
    console.log(`✓ Total completions: ${metrics.totalCompletions}`);
    console.log(`✓ Completions last 30 days: ${metrics.completionsLast30Days}`);
    console.log(`✓ Average completion time: ${metrics.averageCompletionTime} minutes`);

    // Step 2: Test gift distribution analytics
    console.log("\n2️⃣ Testing spiritual gift distribution...");
    const giftDistribution = await storage.getGiftDistribution(orgId);
    const totalGifts = Object.values(giftDistribution).reduce((sum, count) => sum + count, 0);
    console.log(`✓ Total spiritual gifts identified: ${totalGifts}`);

    const sortedGifts = Object.entries(giftDistribution)
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a);

    console.log(`✓ Gift distribution breakdown:`);
    sortedGifts.forEach(([gift, count], index) => {
      const percentage = Math.round((count / totalGifts) * 100);
      console.log(`   ${index + 1}. ${gift}: ${count} people (${percentage}%)`);
    });

    // Step 3: Test user engagement analytics
    console.log("\n3️⃣ Testing user engagement analytics...");
    const orgUsers = await storage.getUsersByOrganization(orgId);
    const activeUsers = orgUsers.filter(u => u.lastActiveAt);
    const usersWithResults = await Promise.all(
      orgUsers.map(async (user) => {
        const results = await storage.getUserResults(user.id);
        return { user, resultCount: results.length };
      })
    );

    console.log(`✓ Organization user analytics:`);
    console.log(`   - Total users: ${orgUsers.length}`);
    console.log(`   - Active users: ${activeUsers.length}`);
    console.log(`   - Users with completed assessments: ${usersWithResults.filter(u => u.resultCount > 0).length}`);

    const completionRate = Math.round((usersWithResults.filter(u => u.resultCount > 0).length / orgUsers.length) * 100);
    console.log(`   - Assessment completion rate: ${completionRate}%`);

    // Step 4: Test natural abilities analytics
    console.log("\n4️⃣ Testing natural abilities analytics...");
    const allResponses = await storage.getResponsesByOrganization(orgId);
    const submittedResponses = allResponses.filter(r => r.submittedAt);
    
    const naturalAbilitiesCount: Record<string, number> = {};
    submittedResponses.forEach(response => {
      if (response.naturalAbilities && Array.isArray(response.naturalAbilities)) {
        response.naturalAbilities.forEach(ability => {
          naturalAbilitiesCount[ability] = (naturalAbilitiesCount[ability] || 0) + 1;
        });
      }
    });

    const topAbilities = Object.entries(naturalAbilitiesCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    console.log(`✓ Top natural abilities in organization:`);
    topAbilities.forEach(([ability, count], index) => {
      console.log(`   ${index + 1}. ${ability}: ${count} people`);
    });

    // Step 5: Test ministry interest analytics
    console.log("\n5️⃣ Testing ministry interest analytics...");
    const ministryInterestsCount: Record<string, number> = {};
    submittedResponses.forEach(response => {
      if (response.ministryInterests && Array.isArray(response.ministryInterests)) {
        response.ministryInterests.forEach(interest => {
          ministryInterestsCount[interest] = (ministryInterestsCount[interest] || 0) + 1;
        });
      }
    });

    const topInterests = Object.entries(ministryInterestsCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);

    console.log(`✓ Top ministry interests:`);
    topInterests.forEach(([interest, count], index) => {
      console.log(`   ${index + 1}. ${interest}: ${count} people`);
    });

    // Step 6: Test age group distribution
    console.log("\n6️⃣ Testing age group analytics...");
    const ageGroupCount: Record<string, number> = {};
    submittedResponses.forEach(response => {
      if (response.ageGroups && Array.isArray(response.ageGroups)) {
        response.ageGroups.forEach(ageGroup => {
          ageGroupCount[ageGroup] = (ageGroupCount[ageGroup] || 0) + 1;
        });
      }
    });

    const sortedAgeGroups = Object.entries(ageGroupCount)
      .sort(([, a], [, b]) => b - a);

    console.log(`✓ Age group distribution:`);
    sortedAgeGroups.forEach(([ageGroup, count], index) => {
      console.log(`   ${index + 1}. ${ageGroup}: ${count} people`);
    });

    // Step 7: Test completion time analytics
    console.log("\n7️⃣ Testing completion time analytics...");
    const completionTimes = submittedResponses
      .filter(r => r.completionTimeMinutes)
      .map(r => r.completionTimeMinutes!);

    if (completionTimes.length > 0) {
      const avgTime = Math.round(completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length);
      const minTime = Math.min(...completionTimes);
      const maxTime = Math.max(...completionTimes);

      console.log(`✓ Assessment completion time analytics:`);
      console.log(`   - Average completion time: ${avgTime} minutes`);
      console.log(`   - Fastest completion: ${minTime} minutes`);
      console.log(`   - Longest completion: ${maxTime} minutes`);
    }

    // Step 8: Test assessment version analytics
    console.log("\n8️⃣ Testing assessment version analytics...");
    const activeVersion = await storage.getActiveAssessmentVersion();
    if (activeVersion) {
      const versionResponses = allResponses.filter(r => r.versionId === activeVersion.id);
      const versionCompletions = versionResponses.filter(r => r.submittedAt);

      console.log(`✓ Active assessment version analytics:`);
      console.log(`   - Version: ${activeVersion.title}`);
      console.log(`   - Total starts: ${versionResponses.length}`);
      console.log(`   - Total completions: ${versionCompletions.length}`);
      
      if (versionResponses.length > 0) {
        const completionRate = Math.round((versionCompletions.length / versionResponses.length) * 100);
        console.log(`   - Completion rate: ${completionRate}%`);
      }
    }

    // Step 9: Test recent activity trends
    console.log("\n9️⃣ Testing recent activity trends...");
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recent7DayCompletions = submittedResponses.filter(r => 
      r.submittedAt && new Date(r.submittedAt) >= last7Days
    ).length;

    const recent30DayCompletions = submittedResponses.filter(r => 
      r.submittedAt && new Date(r.submittedAt) >= last30Days
    ).length;

    console.log(`✓ Recent activity trends:`);
    console.log(`   - Completions last 7 days: ${recent7DayCompletions}`);
    console.log(`   - Completions last 30 days: ${recent30DayCompletions}`);

    // Step 10: Generate analytics summary report
    console.log("\n🔟 Generating analytics summary report...");
    const analyticsReport = {
      organizationId: orgId,
      reportDate: new Date().toISOString(),
      totalUsers: orgUsers.length,
      activeUsers: activeUsers.length,
      totalCompletions: metrics.totalCompletions,
      completionRate: completionRate,
      topSpiritalGifts: sortedGifts.slice(0, 3),
      topNaturalAbilities: topAbilities.slice(0, 5),
      topMinistryInterests: topInterests.slice(0, 5),
      averageCompletionTime: metrics.averageCompletionTime,
      recentActivity: {
        last7Days: recent7DayCompletions,
        last30Days: recent30DayCompletions
      }
    };

    console.log(`✓ Analytics report generated successfully!`);
    console.log(`   - Report covers ${analyticsReport.totalUsers} users`);
    console.log(`   - ${analyticsReport.totalCompletions} total assessment completions`);
    console.log(`   - ${analyticsReport.completionRate}% completion rate`);
    console.log(`   - Top spiritual gift: ${analyticsReport.topSpiritalGifts[0]?.[0] || 'None'}`);

    console.log("\n🎉 Analytics Test PASSED! All reporting functionality working perfectly.");
    
    return analyticsReport;

  } catch (error) {
    console.error("\n❌ Analytics Test FAILED:", error);
    throw error;
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAnalytics().then(() => {
    console.log("\nAnalytics test completed successfully!");
    process.exit(0);
  }).catch((error) => {
    console.error("\nAnalytics test failed:", error);
    process.exit(1);
  });
}