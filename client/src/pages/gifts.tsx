import React from 'react';
import { Gift, BookOpen, Target, ArrowRight } from 'lucide-react';
import { MainLayout } from '@/components/navigation/main-layout';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

export default function Gifts() {
  const { data: results = [] } = useQuery<any[]>({
    queryKey: ['/api/my-results'],
  });

  const hasResults = results.length > 0;
  const latestResult = results[0];

  const giftDescriptions = {
    LEADERSHIP_ORG: { name: 'Leadership', description: 'Guiding and directing others toward common goals' },
    TEACHING: { name: 'Teaching', description: 'Explaining and instructing others in biblical truth' },
    WISDOM_INSIGHT: { name: 'Wisdom', description: 'Providing practical insight and understanding' },
    SHEPHERDING: { name: 'Shepherding', description: 'Caring for and protecting others spiritually' },
    FAITH: { name: 'Faith', description: 'Trusting God and encouraging others to trust' },
    SERVICE: { name: 'Service', description: 'Meeting practical needs through helpful action' },
    MERCY: { name: 'Mercy', description: 'Showing compassion and care for those suffering' },
    GIVING: { name: 'Giving', description: 'Contributing resources generously for Kingdom work' },
    ADMINISTRATION: { name: 'Administration', description: 'Organizing and managing details effectively' },
    EVANGELISM: { name: 'Evangelism', description: 'Sharing the gospel and leading others to Christ' },
    PROPHECY: { name: 'Prophecy', description: 'Speaking God\'s truth with clarity and boldness' },
    DISCERNMENT: { name: 'Discernment', description: 'Distinguishing between truth and error' }
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal mb-2">Spiritual Gifts</h1>
          <p className="text-gray-600">Discover and develop your God-given gifts for Kingdom impact</p>
        </div>

        {hasResults ? (
          <div className="space-y-6">
            {/* Your Top Gifts */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <Gift className="h-6 w-6 text-spiritual-blue" />
                <h2 className="text-xl font-bold text-charcoal">Your Top Spiritual Gifts</h2>
              </div>
              
              <div className="grid gap-4">
                {[
                  { key: latestResult.top1GiftKey, rank: '1st' },
                  { key: latestResult.top2GiftKey, rank: '2nd' },
                  { key: latestResult.top3GiftKey, rank: '3rd' }
                ].map(({ key, rank }) => {
                  const gift = giftDescriptions[key as keyof typeof giftDescriptions];
                  return (
                    <div key={key} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-charcoal">{gift?.name}</h3>
                        <span className="text-sm font-medium text-spiritual-blue">{rank} Gift</span>
                      </div>
                      <p className="text-gray-600 text-sm">{gift?.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Serving Recommendations */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="h-6 w-6 text-spiritual-blue" />
                <h2 className="text-xl font-bold text-charcoal">Recommended Serving Opportunities</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-charcoal">Small Group Leader</h4>
                    <p className="text-sm text-gray-600">Perfect match for your teaching and shepherding gifts</p>
                  </div>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-charcoal">Worship Team</h4>
                    <p className="text-sm text-gray-600">Great opportunity to use your faith and service gifts</p>
                  </div>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
              
              <Button className="w-full mt-4" data-testid="explore-all-opportunities">
                <ArrowRight className="h-4 w-4 mr-2" />
                Explore All Opportunities
              </Button>
            </div>

            {/* Scripture & Growth */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <BookOpen className="h-6 w-6 text-spiritual-blue" />
                <h2 className="text-xl font-bold text-charcoal">Scripture & Growth</h2>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-700 italic mb-2">
                  "Each of you should use whatever gift you have to serve others, as faithful stewards of God's grace in its various forms."
                </p>
                <p className="text-sm text-gray-500">— 1 Peter 4:10</p>
              </div>
              
              <p className="text-gray-600 mb-4">
                Your spiritual gifts are meant to be used in service to others and for God's glory. Continue to develop these gifts through prayer, practice, and serving in your local church.
              </p>
              
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/assessment'}>
                Retake Assessment
              </Button>
            </div>
          </div>
        ) : (
          /* No Assessment Taken */
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
            <Gift className="h-16 w-16 text-spiritual-blue mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-charcoal mb-4">Discover Your Spiritual Gifts</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Take our comprehensive assessment to discover your God-given spiritual gifts and find the perfect ways to serve in ministry.
            </p>
            <Button size="lg" data-testid="take-assessment" onClick={() => window.location.href = '/assessment'}>
              <Gift className="h-5 w-5 mr-2" />
              Take Assessment
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}