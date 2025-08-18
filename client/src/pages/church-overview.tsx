import { useAuth } from "@/hooks/useSupabaseAuth";
// import { useOrganization } from "@/hooks/useOrganization"; // TODO: Create organization hook
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Trophy, 
  TrendingUp, 
  Clock, 
  Heart,
  BookOpen,
  Lightbulb,
  UserCheck,
  Calendar,
  Target,
  ChevronRight,
  BarChart3,
  PieChart,
  Activity,
  Star
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import { Link, useLocation } from "wouter";

interface ChurchMetrics {
  // Overview Stats
  totalMembers: number;
  activeMembers: number;
  totalAssessments: number;
  completionRate: number;
  
  // Assessment Stats  
  completionsLast30Days: number;
  averageTimeMinutes: number;
  pendingAssessments: number;
  
  // Spiritual Gifts Distribution
  topGifts: Array<{
    gift: string;
    giftLabel: string;
    count: number;
    percentage: number;
  }>;
  
  // Age Group Insights
  ageDistribution: Array<{
    ageRange: string;
    count: number;
    percentage: number;
  }>;
  
  // Engagement Metrics
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
    userName?: string;
  }>;
  
  // Ministry Matching
  ministryOpportunities: number;
  placementMatches: number;
  availableVolunteers: number;
}

interface ChurchOverviewProps {
  organizationId?: string;
}

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#ea580c', '#7c3aed', '#0891b2', '#be123c', '#4338ca'];

const GIFT_LABELS: Record<string, string> = {
  LEADERSHIP_ORG: "Leadership & Organization",
  TEACHING: "Teaching",
  WISDOM_INSIGHT: "Wisdom & Insight",
  PROPHECY: "Prophecy",
  DISCERNMENT: "Discernment of Spirits",
  EXHORTATION: "Exhortation",
  SHEPHERDING: "Shepherding",
  FAITH: "Faith",
  EVANGELISM: "Evangelism",
  MERCY: "Mercy",
  SERVING_HELPING: "Serving & Helping",
  GIVING: "Giving"
};

export default function ChurchOverview({ organizationId }: ChurchOverviewProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  // const { organization } = useOrganization(); // TODO: Use organization hook
  const organization = null; // Temporary placeholder
  
  // Use provided organizationId or current organization
  const targetOrgId = organizationId || organization?.id;
  const targetOrgName = organization?.name || "Kingdom Impact Training";
  
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isChurchAdmin = ["ORG_OWNER", "ORG_ADMIN", "ORG_LEADER"].includes(user?.role || "");
  
  // Determine the dashboard title based on role and context
  const dashboardTitle = isSuperAdmin 
    ? (targetOrgId === "default-org-001" ? "Platform Overview" : `${targetOrgName} Overview`)
    : `${targetOrgName} Dashboard`;

  const { data: metrics, isLoading, error } = useQuery<ChurchMetrics>({
    queryKey: ['/api/church-overview', targetOrgId],
    enabled: !!targetOrgId && !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spiritual-blue/5 to-warm-gold/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96"></div>
            </div>
            
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spiritual-blue/5 to-warm-gold/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-red-50 border border-red-200">
            <CardContent className="p-6 text-center">
              <p className="text-red-800">Failed to load church overview. Please try again later.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spiritual-blue/5 to-warm-gold/5">
      {/* Header */}
      <section className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-charcoal">{dashboardTitle}</h1>
              <p className="text-gray-600 mt-1">
                {isSuperAdmin 
                  ? "Platform-wide insights and church management" 
                  : "Comprehensive insights into your congregation's spiritual gifts and ministry engagement"}
              </p>
            </div>
            <div className="flex space-x-3">
              {user?.role === 'SUPER_ADMIN' && (
                <Button variant="outline" asChild>
                  <Link href="/admin/organizations">
                    <Users className="h-4 w-4 mr-2" />
                    All Churches
                  </Link>
                </Button>
              )}
              <Button variant="outline" disabled>
                <BarChart3 className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Members</p>
                    <p className="text-3xl font-bold text-charcoal">{metrics.totalMembers}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {metrics.activeMembers} active this month
                    </p>
                  </div>
                  <div className="bg-spiritual-blue/10 rounded-full p-3">
                    <Users className="text-spiritual-blue h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={(metrics.activeMembers / metrics.totalMembers) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Assessments Completed</p>
                    <p className="text-3xl font-bold text-charcoal">{metrics.totalAssessments}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {metrics.completionsLast30Days} this month
                    </p>
                  </div>
                  <div className="bg-sage-green/10 rounded-full p-3">
                    <Trophy className="text-sage-green h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="text-sage-green h-4 w-4 mr-1" />
                  <span className="text-sage-green text-sm font-medium">
                    {metrics.completionRate}% completion rate
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Pending Assessments</p>
                    <p className="text-3xl font-bold text-charcoal">{metrics.pendingAssessments}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Avg. {metrics.averageTimeMinutes}min to complete
                    </p>
                  </div>
                  <div className="bg-warm-gold/10 rounded-full p-3">
                    <Clock className="text-warm-gold h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <Calendar className="text-warm-gold h-4 w-4 mr-1" />
                  <span className="text-warm-gold text-sm font-medium">Follow up needed</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Ministry Matches</p>
                    <p className="text-3xl font-bold text-charcoal">{metrics.placementMatches}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {metrics.availableVolunteers} volunteers available
                    </p>
                  </div>
                  <div className="bg-purple-100 rounded-full p-3">
                    <Heart className="text-purple-600 h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <Target className="text-purple-600 h-4 w-4 mr-1" />
                  <span className="text-purple-600 text-sm font-medium">
                    {metrics.ministryOpportunities} opportunities
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Spiritual Gifts Distribution */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardHeader>
                <CardTitle className="text-charcoal flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Top Spiritual Gifts in Your Congregation
                </CardTitle>
                <CardDescription>
                  Most common spiritual gifts identified through assessments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {metrics.topGifts.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metrics.topGifts.slice(0, 6)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="giftLabel" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [value, 'Members']}
                        labelFormatter={(label) => `Gift: ${label}`}
                      />
                      <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No assessment data available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Age Group Distribution */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardHeader>
                <CardTitle className="text-charcoal flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Congregation Age Distribution
                </CardTitle>
                <CardDescription>
                  Age demographics of assessment participants
                </CardDescription>
              </CardHeader>
              <CardContent>
                {metrics.ageDistribution.length > 0 ? (
                  <div className="space-y-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <RechartsPieChart>
                        <Tooltip 
                          formatter={(value, name) => [`${value} members`, name]}
                        />
                        <Pie
                          data={metrics.ageDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={0}
                          outerRadius={80}
                          dataKey="count"
                        >
                          {metrics.ageDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2">
                      {metrics.ageDistribution.map((item, index) => (
                        <div key={item.ageRange} className="flex items-center text-sm">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="text-gray-600">
                            {item.ageRange}: {item.count} ({item.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No age data available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Feed */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle className="text-charcoal flex items-center justify-between">
                <span className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </span>
                <Button variant="outline" size="sm" disabled>
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardTitle>
              <CardDescription>
                Latest spiritual gifts assessments and member activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {metrics.recentActivity.slice(0, 8).map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 py-3 border-b last:border-b-0">
                      <div className="bg-spiritual-blue/10 rounded-full p-2">
                        <UserCheck className="h-4 w-4 text-spiritual-blue" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal">
                          {activity.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {activity.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                            {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No Recent Activity</p>
                  <p>Activity will appear here as members complete assessments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}