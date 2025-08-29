import { useState, useEffect } from "react";
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
  Crown,
  Rocket,
  Globe
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import { Link, useLocation } from "wouter";
import { viewAsStorage } from "@/lib/view-as-storage";
import { useOrganization } from "@/hooks/use-organization";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

// Define metrics interface
interface ChurchMetrics {
  totalMembers: number;
  activeMembers: number;
  totalAssessments: number;
  completionsLast30Days: number;
  completionRate: number;
  pendingAssessments: number;
  averageTimeMinutes: number;
  placementMatches: number;
  availableVolunteers: number;
  ministryOpportunities: number;
  topGifts: Array<{ gift: string; count: number }>;
  ageDistribution: Array<{ group: string; count: number }>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
    userName?: string;
  }>;
}

interface PlatformMetrics {
  // Core statistics
  totalOrganizations: number;
  totalUsers: number;
  totalAssessments: number;
  activeToday: number;
  organizationGrowth: number;
  userGrowth: number;
  completionRate: number;
  avgTimePerAssessment: number;
  
  // Legacy compatibility - keeping old fields that are referenced
  totalChurches: number;
  churchGrowthRate: number;
  activeUsersLast30Days: number;
  globalAssessments: number;
  globalCompletions: number;
  globalCompletionRate: number;
  pendingAssessments?: number;
  
  // Growth data
  churchGrowthData: Array<{
    month: string;
    count: number;
  }>;
  
  // Age and gift distribution
  ageDistribution: Array<{
    group: string;
    count: number;
    percentage: number;
  }>;
  
