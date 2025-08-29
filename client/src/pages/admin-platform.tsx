import { useAuth } from "@/hooks/useSupabaseAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { 
  BarChart3, 
  Users, 
  Church, 
  TrendingUp, 
  ArrowLeft,
  Activity,
  Globe,
  Database,
  Shield,
  Rocket
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface PlatformMetrics {
  totalOrganizations: number;
  totalUsers: number;
  totalAssessments: number;
  activeToday: number;
  completionRate: number;
  avgTimePerAssessment: number;
  organizationGrowth: number;
  userGrowth: number;
}

export default function AdminPlatform() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  const { data: metrics, isLoading: metricsLoading } = useQuery<PlatformMetrics>({
    queryKey: ['/api/super-admin/platform-metrics'],
    enabled: user?.role === 'SUPER_ADMIN',
  });


  if (isLoading || metricsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spiritual-blue mb-4 mx-auto"></div>
          <p className="text-charcoal">Loading platform overview...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-charcoal mb-2">Access Denied</h2>
          <p className="text-gray-600">Super Admin access required</p>
          <Button onClick={() => setLocation('/')} className="mt-4">Return Home</Button>
        </div>
      </div>
    );
  }

  // Sample data for charts
  const organizationData = [
    { month: 'Jan', count: 12 },
    { month: 'Feb', count: 15 },
    { month: 'Mar', count: 18 },
    { month: 'Apr', count: 22 },
    { month: 'May', count: 28 },
    { month: 'Jun', count: 35 },
  ];

  const userActivityData = [
    { name: 'Active Today', value: metrics?.activeToday || 45, color: '#3B82F6' },
    { name: 'This Week', value: 128, color: '#10B981' },
    { name: 'This Month', value: 342, color: '#F59E0B' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => setLocation('/')}
                className="mr-4"
                data-testid="button-back-home"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex-shrink-0 flex items-center">
                <BarChart3 className="text-spiritual-blue h-8 w-8 mr-3" />
                <div>
                  <h1 className="font-display font-bold text-xl text-charcoal">
                    Platform Overview
                  </h1>
                  <p className="text-sm text-gray-600">System-wide Analytics & Metrics</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                <Shield className="mr-1 h-3 w-3" />
                Super Admin
              </Badge>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-display font-bold text-3xl text-charcoal">
                Platform Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Monitor system health, usage patterns, and organizational growth across all churches
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Organizations</p>
                    <p className="text-3xl font-bold text-charcoal">{metrics?.totalOrganizations || 12}</p>
                  </div>
                  <Church className="h-12 w-12 text-green-600" />
                </div>
                <div className="flex items-center mt-4">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600 font-medium">+{metrics?.organizationGrowth || 15}% this month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-charcoal">{metrics?.totalUsers || 1247}</p>
                  </div>
                  <Users className="h-12 w-12 text-blue-600" />
                </div>
                <div className="flex items-center mt-4">
                  <TrendingUp className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-sm text-blue-600 font-medium">+{metrics?.userGrowth || 8}% this week</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Assessments</p>
                    <p className="text-3xl font-bold text-charcoal">{metrics?.totalAssessments || 3456}</p>
                  </div>
                  <Database className="h-12 w-12 text-purple-600" />
                </div>
                <div className="flex items-center mt-4">
                  <Activity className="h-4 w-4 text-purple-600 mr-1" />
                  <span className="text-sm text-purple-600 font-medium">{metrics?.completionRate || 87}% completion rate</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Today</p>
                    <p className="text-3xl font-bold text-charcoal">{metrics?.activeToday || 45}</p>
                  </div>
                  <Globe className="h-12 w-12 text-orange-600" />
                </div>
                <div className="flex items-center mt-4">
                  <Activity className="h-4 w-4 text-orange-600 mr-1" />
                  <span className="text-sm text-orange-600 font-medium">Avg. {metrics?.avgTimePerAssessment || 12} min/assessment</span>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Organization Growth Chart */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardHeader>
                <CardTitle className="text-charcoal">Organization Growth</CardTitle>
                <CardDescription>Number of registered churches over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={organizationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* User Activity Chart */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardHeader>
                <CardTitle className="text-charcoal">User Activity</CardTitle>
                <CardDescription>Active users by time period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userActivityData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {userActivityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle className="text-charcoal">Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => setLocation('/admin/organizations')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-manage-organizations"
                >
                  <Church className="mr-2 h-4 w-4" />
                  Manage Organizations
                </Button>
                <Button
                  onClick={() => setLocation('/admin/system')}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  data-testid="button-system-settings"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  System Settings
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/api/super-admin/export-platform-data'}
                  className="w-full"
                  data-testid="button-export-platform-data"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Export Platform Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}