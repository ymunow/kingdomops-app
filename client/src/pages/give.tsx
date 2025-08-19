import React from 'react';
import { DollarSign, Heart, Repeat, TrendingUp, Calendar } from 'lucide-react';
import { MainLayout } from '@/components/navigation/main-layout';
import { Button } from '@/components/ui/button';

export default function Give() {
  const givingHistory = [
    { date: '2025-08-12', amount: 50, method: 'Bank Transfer', fund: 'General Fund' },
    { date: '2025-08-05', amount: 100, method: 'Credit Card', fund: 'Missions' },
    { date: '2025-07-29', amount: 50, method: 'Bank Transfer', fund: 'General Fund' },
    { date: '2025-07-22', amount: 75, method: 'Credit Card', fund: 'Building Fund' }
  ];

  const quickAmounts = [25, 50, 100, 250];
  const funds = ['General Fund', 'Missions', 'Building Fund', 'Benevolence'];

  return (
    <MainLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal mb-2">Give</h1>
          <p className="text-gray-600">Support God's work through generous giving</p>
        </div>

        <div className="space-y-6">
          {/* Quick Give Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <Heart className="h-6 w-6 text-spiritual-blue" />
              <h2 className="text-xl font-bold text-charcoal">Give Now</h2>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Amounts</label>
              <div className="grid grid-cols-4 gap-3">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    data-testid={`quick-amount-${amount}`}
                    className="h-12"
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Custom Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spiritual-blue focus:border-transparent"
                  data-testid="custom-amount-input"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Fund</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spiritual-blue focus:border-transparent"
                data-testid="fund-select"
              >
                {funds.map((fund) => (
                  <option key={fund} value={fund}>{fund}</option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3">
              <Button className="flex-1 bg-gradient-to-r from-spiritual-blue to-purple-700" data-testid="give-now">
                Give Now
              </Button>
              <Button variant="outline" className="flex-1" data-testid="setup-recurring">
                <Repeat className="h-4 w-4 mr-2" />
                Set Up Recurring
              </Button>
            </div>
          </div>

          {/* Giving Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <TrendingUp className="h-6 w-6 text-spiritual-blue" />
              <h2 className="text-xl font-bold text-charcoal">Your Generosity Impact</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-charcoal">$275</p>
                <p className="text-sm text-gray-600">This Month</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-charcoal">$850</p>
                <p className="text-sm text-gray-600">This Quarter</p>
              </div>
            </div>

            <div className="bg-spiritual-blue/5 rounded-lg p-4">
              <p className="text-spiritual-blue font-medium mb-1">Thank you for your faithfulness!</p>
              <p className="text-sm text-gray-600">
                Your generous giving is helping to advance God's Kingdom and support our church family.
              </p>
            </div>
          </div>

          {/* Giving History */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <Calendar className="h-6 w-6 text-spiritual-blue" />
              <h2 className="text-xl font-bold text-charcoal">Giving History</h2>
            </div>
            
            <div className="space-y-3">
              {givingHistory.map((gift, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-charcoal">${gift.amount}</p>
                    <p className="text-sm text-gray-600">{gift.fund}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-700">{new Date(gift.date).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">{gift.method}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Button variant="ghost" className="w-full mt-4">
              View Full History
            </Button>
          </div>

          {/* Scripture */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 italic mb-2">
                "Remember this: Whoever sows sparingly will also reap sparingly, and whoever sows generously will also reap generously."
              </p>
              <p className="text-sm text-gray-500">— 2 Corinthians 9:6</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}