  giftDistribution: Array<{
    gift: string;
    count: number;
    percentage: number;
  }>;

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

// Platform chart data for Super Admin view
const organizationGrowthData = [
  { month: 'Jan', count: 12 },
  { month: 'Feb', count: 15 },
  { month: 'Mar', count: 18 },
  { month: 'Apr', count: 22 },
  { month: 'May', count: 28 },
  { month: 'Jun', count: 35 },
];

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
    (user?.role === "SUPER_ADMIN" || ["ORG_ADMIN", "ORG_OWNER"].includes(user?.role || ""));
  
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
    retry: false,
    // Use mock data if API fails to ensure dashboard loads
    placeholderData: isPlatformView ? {
      totalOrganizations: 12,
      totalUsers: 1247,
      totalAssessments: 3456,
      activeToday: 45,
      organizationGrowth: 15,
      userGrowth: 8,
      completionRate: 87,
      avgTimePerAssessment: 12,
      totalChurches: 12,
      churchGrowthRate: 15,
      activeUsersLast30Days: 892,
      globalAssessments: 3456,
      globalCompletions: 3008,
      globalCompletionRate: 87,
      pendingAssessments: 448,
      churchGrowthData: organizationGrowthData,
      ageDistribution: [
        { group: "18-25", count: 145, percentage: 12 },
        { group: "26-35", count: 298, percentage: 24 },
        { group: "36-45", count: 356, percentage: 29 },
        { group: "46-55", count: 267, percentage: 21 },
        { group: "56+", count: 181, percentage: 14 }
      ],
      giftDistribution: [
        { gift: "Leadership & Organization", count: 89, percentage: 7 },
        { gift: "Teaching", count: 134, percentage: 11 },
        { gift: "Serving & Helping", count: 156, percentage: 13 },
        { gift: "Faith", count: 98, percentage: 8 },
        { gift: "Mercy", count: 112, percentage: 9 }
      ],
      systemAlerts: [],
      pendingApprovals: { newChurches: 2, featureRequests: 5, supportTickets: 8 },
      recentActivity: [
        {
          type: "Assessment Completed",
          description: "Sarah Johnson completed assessment at First Community Church", 
          timestamp: "2 hours ago",
          userName: "Sarah Johnson",
          organizationName: "First Community Church"
        },
        {
          type: "New Church Registered",
          description: "Grace Baptist Church submitted application",
          timestamp: "4 hours ago",
          organizationName: "Grace Baptist Church"
        }
      ],
      topChurches: [
        { name: "First Community Church", subdomain: "fcc", memberCount: 156, completionRate: 94 },
        { name: "Grace Baptist Church", subdomain: "grace", memberCount: 89, completionRate: 88 }
      ]
    } : undefined,
  });

  // Get data for church pipeline (keeping approved and active for other cards)
  const { data: pendingApplications } = useQuery<any[]>({
    queryKey: ['/api/admin/applications?status=pending'], 
    enabled: isPlatformView && !!user,
    retry: false,
    placeholderData: [],
  });

  const { data: approvedOrgs } = useQuery<any[]>({
    queryKey: ['/api/admin/applications?status=approved'], 
    enabled: isPlatformView && !!user,
    retry: false,
    placeholderData: [],
  });

  const { data: activeOrgs } = useQuery<any[]>({
    queryKey: ['/api/admin/applications?status=active'],
    enabled: isPlatformView && !!user,
    retry: false,
    placeholderData: [],
  });

  const pendingApplicationsCount = pendingApplications?.length || 0;
  const approvedChurchesCount = approvedOrgs?.length || 0;
  const activeChurchesCount = activeOrgs?.length || 0;

  // User activity data for platform charts
  const userActivityData = [
    { name: 'Active Today', value: (platformMetrics as PlatformMetrics)?.activeToday || 45, color: '#3B82F6' },
    { name: 'This Week', value: 128, color: '#10B981' },
    { name: 'This Month', value: 342, color: '#F59E0B' },
  ];
  
  const { data: churchMetrics, isLoading: isChurchLoading, error: churchError } = useQuery<ChurchMetrics>({
    queryKey: ['/api/church-overview', targetOrgId],
    enabled: !isPlatformView && !!targetOrgId && !!user,
    refetchInterval: 30000,
    retry: false,
    // Use mock data if API fails to ensure dashboard loads
    placeholderData: !isPlatformView ? {
      totalMembers: 124,
      activeMembers: 98,
      totalAssessments: 87,
      completionsLast30Days: 23,
      completionRate: 85,
      pendingAssessments: 15,
      averageTimeMinutes: 14,
      placementMatches: 12,
      availableVolunteers: 45,
      ministryOpportunities: 8,
      topGifts: [
        { gift: "SERVING_HELPING", count: 18 },
        { gift: "LEADERSHIP_ORG", count: 15 },
        { gift: "TEACHING", count: 12 },
        { gift: "MERCY", count: 10 }
      ],
      ageDistribution: [
        { group: "18-25", count: 15 },
        { group: "26-35", count: 32 },
        { group: "36-45", count: 42 },
        { group: "46-55", count: 28 },
        { group: "56+", count: 7 }
      ],
      recentActivity: [
        {
          type: "Assessment Completed",
          description: "John Smith completed his spiritual gifts assessment",
          timestamp: "1 hour ago",
          userName: "John Smith"
        },
        {
          type: "Ministry Match",
          description: "Sarah Williams was matched to Children's Ministry",
          timestamp: "3 hours ago",
          userName: "Sarah Williams"
        }
      ]
    } : undefined,
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

  // Safe parsing for age distribution data
  let ageData = [];
  try {
    if (isPlatformView) {
      const platformData = metrics as PlatformMetrics;
      ageData = platformData.ageDistribution || [];
    } else {
      const churchData = metrics as ChurchMetrics;
      ageData = churchData.ageDistribution || [];
    }
  } catch (error) {
    console.error("Failed to parse age distribution data:", error);
    ageData = [];
  }

  // Safe parsing for gift distribution data
  let giftData = [];
  try {
    if (isPlatformView) {
      const platformData = metrics as PlatformMetrics;
      giftData = platformData.giftDistribution || [];
    } else {
      const churchData = metrics as ChurchMetrics;
      giftData = churchData.topGifts?.map((gift, index) => ({
        gift: GIFT_LABELS[gift.gift] || gift.gift,
        count: gift.count,
        percentage: ((gift.count / (churchData.totalMembers || 1)) * 100),
      })) || [];
    }
  } catch (error) {
    console.error("Failed to parse gift distribution data:", error);
    giftData = [];
  }

  // Safe parsing for recent activity data
  let activityData = [];
  try {
    const dataSource = metrics as (PlatformMetrics | ChurchMetrics);
    activityData = dataSource.recentActivity || [];
  } catch (error) {
    console.error("Failed to parse activity data:", error);
    activityData = [];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spiritual-blue/5 to-warm-gold/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-charcoal">{dashboardTitle}</h1>
              <p className="text-gray-600 mt-2">
                {isPlatformView 
                  ? "Monitor platform-wide performance, church applications, and system health across all organizations."
                  : isChurchAdmin
                    ? "Welcome to your church dashboard. Monitor member engagement, track spiritual growth, and manage ministry opportunities."
                    : "Welcome! Explore your spiritual gifts and ministry opportunities within your church community."
                }
              </p>
            </div>
            
            {canViewAdministration && (
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={handleViewProfile}
                  variant="outline"
                  className="bg-white/80 backdrop-blur-sm"
                  data-testid="button-view-profile"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="bg-white/80 backdrop-blur-sm"
                  data-testid="button-logout"
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Super Admin Tools Section - Only for Super Admins */}
        {canViewAdministration && isSuperAdmin && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-charcoal mb-4 flex items-center">
              <Crown className="h-5 w-5 mr-2" />
              Super Admin Controls
            </h2>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Button 
                  onClick={() => setLocation('/admin')}
                  variant="outline"
                  className="flex items-center justify-center p-4 h-auto flex-col space-y-2"
                  data-testid="button-platform-stats"
                >
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm font-medium">Platform</span>
                </Button>
                <Button 
                  onClick={() => setLocation('/admin/organizations')}
                  variant="outline"
                  className="flex items-center justify-center p-4 h-auto flex-col space-y-2"
                  data-testid="button-all-churches"
                >
                  <Church className="h-6 w-6" />
                  <span className="text-sm font-medium">Churches</span>
                </Button>
                <Button 
                  onClick={() => setLocation('/admin/questions')}
                  variant="outline"
                  className="flex items-center justify-center p-4 h-auto flex-col space-y-2"
                  data-testid="button-questions"
                >
                  <BookOpen className="h-6 w-6" />
                  <span className="text-sm font-medium">Questions</span>
                </Button>
                <Button 
                  onClick={() => setLocation('/admin/system')}
                  variant="outline"
                  className="flex items-center justify-center p-4 h-auto flex-col space-y-2"
                  data-testid="button-system-admin"
                >
                  <Settings className="h-6 w-6" />
                  <span className="text-sm font-medium">System</span>
                </Button>
                <Button 
                  onClick={() => setLocation('/admin/reports')}
                  variant="outline"
                  className="flex items-center justify-center p-4 h-auto flex-col space-y-2"
                  data-testid="button-export-report"
                >
                  <Rocket className="h-6 w-6" />
                  <span className="text-sm font-medium">Dashboard</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {isPlatformView ? (
            <>
              {/* Platform Statistics Section */}
              <div>
                <h2 className="text-xl font-semibold text-charcoal mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Platform Statistics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Organizations</p>
                          <p className="text-3xl font-bold text-charcoal">{(platformMetrics as PlatformMetrics)?.totalOrganizations || 12}</p>
                        </div>
                        <Church className="h-12 w-12 text-green-600" />
                      </div>
                      <div className="flex items-center mt-4">
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-sm text-green-600 font-medium">+{(platformMetrics as PlatformMetrics)?.organizationGrowth || 15}% this month</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Users</p>
                          <p className="text-3xl font-bold text-charcoal">{(platformMetrics as PlatformMetrics)?.totalUsers || 1247}</p>
                        </div>
                        <Users className="h-12 w-12 text-blue-600" />
                      </div>
                      <div className="flex items-center mt-4">
                        <TrendingUp className="h-4 w-4 text-blue-600 mr-1" />
                        <span className="text-sm text-blue-600 font-medium">+{(platformMetrics as PlatformMetrics)?.userGrowth || 8}% this week</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Assessments</p>
                          <p className="text-3xl font-bold text-charcoal">{(platformMetrics as PlatformMetrics)?.totalAssessments || 3456}</p>
                        </div>
                        <BarChart3 className="h-12 w-12 text-purple-600" />
                      </div>
                      <div className="flex items-center mt-4">
                        <Activity className="h-4 w-4 text-purple-600 mr-1" />
                        <span className="text-sm text-purple-600 font-medium">{(platformMetrics as PlatformMetrics)?.completionRate || 87}% completion rate</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Active Today</p>
                          <p className="text-3xl font-bold text-charcoal">{(platformMetrics as PlatformMetrics)?.activeToday || 45}</p>
                        </div>
                        <Globe className="h-12 w-12 text-orange-600" />
                      </div>
                      <div className="flex items-center mt-4">
                        <Activity className="h-4 w-4 text-orange-600 mr-1" />
                        <span className="text-sm text-orange-600 font-medium">Avg. {(platformMetrics as PlatformMetrics)?.avgTimePerAssessment || 12} min/assessment</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Application Management Section */}
              <div>
                <h2 className="text-xl font-semibold text-charcoal mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Application Management
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card 
                    className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200 cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105"
                    onClick={() => setLocation('/admin/applications')}
                    data-testid="card-pending-applications"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Pending Applications</p>
                          <p className="text-3xl font-bold text-charcoal">{pendingApplicationsCount}</p>
                          <p className="text-xs text-orange-600 font-medium mt-1">
                            Needs review
                          </p>
                        </div>
                        <div className="bg-orange-100 rounded-full p-3">
                          <Clock className="text-orange-600 h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200 cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105"
                    onClick={() => setLocation('/admin/approved-churches')}
                    data-testid="card-approved-churches"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Approved Churches</p>
                          <p className="text-3xl font-bold text-charcoal">{approvedChurchesCount}</p>
                          <p className="text-xs text-blue-600 font-medium mt-1">
                            Ready to activate
                          </p>
                        </div>
                        <div className="bg-blue-100 rounded-full p-3">
                          <Church className="text-blue-600 h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200 cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105"
                    onClick={() => setLocation('/admin/active-churches')}
                    data-testid="card-active-churches"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Active Churches</p>
                          <p className="text-3xl font-bold text-charcoal">{activeChurchesCount}</p>
                          <p className="text-xs text-green-600 font-medium mt-1">
                            Fully onboarded
                          </p>
                        </div>
                        <div className="bg-green-100 rounded-full p-3">
                          <Church className="text-green-600 h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          ) : null}

          {/* Assessment Analytics Section - Shared for both views */}
          <div>
            <h2 className="text-xl font-semibold text-charcoal mb-4 flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Assessment Analytics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {!isPlatformView && (
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
                      <p className="text-3xl font-bold text-charcoal">{isPlatformView ? (metrics as PlatformMetrics).globalAssessments : (metrics as ChurchMetrics).totalAssessments}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {isPlatformView ? (metrics as PlatformMetrics).globalCompletions : (metrics as ChurchMetrics).completionsLast30Days} this month
                      </p>
                    </div>
                    <div className="bg-sage-green/10 rounded-full p-3">
                      <Trophy className="text-sage-green h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp className="text-sage-green h-4 w-4 mr-1" />
                    <span className="text-sage-green text-sm font-medium">
                      {isPlatformView ? (metrics as PlatformMetrics).globalCompletionRate : (metrics as ChurchMetrics).completionRate}% completion rate
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Pending Assessments</p>
                      <p className="text-3xl font-bold text-charcoal">{isPlatformView ? (metrics as PlatformMetrics).pendingAssessments || 0 : (metrics as ChurchMetrics).pendingAssessments}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Avg. {isPlatformView ? 25 : (metrics as ChurchMetrics).averageTimeMinutes}min to complete
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

              {!isPlatformView && (
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Ministry Matches</p>
                        <p className="text-3xl font-bold text-charcoal">{(metrics as ChurchMetrics).placementMatches}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(metrics as ChurchMetrics).availableVolunteers} volunteers available
                        </p>
                      </div>
                      <div className="bg-purple-100 rounded-full p-3">
                        <Heart className="text-purple-600 h-6 w-6" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center">
                      <Target className="text-purple-600 h-4 w-4 mr-1" />
                      <span className="text-purple-600 text-sm font-medium">
                        {(metrics as ChurchMetrics).ministryOpportunities} opportunities
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Analytics Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Age Distribution Chart */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-charcoal">
                  <PieChart className="h-5 w-5 mr-2" />
                  Age Distribution
                </CardTitle>
                <CardDescription>
                  {isPlatformView ? "Platform-wide age demographics" : "Member age groups in your church"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ageData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={ageData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="count"
                        >
                          {ageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {ageData.map((entry, index) => (
                        <div key={entry.group} className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm text-gray-600">{entry.group}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No age distribution data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Spiritual Gifts Distribution or Growth Chart */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-charcoal">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  {isPlatformView ? "Organization Growth" : "Top Spiritual Gifts"}
                </CardTitle>
                <CardDescription>
                  {isPlatformView ? "Churches joining the platform over time" : "Most common spiritual gifts in your church"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isPlatformView ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={organizationGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : giftData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={giftData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="count"
                        >
                          {giftData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {giftData.slice(0, 6).map((entry, index) => (
                        <div key={entry.gift} className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm text-gray-600">{entry.gift}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No gifts data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center text-charcoal">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                {isPlatformView ? "Latest activity across all churches" : "Recent events in your church"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activityData.length > 0 ? (
                <div className="space-y-3">
                  {activityData.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50">
                      <div className="flex items-center space-x-3">
                        <div className="bg-spiritual-blue/10 rounded-full p-2">
                          <Activity className="h-4 w-4 text-spiritual-blue" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-charcoal">{activity.description}</p>
                          {activity.userName && (
                            <p className="text-xs text-gray-500">by {activity.userName}</p>
                          )}
                          {activity.organizationName && isPlatformView && (
                            <p className="text-xs text-gray-500">at {activity.organizationName}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{activity.timestamp}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent activity to display
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {canViewAdministration && (
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-charcoal">
                  <Rocket className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {isSuperAdmin && (
                    <>
                      <Button 
                        onClick={() => setLocation('/admin/applications')}
                        variant="outline" 
                        className="flex items-center justify-start space-x-2 h-auto p-4"
                        data-testid="button-review-applications"
                      >
                        <Clock className="h-5 w-5" />
                        <span>Review Applications</span>
                      </Button>
                      <Button 
                        onClick={() => setLocation('/admin/organizations')}
                        variant="outline" 
                        className="flex items-center justify-start space-x-2 h-auto p-4"
                        data-testid="button-manage-churches"
                      >
                        <Church className="h-5 w-5" />
                        <span>Manage Churches</span>
                      </Button>
                      <Button 
                        onClick={() => setLocation('/admin/system')}
                        variant="outline" 
                        className="flex items-center justify-start space-x-2 h-auto p-4"
                        data-testid="button-system-settings"
                      >
                        <Settings className="h-5 w-5" />
                        <span>System Settings</span>
                      </Button>
                    </>
                  )}
                  {isChurchAdmin && (
                    <>
                      <Button 
                        onClick={() => setLocation('/admin/participants')}
                        variant="outline" 
                        className="flex items-center justify-start space-x-2 h-auto p-4"
                        data-testid="button-view-members"
                      >
                        <Users className="h-5 w-5" />
                        <span>View Members</span>
                      </Button>
                      <Button 
                        onClick={() => setLocation('/admin/ministry-opportunities')}
                        variant="outline" 
                        className="flex items-center justify-start space-x-2 h-auto p-4"
                        data-testid="button-ministry-opportunities"
                      >
                        <Heart className="h-5 w-5" />
                        <span>Ministry Opportunities</span>
                      </Button>
                    </>
                  )}
                  <Button 
                    onClick={() => setLocation('/assessment')}
                    variant="outline" 
                    className="flex items-center justify-start space-x-2 h-auto p-4"
                    data-testid="button-take-assessment"
                  >
                    <BookOpen className="h-5 w-5" />
                    <span>Take Assessment</span>
                  </Button>
                  <Button 
                    onClick={() => setLocation('/results')}
                    variant="outline" 
                    className="flex items-center justify-start space-x-2 h-auto p-4"
                    data-testid="button-view-results"
                  >
                    <Star className="h-5 w-5" />
                    <span>View Results</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}