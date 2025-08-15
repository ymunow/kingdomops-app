import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, CheckCircle, Clock, Calendar, TrendingUp } from "lucide-react";

interface AdminStats {
  totalAssessments: number;
  completionRate: number;
  avgTimeMinutes: number;
  thisMonth: number;
  giftDistribution: Record<string, number>;
}

const giftNames: Record<string, string> = {
  LEADERSHIP_ORG: "Leadership",
  TEACHING: "Teaching",
  WISDOM_INSIGHT: "Wisdom",
  PROPHETIC_DISCERNMENT: "Prophetic",
  EXHORTATION: "Exhortation",
  SHEPHERDING: "Shepherding",
  FAITH: "Faith",
  EVANGELISM: "Evangelism",
  APOSTLESHIP: "Apostleship",
  SERVICE_HOSPITALITY: "Service",
  MERCY: "Mercy",
  GIVING: "Giving",
};

const giftColors = [
  "bg-spiritual-blue",
  "bg-warm-gold",
  "bg-sage-green",
  "bg-purple-500",
  "bg-red-500",
  "bg-indigo-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-gray-500",
  "bg-yellow-500",
];

export function StatsDashboard() {
  const { data: stats, isLoading, error } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white shadow-sm border border-gray-100">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 border border-red-200 mb-8">
        <CardContent className="p-6 text-center">
          <p className="text-red-800">Failed to load statistics. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Assessments</p>
                <p className="text-3xl font-bold text-charcoal" data-testid="stat-total-assessments">
                  {stats.totalAssessments}
                </p>
              </div>
              <div className="bg-spiritual-blue/10 rounded-full p-3">
                <ClipboardList className="text-spiritual-blue h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="text-sage-green h-4 w-4 mr-1" />
              <span className="text-sage-green text-sm font-medium">Active</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Completion Rate</p>
                <p className="text-3xl font-bold text-charcoal" data-testid="stat-completion-rate">
                  {stats.completionRate}%
                </p>
              </div>
              <div className="bg-sage-green/10 rounded-full p-3">
                <CheckCircle className="text-sage-green h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-gray-500 text-sm">Submitted assessments</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Avg. Time</p>
                <p className="text-3xl font-bold text-charcoal" data-testid="stat-avg-time">
                  {stats.avgTimeMinutes}m
                </p>
              </div>
              <div className="bg-warm-gold/10 rounded-full p-3">
                <Clock className="text-warm-gold h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-gray-500 text-sm">Completion time</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">This Month</p>
                <p className="text-3xl font-bold text-charcoal" data-testid="stat-this-month">
                  {stats.thisMonth}
                </p>
              </div>
              <div className="bg-spiritual-blue/10 rounded-full p-3">
                <Calendar className="text-spiritual-blue h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sage-green text-sm font-medium">New assessments</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gift Distribution Chart */}
      <Card className="bg-white shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <h3 className="font-display font-semibold text-xl text-charcoal mb-6">Top Spiritual Gifts Distribution</h3>
          
          <div className="space-y-4">
            {Object.entries(stats.giftDistribution)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 8)
              .map(([giftKey, count], index) => {
                const percentage = stats.totalAssessments > 0 
                  ? Math.round((count / stats.totalAssessments) * 100)
                  : 0;
                
                return (
                  <div key={giftKey} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 ${giftColors[index]} rounded mr-3`}></div>
                      <span className="text-sm font-medium" data-testid={`gift-name-${giftKey}`}>
                        {giftNames[giftKey] || giftKey}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className={`${giftColors[index]} h-2 rounded-full`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 min-w-[3rem] text-right" data-testid={`gift-percentage-${giftKey}`}>
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

