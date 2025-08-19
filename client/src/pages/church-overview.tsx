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
  Star,
  User,
  Shield,
  Settings,
  Church,
  Crown
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import { Link, useLocation } from "wouter";
import { viewAsStorage } from "@/lib/view-as-storage";
import { useOrganization } from "@/hooks/use-organization";
import { MainLayout } from "@/components/navigation/main-layout";

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

interface PlatformMetrics {
  // Core platform metrics
  totalChurches: number;
  churchGrowthRate: number;
  totalMembers: number;
  memberGrowthRate: number;
  activeUsers: number;
  activeUsersLast30Days: number;
  
  // Assessment metrics
  globalAssessments: number;
  globalCompletions: number;
  globalCompletionRate: number;
  pendingAssessments: number;
  
  // System oversight
  systemAlerts: Array<{
    type: string;
    severity: string;
    message: string;
    timestamp: string;
  }>;
  pendingApprovals: {
    newChurches: number;
    featureRequests: number;
    supportTickets: number;
  };
  
  // Activity feed
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
    userName?: string;
    organizationName?: string;
  }>;
  
  // Top performing churches
  topChurches: Array<{
    name: string;
    subdomain?: string;
    memberCount: number;
    completionRate: number;
  }>;
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
  const { user, signOutMutation } = useAuth();
  const { organization } = useOrganization();
  
  // Use provided organizationId or current organization
  const targetOrgId = organizationId || organization?.id;
  const targetOrgName = organization?.name || "KingdomOps";
  
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isChurchAdmin = ["ORG_OWNER", "ORG_ADMIN", "ORG_LEADER"].includes(user?.role || "");
  
  // Fetch current view context for super admins
  const { data: viewContext } = useQuery<{ viewContext: any }>({
    queryKey: ["/api/super-admin/view-context"],
    enabled: user?.role === 'SUPER_ADMIN',
    retry: false,
  });

  // Get current view context from all sources
  const localViewContext = viewAsStorage.getViewContext();
  const currentViewType = 
    localViewContext?.viewAsType || 
    (viewContext && 'viewContext' in viewContext ? viewContext.viewContext?.viewAsType : null) || 
    null;
    
  // Determine effective user role based on view context
  const effectiveRole = currentViewType || user?.role;
  
  // Role-based permission checks
  const canViewAdministration = 
    !currentViewType && // Only show when not viewing as someone else
    (user?.role === "SUPER_ADMIN" || user?.role === "ORG_ADMIN" || user?.role === "ORG_OWNER");
  
  // Determine if this is a platform-wide view
  const isPlatformView = isSuperAdmin && !currentViewType;
  
  // Determine the dashboard title based on role and context
  const dashboardTitle = isPlatformView
    ? "Platform Overview" 
    : isSuperAdmin 
      ? `${targetOrgName} Overview`
      : `${targetOrgName} Dashboard`;

  const handleViewProfile = () => setLocation("/profile");
  const handleLogout = () => signOutMutation.mutate();

  // Fetch platform metrics for Super Admin or church metrics for others
  const { data: platformMetrics, isLoading: isPlatformLoading, error: platformError } = useQuery<PlatformMetrics>({
    queryKey: ['/api/platform-overview'],
    enabled: isPlatformView && !!user,
    refetchInterval: 30000,
  });
  
  const { data: churchMetrics, isLoading: isChurchLoading, error: churchError } = useQuery<ChurchMetrics>({
    queryKey: ['/api/church-overview', targetOrgId],
    enabled: !isPlatformView && !!targetOrgId && !!user,
    refetchInterval: 30000,
  });
  
  const isLoading = isPlatformView ? isPlatformLoading : isChurchLoading;
  const error = isPlatformView ? platformError : churchError;
  const metrics = isPlatformView ? platformMetrics : churchMetrics;

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
    <MainLayout>
      <div className="bg-gradient-to-br from-spiritual-blue/5 to-warm-gold/5">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Crown className="text-spiritual-blue h-8 w-8 mr-3" />
              <div>
                <h1 className="font-display font-bold text-xl text-charcoal">
                  {targetOrgName}
                </h1>
                <p className="text-sm text-gray-600">{dashboardTitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700" data-testid="text-username">
                Welcome, {user?.displayName || user?.firstName || user?.email?.split('@')[0] || "Member"}
              </span>
              
              {/* Admin Role Indicator and View As Controls */}
              {(user?.role === "ORG_ADMIN" || user?.role === "ORG_OWNER" || user?.role === "SUPER_ADMIN") && (
                <>
                  <Badge variant="outline" className={
                    user?.role === "SUPER_ADMIN" 
                      ? "bg-purple-50 text-purple-700 border-purple-200" 
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }>
                    <Shield className="mr-1 h-3 w-3" />
                    {user?.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                  </Badge>
                </>
              )}
              
              <Button variant="outline" onClick={handleViewProfile} data-testid="button-profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
              <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Context Indicator for Super Admins */}
        {user?.role === 'SUPER_ADMIN' && (
          <div className="mb-6">
            {(currentViewType && currentViewType !== user?.role) ? (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-amber-600 mr-2" />
                    <div>
                      <h3 className="font-medium text-amber-800">
                        Viewing as {currentViewType ? currentViewType.replace('_', ' ').toLowerCase() : 'participant'}
                      </h3>
                      <p className="text-sm text-amber-700">
                        You are currently viewing the dashboard with limited access
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                      <User className="mr-1 h-3 w-3" />
                      View Mode Active
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        viewAsStorage.clearViewContext();
                        fetch('/api/super-admin/view-as', { 
                          method: 'DELETE',
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
                            'Content-Type': 'application/json'
                          }
                        }).then(() => {
                          window.location.reload();
                        }).catch(() => {
                          window.location.reload();
                        });
                      }}
                      className="bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200"
                      data-testid="button-return-to-admin"
                    >
                      Return to Admin
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-purple-600 mr-2" />
                  <div>
                    <h3 className="font-medium text-purple-800">Super Admin View</h3>
                    <p className="text-sm text-purple-700">You are viewing as yourself with full admin privileges.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Super Admin Platform Controls */}
        {canViewAdministration && user?.role === "SUPER_ADMIN" && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Super Admin Controls</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  onClick={() => setLocation('/admin/platform')}
                  className="bg-white hover:bg-gray-50"
                  data-testid="button-platform-overview"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Platform Stats
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation('/admin/organizations')}
                  className="bg-white hover:bg-gray-50"
                  data-testid="button-manage-churches"
                >
                  <Church className="mr-2 h-4 w-4" />
                  All Churches
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation('/admin/system')}
                  className="bg-white hover:bg-gray-50"
                  data-testid="button-system-admin"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  System Admin
                </Button>
                <Button
                  variant="outline"
                  disabled
                  className="bg-white hover:bg-gray-50"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Church Admin Controls */}
        {canViewAdministration && user?.role === "ORG_ADMIN" && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Settings className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Church Administration</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => setLocation('/admin')}
                  className="bg-white hover:bg-gray-50"
                  data-testid="button-manage-users"
                >
                  <User className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation('/admin')}
                  className="bg-white hover:bg-gray-50"
                  data-testid="button-view-assessments"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Assessments
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation('/admin')}
                  className="bg-white hover:bg-gray-50"
                  data-testid="button-manage-ministries"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Manage Ministries
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isPlatformView ? (
              // Platform-wide metrics for Super Admin
              <>
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Total Churches</p>
                        <p className="text-3xl font-bold text-charcoal">{(metrics as PlatformMetrics).totalChurches}</p>
                        <p className="text-xs text-green-600 font-medium mt-1">
                          ↗ {(metrics as PlatformMetrics).churchGrowthRate}% growth
                        </p>
                      </div>
                      <div className="bg-purple-100 rounded-full p-3">
                        <Church className="text-purple-600 h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Total Members</p>
                        <p className="text-3xl font-bold text-charcoal">{(metrics as PlatformMetrics).totalMembers}</p>
                        <p className="text-xs text-green-600 font-medium mt-1">
                          ↗ {(metrics as PlatformMetrics).memberGrowthRate}% growth
                        </p>
                      </div>
                      <div className="bg-blue-100 rounded-full p-3">
                        <Users className="text-blue-600 h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Active Users</p>
                        <p className="text-3xl font-bold text-charcoal">{(metrics as PlatformMetrics).activeUsersLast30Days}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Last 30 days
                        </p>
                      </div>
                      <div className="bg-green-100 rounded-full p-3">
                        <Activity className="text-green-600 h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Global Assessments</p>
                        <p className="text-3xl font-bold text-charcoal">{(metrics as PlatformMetrics).globalCompletions}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(metrics as PlatformMetrics).globalCompletionRate}% completion rate
                        </p>
                      </div>
                      <div className="bg-amber-100 rounded-full p-3">
                        <Target className="text-amber-600 h-6 w-6" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Progress value={(metrics as PlatformMetrics).globalCompletionRate} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              // Church-specific metrics for Church Admin
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Members</p>
                      <p className="text-3xl font-bold text-charcoal">{(metrics as ChurchMetrics).totalMembers}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(metrics as ChurchMetrics).activeMembers} active this month
                      </p>
                    </div>
                    <div className="bg-spiritual-blue/10 rounded-full p-3">
                      <Users className="text-spiritual-blue h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress value={((metrics as ChurchMetrics).activeMembers / (metrics as ChurchMetrics).totalMembers) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}

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
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setLocation('/admin')}
                  data-testid="button-view-all-activity"
                >
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
    </MainLayout>
  );
}