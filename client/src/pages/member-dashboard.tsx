import { useAuth } from "@/hooks/useSupabaseAuth";
import { useOrganization } from "@/hooks/use-organization";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ViewAsSwitcher } from "@/components/admin/view-as-switcher";
import { viewAsStorage } from "@/lib/view-as-storage";
import { 
  Play, 
  BarChart3, 
  User, 
  Award, 
  Clock, 
  Crown,
  ChevronRight,
  Calendar,
  Target,
  Users,
  Church,
  Settings,
  Shield
} from "lucide-react";

interface UserResult {
  id: string;
  responseId: string;
  createdAt: string;
  gifts: {
    top1: { name: string; key: string; score: number };
    top2: { name: string; key: string; score: number };
    top3: { name: string; key: string; score: number };
  };
}

export default function MemberDashboard() {
  const { user, signOutMutation } = useAuth();
  const { organization } = useOrganization();
  const [, setLocation] = useLocation();

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
    
  const canManageUsers = effectiveRole === "SUPER_ADMIN" || effectiveRole === "ORG_ADMIN" || effectiveRole === "ORG_OWNER";
  const canViewAllAssessments = effectiveRole === "SUPER_ADMIN" || effectiveRole === "ORG_ADMIN" || effectiveRole === "ORG_LEADER";
  const canManageOrganizations = effectiveRole === "SUPER_ADMIN";
  
  // Debug logging
  console.log("Role-based permissions debug:", {
    currentViewType,
    effectiveRole,
    canViewAdministration,
    canManageUsers,
    canViewAllAssessments,
    canManageOrganizations,
    userRole: user?.role
  });

  // Fetch user's results
  const { data: results = [], isLoading: resultsLoading } = useQuery<UserResult[]>({
    queryKey: ["/api/my-results"],
    enabled: !!user,
    retry: false,
  });

  const hasCompletedAssessment = results.length > 0;
  const latestResult = results[0]; // Most recent result

  const handleStartAssessment = () => {
    console.log("Starting assessment, navigating to /assessment");
    setLocation("/assessment");
  };

  const handleViewResults = () => {
    console.log("Viewing results, navigating to /my-results");
    setLocation("/my-results");
  };

  const handleViewProfile = () => {
    console.log("Viewing profile, navigating to /profile");
    setLocation("/profile");
  };

  const handleLogout = () => {
    console.log("Logging out");
    signOutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Crown className="text-spiritual-blue h-8 w-8 mr-3" />
              <div>
                <h1 className="font-display font-bold text-xl text-charcoal">
                  {organization?.name || "Kingdom Impact Training"}
                </h1>
                <p className="text-sm text-gray-600">Member Dashboard</p>
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
                  {user?.role === "SUPER_ADMIN" && <ViewAsSwitcher user={user} />}
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

      {/* Main Content */}
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
                        // Clear local view context first
                        viewAsStorage.clearViewContext();
                        // Then call API to clear server context
                        fetch('/api/super-admin/view-as', { 
                          method: 'DELETE',
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
                            'Content-Type': 'application/json'
                          }
                        }).then(() => {
                          window.location.reload();
                        }).catch(() => {
                          // Even if API fails, still reload since we cleared local context
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

        {/* Super Admin Status Alert */}
        {user?.role === 'SUPER_ADMIN' && false && (
          <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-purple-600 mr-2" />
              <div>
                <h3 className="font-semibold text-purple-900">Super Administrator Access</h3>
                <p className="text-sm text-purple-700">
                  You have full administrative access. Use "View As" to switch between organizations and manage all church accounts.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Super Admin Platform Overview */}
        {canViewAdministration && user?.role === "SUPER_ADMIN" && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Super Admin Dashboard</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => setLocation('/admin')}
                  className="bg-white hover:bg-gray-50"
                  data-testid="button-platform-overview"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Platform Overview
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation('/admin')}
                  className="bg-white hover:bg-gray-50"
                  data-testid="button-manage-churches"
                >
                  <Church className="mr-2 h-4 w-4" />
                  Manage Churches
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation('/admin')}
                  className="bg-white hover:bg-gray-50"
                  data-testid="button-system-admin"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  System Admin
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Church Admin Section - Only for ORG_ADMIN */}
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

        {/* Role-Based Context Information */}
        {currentViewType && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-amber-600 mr-2" />
                <div>
                  <h3 className="font-medium text-amber-800">
                    {currentViewType === "PARTICIPANT" && "Member Dashboard (Church Attendee)"}
                    {currentViewType === "ORG_LEADER" && "Leader Dashboard (Ministry Leader)"}
                    {currentViewType === "ORG_ADMIN" && "Church Admin Dashboard (Organization Administrator)"}
                  </h3>
                  <p className="text-sm text-amber-700">
                    {currentViewType === "PARTICIPANT" && "Participate in assessments, discover gifts, view personal ministry fit"}
                    {currentViewType === "ORG_LEADER" && "Manage people serving under your ministry team, view team assessments"}
                    {currentViewType === "ORG_ADMIN" && "Oversee entire local church account, manage users and ministries"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Role-Based Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentViewType === "PARTICIPANT" && `Welcome, ${user?.firstName || 'Member'}!`}
            {currentViewType === "ORG_LEADER" && `Welcome, Leader ${user?.firstName || 'Admin'}!`}
            {currentViewType === "ORG_ADMIN" && `Church Admin Dashboard - ${user?.firstName || 'Administrator'}`}
            {!currentViewType && user?.role === "SUPER_ADMIN" && `Super Admin Platform - ${user?.firstName || 'TEMBI'}`}
            {!currentViewType && user?.role !== "SUPER_ADMIN" && `Welcome back, ${user?.firstName || 'Member'}!`}
          </h2>
          <p className="text-gray-600">
            {currentViewType === "PARTICIPANT" && "Participate in assessments, discover your gifts, and view personal ministry fit recommendations"}
            {currentViewType === "ORG_LEADER" && `Manage people serving under your ministry team at ${organization?.name || 'your organization'}`}
            {currentViewType === "ORG_ADMIN" && `Church overview: ${organization?.name || 'your church'} - manage users, assessments and ministries`}
            {!currentViewType && user?.role === "SUPER_ADMIN" && "Platform overview - manage churches, users, and system-wide analytics across KingdomOps"}
            {!currentViewType && user?.role !== "SUPER_ADMIN" && (hasCompletedAssessment 
              ? "View your spiritual gifts and explore new opportunities to serve."
              : "Discover your unique spiritual gifts through our comprehensive assessment."
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conditional Primary Content Based on Role */}
          <div className="lg:col-span-2">
            {/* MEMBER ROLE: Show Assessment Card ONLY */}
            {(effectiveRole === "PARTICIPANT" || currentViewType === "PARTICIPANT") && (
              <Card className="border-spiritual-blue border-2">
              <CardHeader className="text-center pb-4">
                <div className="inline-block p-3 bg-spiritual-blue/10 rounded-full mb-4">
                  {hasCompletedAssessment ? (
                    <Award className="h-8 w-8 text-spiritual-blue" />
                  ) : (
                    <Play className="h-8 w-8 text-spiritual-blue" />
                  )}
                </div>
                <CardTitle className="text-2xl text-spiritual-blue">
                  {hasCompletedAssessment ? "Your Spiritual Gifts" : "Take Assessment"}
                </CardTitle>
                <CardDescription className="text-base">
                  {hasCompletedAssessment 
                    ? "View your complete spiritual gifts profile and ministry recommendations"
                    : "Discover your top 3 spiritual gifts through our 60-question assessment"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {hasCompletedAssessment && latestResult ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">Your Top 3 Spiritual Gifts</p>
                      <div className="flex justify-center space-x-4">
                        <Badge variant="default" className="bg-warm-gold text-spiritual-blue px-4 py-2 text-sm font-semibold">
                          1. {latestResult.gifts.top1.name}
                        </Badge>
                        <Badge variant="outline" className="border-spiritual-blue text-spiritual-blue px-4 py-2 text-sm">
                          2. {latestResult.gifts.top2.name}
                        </Badge>
                        <Badge variant="outline" className="border-gray-300 text-gray-600 px-4 py-2 text-sm">
                          3. {latestResult.gifts.top3.name}
                        </Badge>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex space-x-4">
                      <Button 
                        onClick={handleViewResults} 
                        className="flex-1 bg-spiritual-blue text-white hover:bg-purple-800"
                        data-testid="button-view-results"
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        View Complete Results
                      </Button>
                      <Button 
                        onClick={handleStartAssessment} 
                        variant="outline"
                        className="flex-1 border-spiritual-blue text-spiritual-blue hover:bg-spiritual-blue hover:text-white"
                        data-testid="button-retake-assessment"
                      >
                        Retake Assessment
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-6">
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        <Clock className="inline h-4 w-4 mr-1" />
                        Takes about 15-20 minutes
                      </p>
                      <p className="text-gray-600">
                        <Target className="inline h-4 w-4 mr-1" />
                        60 questions covering 12 spiritual gifts
                      </p>
                    </div>
                    <Button 
                      onClick={handleStartAssessment} 
                      size="lg"
                      className="w-full bg-warm-gold text-spiritual-blue px-8 py-4 text-lg font-semibold hover:bg-yellow-400 transition-colors"
                      data-testid="button-start-assessment"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Start Your Assessment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            )}

            {/* SUPER ADMIN: Show Platform Metrics - NO personal assessment data */}
            {effectiveRole === "SUPER_ADMIN" && !currentViewType && (
              <Card className="border-purple-200 border-2">
                <CardHeader className="text-center pb-4">
                  <div className="inline-block p-3 bg-purple-100 rounded-full mb-4">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-2xl text-gray-900">Platform Metrics</CardTitle>
                  <CardDescription className="text-gray-600">
                    KingdomOps platform overview and system analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-900">
                        1
                      </div>
                      <div className="text-sm text-gray-600">Total Churches</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-900">
                        {results.length}
                      </div>
                      <div className="text-sm text-gray-600">Platform Assessments</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button onClick={() => setLocation('/admin')} className="w-full" data-testid="button-platform-overview">
                      <Church className="mr-2 h-4 w-4" />
                      Manage Churches
                    </Button>
                    <Button variant="outline" onClick={() => setLocation('/admin')} className="w-full" data-testid="button-system-admin">
                      <Settings className="mr-2 h-4 w-4" />
                      System Admin
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CHURCH ADMIN: Show Church Management - NO personal assessment unless they have participant profile */}
            {(effectiveRole === "ORG_ADMIN" || currentViewType === "ORG_ADMIN") && (
              <Card className="border-blue-200 border-2">
                <CardHeader className="text-center pb-4">
                  <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl text-gray-900">Church Management</CardTitle>
                  <CardDescription className="text-gray-600">
                    Manage users, assessments, and ministry assignments for {organization?.name || 'your church'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-900">
                        {results.length}
                      </div>
                      <div className="text-sm text-gray-600">Assessments Completed</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-900">
                        Active
                      </div>
                      <div className="text-sm text-gray-600">Church Status</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button onClick={() => setLocation('/admin')} className="w-full" data-testid="button-manage-church-users">
                      <User className="mr-2 h-4 w-4" />
                      Manage Church Users
                    </Button>
                    <Button variant="outline" onClick={() => setLocation('/admin')} className="w-full" data-testid="button-assessment-reports">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Assessment Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CHURCH LEADER: Show Ministry Team Management - NO church-wide stats */}
            {(effectiveRole === "ORG_LEADER" || currentViewType === "ORG_LEADER") && (
              <Card className="border-green-200 border-2">
                <CardHeader className="text-center pb-4">
                  <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl text-gray-900">Ministry Team</CardTitle>
                  <CardDescription className="text-gray-600">
                    Manage your ministry team members and track their assessment progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-900">
                        {results.length}
                      </div>
                      <div className="text-sm text-gray-600">Team Assessments</div>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-900">
                        Active
                      </div>
                      <div className="text-sm text-gray-600">Ministry Status</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button className="w-full" data-testid="button-manage-team-members">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Team Members
                    </Button>
                    <Button variant="outline" onClick={handleViewResults} className="w-full" data-testid="button-team-assessment-status">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Team Assessment Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organization Info */}
            {organization && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center">
                    <Church className="mr-2 h-5 w-5 text-spiritual-blue" />
                    Your Church
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-gray-900">{organization.name}</h3>
                  {organization.address && (
                    <p className="text-sm text-gray-600 mt-1">{organization.address}</p>
                  )}
                  {organization.website && (
                    <a 
                      href={organization.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-spiritual-blue hover:underline mt-2 inline-block"
                    >
                      Visit Website
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions - Role-based visibility */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Member-specific actions */}
                {(effectiveRole === "PARTICIPANT" || currentViewType === "PARTICIPANT") && (
                  <>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      onClick={handleViewProfile}
                      data-testid="button-edit-profile"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Update Profile
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      onClick={handleViewResults}
                      disabled={!hasCompletedAssessment}
                      data-testid="button-view-results"
                    >
                      <Award className="mr-2 h-4 w-4" />
                      View My Gifts & Fit
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </Button>

                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      data-testid="button-ministry-assignments"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Ministry Assignments
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </Button>
                  </>
                )}

                {/* Leader-specific actions */}
                {(effectiveRole === "ORG_LEADER" || currentViewType === "ORG_LEADER") && (
                  <>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      data-testid="button-manage-team"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Manage Ministry Team
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      onClick={handleViewResults}
                      data-testid="button-team-assessments"
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Team Assessment Status
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </Button>

                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      data-testid="button-ministry-calendar"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Ministry Calendar
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </Button>
                  </>
                )}

                {/* Church Admin-specific actions */}
                {(effectiveRole === "ORG_ADMIN" || currentViewType === "ORG_ADMIN") && (
                  <>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      onClick={() => setLocation('/admin')}
                      data-testid="button-manage-users"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Manage Church Users
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      onClick={() => setLocation('/admin')}
                      data-testid="button-assessment-reports"
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Assessment Reports
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </Button>

                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      data-testid="button-church-settings"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Church Settings
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </Button>
                  </>
                )}

                {/* Super Admin-specific actions */}
                {effectiveRole === "SUPER_ADMIN" && !currentViewType && (
                  <>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      onClick={() => setLocation('/admin')}
                      data-testid="button-platform-metrics"
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Platform Metrics
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      onClick={() => setLocation('/admin')}
                      data-testid="button-manage-churches"
                    >
                      <Church className="mr-2 h-4 w-4" />
                      Manage Churches
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </Button>

                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      data-testid="button-system-tools"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      System Tools
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Progress Stats - Role-based content */}
            {hasCompletedAssessment && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">
                    {effectiveRole === "PARTICIPANT" || currentViewType === "PARTICIPANT"
                      ? "Your Progress"
                      : "Organization Progress"
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {effectiveRole === "PARTICIPANT" || currentViewType === "PARTICIPANT"
                        ? "Assessments Completed"
                        : "Total Assessments"
                      }
                    </span>
                    <Badge variant="secondary">{results.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Assessment</span>
                    <span className="text-sm text-gray-900">
                      {new Date(latestResult.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Show role-specific information */}
                  {currentViewType && (
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Current View</span>
                        <Badge variant="outline" className="text-xs">
                          {currentViewType === "PARTICIPANT" && "Church Member"}
                          {currentViewType === "ORG_LEADER" && "Church Leader"}
                          {currentViewType === "ORG_ADMIN" && "Church Admin"}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}