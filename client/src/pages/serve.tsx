import React from 'react';
import { Users, Heart, Star, ArrowRight } from 'lucide-react';
import { MainLayout } from '@/components/navigation/main-layout';
import { Button } from '@/components/ui/button';

export default function Serve() {
  const serveOpportunities = [
    {
      id: '1',
      title: 'Small Group Leader',
      ministry: 'Adult Ministries',
      description: 'Lead a weekly small group focused on Bible study and community building.',
      requiredGifts: ['Teaching', 'Shepherding'],
      preferredGifts: ['Wisdom'],
      matchScore: 92,
      timeCommitment: '2-3 hours/week',
      applications: 3
    },
    {
      id: '2',
      title: 'Worship Team Vocalist',
      ministry: 'Worship Arts',
      description: 'Join our worship team and help lead the congregation in musical worship.',
      requiredGifts: ['Faith', 'Service'],
      preferredGifts: ['Leadership'],
      matchScore: 87,
      timeCommitment: '4-5 hours/week',
      applications: 7
    },
    {
      id: '3',
      title: 'Children\'s Ministry Helper',
      ministry: 'Kids Ministry',
      description: 'Assist with Sunday school and special events for children ages 5-10.',
      requiredGifts: ['Service', 'Faith'],
      preferredGifts: ['Teaching', 'Mercy'],
      matchScore: 78,
      timeCommitment: '3-4 hours/week',
      applications: 12
    }
  ];

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    return 'text-orange-600 bg-orange-50';
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal mb-2">Serve Central</h1>
          <p className="text-gray-600">Find ministry opportunities that match your spiritual gifts</p>
        </div>

        <div className="space-y-6">
          {serveOpportunities.map((opportunity) => (
            <div key={opportunity.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-charcoal">{opportunity.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchColor(opportunity.matchScore)}`}>
                      {opportunity.matchScore}% Match
                    </span>
                  </div>
                  <p className="text-spiritual-blue font-medium mb-2">{opportunity.ministry}</p>
                  <p className="text-gray-600 mb-4">{opportunity.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Required Gifts</p>
                      <div className="flex flex-wrap gap-1">
                        {opportunity.requiredGifts.map((gift) => (
                          <span key={gift} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-md">
                            {gift}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Preferred Gifts</p>
                      <div className="flex flex-wrap gap-1">
                        {opportunity.preferredGifts.map((gift) => (
                          <span key={gift} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                            {gift}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4" />
                      <span>{opportunity.timeCommitment}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{opportunity.applications} applied</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  size="sm" 
                  data-testid={`apply-${opportunity.id}`}
                  className="bg-gradient-to-r from-spiritual-blue to-purple-700"
                >
                  Apply Now
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button variant="ghost" size="sm">
                  Learn More
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}