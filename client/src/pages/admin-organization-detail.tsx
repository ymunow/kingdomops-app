import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Users, 
  Mail,
  MapPin,
  Globe,
  Calendar,
  Settings,
  BarChart3,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface OrganizationDetail {
  id: string;
  name: string;
  subdomain?: string;
  contactEmail: string;
  website?: string;
  address?: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TRIAL';
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
  settings: any;
  // Stats
  totalUsers: number;
  totalAssessments: number;
  activeUsers: number;
  completionRate: number;
}

interface OrganizationStats {
  usersByRole: Record<string, number>;
  assessmentsByMonth: Array<{ month: string; count: number }>;
  topGifts: Array<{ gift: string; count: number }>;
  recentActivity: Array<{ type: string; description: string; timestamp: string }>;
}

export default function AdminOrganizationDetail() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Extract organization ID from URL
  const [orgId, setOrgId] = useState<string>("");
  
  useEffect(() => {
    const path = window.location.pathname;
    const id = path.split('/admin/organizations/')[1]?.split('/')[0];
    if (id) setOrgId(id);
  }, []);

  const { data: organization, isLoading: orgLoading, error } = useQuery<OrganizationDetail>({
    queryKey: ['/api/super-admin/organizations', orgId],
    enabled: user?.role === 'SUPER_ADMIN' && !!orgId,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<OrganizationStats>({
    queryKey: ['/api/super-admin/organizations', orgId, 'stats'],
    enabled: user?.role === 'SUPER_ADMIN' && !!orgId,
  });

  // Handle loading states
  if (isLoading || orgLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spiritual-blue/5 to-warm-gold/5">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spiritual-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading organization details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spiritual-blue/5 to-warm-gold/5">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-96">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Organization Not Found</h2>
              <p className="text-gray-600 mb-4">The organization you're looking for doesn't exist or you don't have permission to view it.</p>
              <Button onClick={() => setLocation('/admin/organizations')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Organizations
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'TRIAL':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-spiritual-blue/5 to-warm-gold/5">
      {/* Header */}
      <section className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation('/admin/organizations')}
                data-testid="button-back-to-organizations"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Organizations
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-charcoal flex items-center">
                  {organization.name}
                  <Badge className={`ml-3 ${getStatusColor(organization.status)}`}>
                    {organization.status}
                  </Badge>
                </h1>
                <p className="text-gray-600">Organization ID: {organization.id}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                onClick={() => setLocation(`/admin/organizations/${orgId}/settings`)}
                data-testid="button-organization-settings"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Organization Overview */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardHeader>
                <CardTitle className="text-charcoal">Organization Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Contact Email</p>
                        <p className="text-charcoal">{organization.contactEmail}</p>
                      </div>
                    </div>
                    
                    {organization.website && (
                      <div className="flex items-start">
                        <Globe className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Website</p>
                          <a 
                            href={organization.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-spiritual-blue hover:underline"
                          >
                            {organization.website}
                          </a>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Created</p>
                        <p className="text-charcoal">{new Date(organization.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {organization.subdomain && (
                      <div className="flex items-start">
                        <Globe className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Subdomain</p>
                          <p className="text-charcoal">{organization.subdomain}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start">
                      <FileText className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Invite Code</p>
                        <p className="text-charcoal font-mono bg-gray-100 px-2 py-1 rounded text-sm inline-block">
                          {organization.inviteCode}
                        </p>
                      </div>
                    </div>

                    {organization.address && (
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Address</p>
                          <p className="text-charcoal">{organization.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {organization.description && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                    <p className="text-charcoal">{organization.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Users Section Placeholder */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardHeader>
                <CardTitle className="text-charcoal flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Members & Users
                </CardTitle>
                <CardDescription>Manage organization members and their roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">User Management</p>
                  <p className="mb-4">View and manage all members of this organization</p>
                  <Button variant="outline" disabled>
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardHeader>
                <CardTitle className="text-charcoal">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-spiritual-blue/5 rounded-lg">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-spiritual-blue mr-2" />
                    <span className="text-sm font-medium">Total Members</span>
                  </div>
                  <span className="text-lg font-bold text-spiritual-blue">{organization.totalUsers}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-sage-green/5 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-sage-green mr-2" />
                    <span className="text-sm font-medium">Assessments</span>
                  </div>
                  <span className="text-lg font-bold text-sage-green">{organization.totalAssessments}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-warm-gold/5 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-warm-gold mr-2" />
                    <span className="text-sm font-medium">Completion Rate</span>
                  </div>
                  <span className="text-lg font-bold text-warm-gold">
                    {organization.totalUsers > 0 
                      ? Math.round((organization.totalAssessments / organization.totalUsers) * 100)
                      : 0
                    }%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardHeader>
                <CardTitle className="text-charcoal">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  disabled
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  disabled
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export Reports
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  disabled
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Communications
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}