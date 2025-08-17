import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useOrganization } from "@/hooks/use-organization";
import { BarChart, DonutChart } from "@/components/ui/charts";
import ResultDetailModal from "@/components/admin/result-detail-modal";
import MinistryOpportunities from "@/components/admin/ministry-opportunities";
import { ViewAsSwitcher } from "@/components/admin/view-as-switcher";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Award, 
  Search, 
  Filter, 
  Download,
  BarChart3,
  UserCheck,
  Clock,
  Target,
  Eye,
  Mail,
  FileText,
  UserPlus,
  MoreHorizontal,
  Edit,
  Copy,
  Shield,
  Crown,
  Settings,
  Church,
  Save
} from "lucide-react";

interface DashboardMetrics {
  totalCompletions: number;
  completionsLast30Days: number;
  averageTimeMinutes: number;
  dropOffRate: number;
  topGiftDistribution: Record<string, number>;
  ageGroupDistribution: Record<string, number>;
  weeklyCompletions: { week: string; count: number }[];
}

interface UserResult {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  ageRange?: string;
  role: string;
  organizationId: string;
  latestResult?: {
    id: string;
    top1GiftKey: string;
    top2GiftKey: string;
    top3GiftKey: string;
    submittedAt: string;
    ministryInterests: string[];
  };
  totalAssessments: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { organization, isLoading: orgLoading } = useOrganization();
  
  // Initialize profile form when organization data loads
  React.useEffect(() => {
    if (organization) {
      setProfileForm({
        name: organization.name || "",
        description: organization.description || "",
        website: organization.website || "",
        address: organization.address || ""
      });
    }
  }, [organization]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGift, setFilterGift] = useState<string>("all-gifts");
  const [filterAgeRange, setFilterAgeRange] = useState<string>("all-ages");
  const [selectedResultId, setSelectedResultId] = useState<string>("");
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("PARTICIPANT");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    description: "",
    website: "",
    address: ""
  });

  // Organization switching mutation for super admin
  const switchToOrganizationMutation = useMutation({
    mutationFn: async (organizationId: string) => {
      const response = await fetch("/api/super-admin/view-as", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });
      if (!response.ok) {
        throw new Error("Failed to switch to organization");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/organization"] });
      toast({
        title: "Switched to organization",
        description: "You're now managing this church's data.",
      });
      // Switch to overview tab to show the church's dashboard
      setActiveTab("overview");
    },
    onError: (error) => {
      toast({
        title: "Switch failed",
        description: error.message || "Failed to switch to organization.",
        variant: "destructive",
      });
    },
  });

  const backToChurchesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/super-admin/view-as", {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to return to churches view");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/organization"] });
      setActiveTab("churches");
      toast({
        title: "Returned to Churches",
        description: "You're now viewing the churches list.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to return to churches view.",
        variant: "destructive",
      });
    },
  });

  const toggleOrganizationStatusMutation = useMutation({
    mutationFn: async ({ orgId, newStatus }: { orgId: string; newStatus: 'ACTIVE' | 'INACTIVE' }) => {
      const response = await fetch(`/api/super-admin/organizations/${orgId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) {
        throw new Error('Failed to update organization status');
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/organizations/overview'] });
      toast({
        title: "Success",
        description: `Church ${variables.newStatus.toLowerCase()} successfully`,
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('Toggle organization status error:', error);
      toast({
        title: "Error",
        description: "Failed to update church status",
        variant: "destructive",
      });
    }
  });

  const deleteOrganizationMutation = useMutation({
    mutationFn: async (orgId: string) => {
      const response = await fetch(`/api/super-admin/organizations/${orgId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete organization');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/organizations/overview'] });
      toast({
        title: "Success",
        description: "Church deleted successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('Delete organization error:', error);
      toast({
        title: "Error",
        description: "Failed to delete church",
        variant: "destructive",
      });
    }
  });

  // Update church profile mutation
  const updateChurchProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const response = await fetch(`/api/organizations/${organization?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      if (!response.ok) {
        throw new Error("Failed to update church profile");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/organization"] });
      setIsEditingProfile(false);
      toast({
        title: "Profile Updated",
        description: "Your church profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update church profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Fetch dashboard metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/admin/dashboard/metrics"],
    enabled: !!user
  });

  // Fetch organization users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/dashboard/users", filterGift, filterAgeRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterGift && filterGift !== "all-gifts") params.append("giftKey", filterGift);
      if (filterAgeRange && filterAgeRange !== "all-ages") params.append("ageRange", filterAgeRange);
      
      const response = await fetch(`/api/admin/dashboard/users?${params}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
    enabled: !!user
  });

  // Fetch assessment results
  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ["/api/admin/dashboard/results", filterGift],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterGift && filterGift !== "all-gifts") params.append("giftKey", filterGift);
      
      const response = await fetch(`/api/admin/dashboard/results?${params}`);
      if (!response.ok) throw new Error("Failed to fetch results");
      return response.json();
    },
    enabled: !!user
  });

  // Fetch all organizations (Super Admin only)
  const { data: organizations, isLoading: organizationsLoading } = useQuery({
    queryKey: ["/api/super-admin/organizations/overview"],
    enabled: !!user && (user as any)?.role === "SUPER_ADMIN"
  });

  const handleExportData = async () => {
    try {
      const response = await fetch("/api/admin/export");
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "assessment-results.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export successful",
        description: "Assessment data has been downloaded as CSV"
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Unable to export data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleViewResult = (responseId: string) => {
    setSelectedResultId(responseId);
    setIsResultModalOpen(true);
  };

  const handleCloseResultModal = () => {
    setIsResultModalOpen(false);
    setSelectedResultId("");
  };

  // Role management mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });
      if (!response.ok) throw new Error("Failed to update user role");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/users"] });
      toast({
        title: "Role updated",
        description: "User role has been updated successfully."
      });
      setIsRoleModalOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to update role",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Invite user mutation (using existing congregation signup endpoint)
  const inviteUserMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      // For now, we'll just copy the invite code and show instructions
      // In a real implementation, you might want a dedicated invite endpoint
      if (!organization?.inviteCode) throw new Error("Organization invite code not found");
      
      // Copy invite code to clipboard
      await navigator.clipboard.writeText(organization.inviteCode);
      
      return { inviteCode: organization.inviteCode, email, role };
    },
    onSuccess: (data) => {
      toast({
        title: "Invite instructions copied!",
        description: `Church invite code copied to clipboard. Share with ${data.email} to join as ${data.role}.`,
      });
      setIsInviteModalOpen(false);
      setNewUserEmail("");
      setNewUserRole("PARTICIPANT");
    },
    onError: (error) => {
      toast({
        title: "Failed to prepare invite",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleRoleChange = (user: UserResult, newRole: string) => {
    setSelectedUser(user);
    setNewUserRole(newRole);
    setIsRoleModalOpen(true);
  };

  const confirmRoleChange = () => {
    if (selectedUser) {
      updateUserRoleMutation.mutate({
        userId: selectedUser.id,
        role: newUserRole
      });
    }
  };

  const handleInviteUser = () => {
    if (newUserEmail && newUserRole) {
      inviteUserMutation.mutate({
        email: newUserEmail,
        role: newUserRole
      });
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      'SUPER_ADMIN': 'Super Admin',
      'ORG_OWNER': 'Church Owner',
      'ORG_ADMIN': 'Church Admin',
      'ORG_LEADER': 'Church Leader',
      'ORG_VIEWER': 'Church Viewer',
      'PARTICIPANT': 'Member'
    };
    return roleNames[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const roleColors: Record<string, string> = {
      'SUPER_ADMIN': 'bg-red-100 text-red-800',
      'ORG_OWNER': 'bg-purple-100 text-purple-800',
      'ORG_ADMIN': 'bg-blue-100 text-blue-800',
      'ORG_LEADER': 'bg-green-100 text-green-800',
      'ORG_VIEWER': 'bg-yellow-100 text-yellow-800',
      'PARTICIPANT': 'bg-gray-100 text-gray-800'
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800';
  };

  const canManageUser = (targetUser: UserResult) => {
    if (!user) return false;
    const currentUserRole = (user as any)?.role;
    
    // Super admin can manage anyone
    if (currentUserRole === 'SUPER_ADMIN') return true;
    
    // Org owners can manage anyone in their org except super admins
    if (currentUserRole === 'ORG_OWNER') {
      return targetUser.role !== 'SUPER_ADMIN';
    }
    
    // Org admins can manage leaders, viewers, and participants
    if (currentUserRole === 'ORG_ADMIN') {
      return ['ORG_LEADER', 'ORG_VIEWER', 'PARTICIPANT'].includes(targetUser.role);
    }
    
    return false;
  };

  const filteredUsers = users?.filter((user: UserResult) => {
    const searchMatch = !searchTerm || 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return searchMatch;
  }) || [];

  if (metricsLoading || orgLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spiritual-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {organization?.name ? `${organization.name} - Dashboard` : "Admin Dashboard"}
              </h1>
              <p className="text-gray-600 mt-2">
                {organization?.name ? `Spiritual gifts assessment insights for ${organization.name} congregation` : "Overview of spiritual gifts assessment activity and results."}
              </p>
              {organization?.description && (
                <p className="text-sm text-gray-500 mt-1 italic">
                  {organization.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* View As Switcher for Super Admin */}
              {(user as any)?.role === "SUPER_ADMIN" && (
                <ViewAsSwitcher user={user} className="" />
              )}
              {/* Back to Churches button - only show when managing a specific church */}
              {(user as any)?.viewContext?.isViewingAs && (user as any)?.viewContext?.targetOrganization && (
                <Button 
                  onClick={() => backToChurchesMutation.mutate()}
                  disabled={backToChurchesMutation.isPending}
                  variant="outline"
                  className="border-spiritual-blue text-spiritual-blue hover:bg-spiritual-blue hover:text-white"
                  data-testid="button-back-to-churches"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Back to Churches
                </Button>
              )}
              <Button 
                onClick={handleExportData}
                className="bg-spiritual-blue text-white hover:bg-purple-800"
                data-testid="button-export-data"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full ${(user as any)?.role === "SUPER_ADMIN" ? "grid-cols-5" : (user as any)?.role !== "PARTICIPANT" ? "grid-cols-5" : "grid-cols-4"} bg-white/90 backdrop-blur-sm border border-gray-200 p-1 rounded-xl shadow-lg`}>
            <TabsTrigger 
              value="overview" 
              data-testid="tab-overview"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="people" 
              data-testid="tab-people"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              People
            </TabsTrigger>
            <TabsTrigger 
              value="results" 
              data-testid="tab-results"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              Results
            </TabsTrigger>
            <TabsTrigger 
              value="ministry" 
              data-testid="tab-ministry"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              Ministry
            </TabsTrigger>
            {/* Settings Tab for Church Admins/Owners */}
            {["ORG_OWNER", "ORG_ADMIN"].includes((user as any)?.role) && !(user as any)?.viewContext?.isViewingAs && (
              <TabsTrigger 
                value="settings" 
                data-testid="tab-settings"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                Church Settings
              </TabsTrigger>
            )}
            {/* Churches Tab for Super Admin */}
            {(user as any)?.role === "SUPER_ADMIN" && (
              <TabsTrigger 
                value="churches" 
                data-testid="tab-churches"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                Churches
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Modern Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Assessments */}
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Assessments</p>
                    <p className="text-3xl font-bold text-blue-600">{(metrics as any)?.totalCompletions || 0}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Completed */}
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
                    <p className="text-3xl font-bold text-green-600">{(metrics as any)?.totalCompletions || 0}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Completion Rate */}
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Completion Rate</p>
                    <p className="text-3xl font-bold text-purple-600">{Math.round((1 - ((metrics as any)?.dropOffRate || 0)) * 100)}%</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Total Questions */}
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Questions</p>
                    <p className="text-3xl font-bold text-orange-600">60</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Spiritual Gifts Distribution */}
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-gray-100 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Spiritual Gifts Distribution</h3>
                {(metrics as any)?.topGiftDistribution ? (
                  <BarChart
                    data={Object.entries((metrics as any).topGiftDistribution)
                      .sort(([,a], [,b]) => (b as number) - (a as number))
                      .slice(0, 6)
                      .map(([gift, count]) => ({
                        label: gift.replace(/_/g, " "),
                        value: count as number,
                        color: "bg-gradient-to-r from-blue-500 to-purple-600"
                      }))}
                    height={280}
                    showValues={true}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p>No gift data available</p>
                    <p className="text-sm">Data will appear after assessments are completed</p>
                  </div>
                )}
              </div>

              {/* Age Group Preferences - Pie Chart */}
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-gray-100 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Age Group Preferences</h3>
                {(metrics as any)?.ageGroupDistribution ? (
                  <div className="flex items-center justify-center">
                    <DonutChart
                      data={Object.entries((metrics as any).ageGroupDistribution)
                        .map(([ageGroup, count], index) => ({
                          label: ageGroup,
                          value: count as number,
                          color: [
                            "#3B82F6", // blue
                            "#8B5CF6", // purple
                            "#06B6D4", // cyan
                            "#10B981", // emerald
                            "#F59E0B", // amber
                            "#EF4444"  // red
                          ][index % 6]
                        }))}
                      size={200}
                    />
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p>No age group data available</p>
                    <p className="text-sm">Data will appear after assessments are completed</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-gray-100 shadow-lg">
              <div className="flex items-center mb-6">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Recent Completed Assessments</h3>
              </div>
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>No recent assessments</p>
                <p className="text-sm">Recent activity will appear here as people complete assessments</p>
              </div>
            </div>
          </TabsContent>

          {/* People Tab */}
          <TabsContent value="people" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-users"
                  />
                </div>
              </div>
              <Select value={filterAgeRange} onValueChange={setFilterAgeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Age Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-ages">All Ages</SelectItem>
                  <SelectItem value="18-25">18-25</SelectItem>
                  <SelectItem value="26-35">26-35</SelectItem>
                  <SelectItem value="36-45">36-45</SelectItem>
                  <SelectItem value="46-55">46-55</SelectItem>
                  <SelectItem value="56-65">56-65</SelectItem>
                  <SelectItem value="66+">66+</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterGift} onValueChange={setFilterGift}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Top Gift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-gifts">All Gifts</SelectItem>
                  <SelectItem value="LEADERSHIP_ORG">Leadership</SelectItem>
                  <SelectItem value="TEACHING">Teaching</SelectItem>
                  <SelectItem value="WISDOM_INSIGHT">Wisdom</SelectItem>
                  <SelectItem value="PROPHETIC_DISCERNMENT">Prophetic</SelectItem>
                  <SelectItem value="EXHORTATION">Exhortation</SelectItem>
                  <SelectItem value="SHEPHERDING">Shepherding</SelectItem>
                  <SelectItem value="FAITH">Faith</SelectItem>
                  <SelectItem value="EVANGELISM">Evangelism</SelectItem>
                  <SelectItem value="APOSTLESHIP">Apostleship</SelectItem>
                  <SelectItem value="SERVICE_HOSPITALITY">Service</SelectItem>
                  <SelectItem value="MERCY">Mercy</SelectItem>
                  <SelectItem value="GIVING">Giving</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* People Table */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-spiritual-blue" />
                    People ({filteredUsers.length})
                  </CardTitle>
                  <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-spiritual-blue text-white hover:bg-purple-800" data-testid="button-invite-user">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite New Member</DialogTitle>
                        <DialogDescription>
                          Share your church invite code with the new member to join with the selected role.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="invite-email">Email Address</Label>
                          <Input
                            id="invite-email"
                            placeholder="john.doe@email.com"
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            data-testid="input-invite-email"
                          />
                        </div>
                        <div>
                          <Label htmlFor="invite-role">Role</Label>
                          <Select value={newUserRole} onValueChange={setNewUserRole}>
                            <SelectTrigger data-testid="select-invite-role">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PARTICIPANT">Member</SelectItem>
                              <SelectItem value="ORG_VIEWER">Church Viewer</SelectItem>
                              <SelectItem value="ORG_LEADER">Church Leader</SelectItem>
                              {((user as any)?.role === 'SUPER_ADMIN' || (user as any)?.role === 'ORG_OWNER') && (
                                <>
                                  <SelectItem value="ORG_ADMIN">Church Admin</SelectItem>
                                  {(user as any)?.role === 'SUPER_ADMIN' && (
                                    <SelectItem value="ORG_OWNER">Church Owner</SelectItem>
                                  )}
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Instructions:</strong> The church invite code will be copied to your clipboard. 
                            Share it with {newUserEmail || 'the new member'} along with instructions to visit the signup page.
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInviteModalOpen(false)}>Cancel</Button>
                        <Button 
                          onClick={handleInviteUser}
                          disabled={!newUserEmail || inviteUserMutation.isPending}
                          data-testid="button-send-invite"
                        >
                          {inviteUserMutation.isPending ? 'Processing...' : 'Copy Invite Code'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-spiritual-blue mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading people...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">Name</th>
                          <th className="text-left p-2 font-medium">Email</th>
                          <th className="text-left p-2 font-medium">Role</th>
                          <th className="text-left p-2 font-medium">Age Range</th>
                          <th className="text-left p-2 font-medium">Top Gifts</th>
                          <th className="text-left p-2 font-medium">Last Assessment</th>
                          <th className="text-left p-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user: UserResult) => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">
                              {user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName}`
                                : user.email.split('@')[0]
                              }
                            </td>
                            <td className="p-2 text-sm text-gray-600">{user.email}</td>
                            <td className="p-2">
                              <Badge className={`text-xs ${getRoleBadgeColor(user.role)}`}>
                                {user.role === 'SUPER_ADMIN' && <Crown className="h-3 w-3 mr-1" />}
                                {user.role === 'ORG_OWNER' && <Shield className="h-3 w-3 mr-1" />}
                                {getRoleDisplayName(user.role)}
                              </Badge>
                            </td>
                            <td className="p-2">
                              {user.ageRange && (
                                <Badge variant="outline">{user.ageRange}</Badge>
                              )}
                            </td>
                            <td className="p-2">
                              {user.latestResult && (
                                <div className="flex flex-wrap gap-1">
                                  <Badge className="text-xs bg-spiritual-blue text-white">
                                    {user.latestResult.top1GiftKey.replace(/_/g, " ")}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {user.latestResult.top2GiftKey.replace(/_/g, " ")}
                                  </Badge>
                                </div>
                              )}
                            </td>
                            <td className="p-2 text-sm">
                              {user.latestResult ? (
                                <div>
                                  {new Date(user.latestResult.submittedAt).toLocaleDateString()}
                                  <div className="text-xs text-gray-500">
                                    {user.totalAssessments} total
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400">No assessments</span>
                              )}
                            </td>
                            <td className="p-2">
                              <div className="flex gap-2">
                                {user.latestResult && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleViewResult(user.latestResult!.id)}
                                    data-testid={`button-view-result-${user.id}`}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View Result
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => window.location.href = `mailto:${user.email}`}
                                  data-testid={`button-email-${user.id}`}
                                >
                                  <Mail className="h-3 w-3 mr-1" />
                                  Email
                                </Button>
                                {canManageUser(user) && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button size="sm" variant="outline" data-testid={`button-manage-${user.id}`}>
                                        <MoreHorizontal className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuItem onClick={() => handleRoleChange(user, 'PARTICIPANT')}>
                                        <Edit className="h-3 w-3 mr-2" />
                                        Change to Member
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleRoleChange(user, 'ORG_VIEWER')}>
                                        <Edit className="h-3 w-3 mr-2" />
                                        Change to Viewer
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleRoleChange(user, 'ORG_LEADER')}>
                                        <Edit className="h-3 w-3 mr-2" />
                                        Change to Leader
                                      </DropdownMenuItem>
                                      {((user as any)?.role === 'SUPER_ADMIN' || (user as any)?.role === 'ORG_OWNER') && (
                                        <DropdownMenuItem onClick={() => handleRoleChange(user, 'ORG_ADMIN')}>
                                          <Edit className="h-3 w-3 mr-2" />
                                          Change to Admin
                                        </DropdownMenuItem>
                                      )}
                                      {(user as any)?.role === 'SUPER_ADMIN' && (
                                        <DropdownMenuItem onClick={() => handleRoleChange(user, 'ORG_OWNER')}>
                                          <Edit className="h-3 w-3 mr-2" />
                                          Change to Owner
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-spiritual-blue" />
                  Assessment Results Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resultsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-spiritual-blue mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading results...</p>
                  </div>
                ) : results && results.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-spiritual-blue/10 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-spiritual-blue">{results.length}</div>
                        <div className="text-sm text-gray-600">Total Results</div>
                      </div>
                      <div className="bg-warm-gold/10 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-warm-gold">
                          {Math.round(results.filter((r: any) => r.completedAt).length / results.length * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">Completion Rate</div>
                      </div>
                      <div className="bg-sage-green/10 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-sage-green">
                          {new Date().getMonth() + 1}
                        </div>
                        <div className="text-sm text-gray-600">This Month</div>
                      </div>
                    </div>
                    
                    {/* Individual Results List */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg text-gray-800 mb-4">Individual Assessment Results</h3>
                      <div className="grid gap-4">
                        {results.map((result: any, index: number) => (
                          <div key={result.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-spiritual-blue text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {result.userEmail || `Participant ${index + 1}`}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Completed: {result.completedAt ? new Date(result.completedAt).toLocaleDateString() : 'In Progress'}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {result.top1GiftKey && (
                                    <Badge variant="outline" className="text-xs bg-spiritual-blue/10 text-spiritual-blue border-spiritual-blue/30">
                                      Top Gift: {result.top1GiftKey.replace('_', ' ')}
                                    </Badge>
                                  )}
                                  {result.top2GiftKey && (
                                    <Badge variant="outline" className="text-xs bg-warm-gold/10 text-warm-gold border-warm-gold/30">
                                      2nd: {result.top2GiftKey.replace('_', ' ')}
                                    </Badge>
                                  )}
                                  {result.top3GiftKey && (
                                    <Badge variant="outline" className="text-xs bg-sage-green/10 text-sage-green border-sage-green/30">
                                      3rd: {result.top3GiftKey.replace('_', ' ')}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(`/results/${result.responseId}`, '_blank')}
                                  className="border-spiritual-blue text-spiritual-blue hover:bg-spiritual-blue hover:text-white"
                                  data-testid={`button-view-result-${result.id}`}
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  View Results
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No assessment results found</p>
                    <p className="text-sm">Results will appear here once people complete assessments</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ministry Tab */}
          <TabsContent value="ministry" className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
              <MinistryOpportunities />
            </div>
          </TabsContent>

          {/* Churches Tab (Super Admin Only) */}
          {(user as any)?.role === "SUPER_ADMIN" && (
            <TabsContent value="churches" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-spiritual-blue" />
                    Registered Churches ({Array.isArray(organizations) ? organizations.length : 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {organizationsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-spiritual-blue mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Loading churches...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Array.isArray(organizations) && organizations.map((org: any) => (
                        <Card key={org.id} className="bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-gray-200">
                          <CardHeader>
                            <CardTitle className="text-lg">{org.name}</CardTitle>
                            {org.subdomain && (
                              <Badge variant="outline" className="w-fit">
                                ID: {org.subdomain}
                              </Badge>
                            )}
                            <div className="mt-2">
                              <Badge variant="secondary" className="w-fit">
                                Signup URL: /join/{org.id.slice(0, 8)}...
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="text-sm text-gray-600">
                              <p><strong>Contact:</strong> {org.contactEmail}</p>
                              {org.website && (
                                <p><strong>Website:</strong> <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{org.website}</a></p>
                              )}
                              <p><strong>Address:</strong> {org.address}</p>
                              <p><strong>Status:</strong> <Badge variant={org.status === "ACTIVE" ? "default" : "secondary"}>{org.status}</Badge></p>
                            </div>
                            {org.description && (
                              <p className="text-sm text-gray-700 line-clamp-2">{org.description}</p>
                            )}
                            {org.metrics && (
                              <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-blue-600">{org.metrics.totalCompletions || 0}</p>
                                  <p className="text-xs text-gray-500">Assessments</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-green-600">{org.metrics.totalUsers || 0}</p>
                                  <p className="text-xs text-gray-500">Members</p>
                                </div>
                              </div>
                            )}
                            <div className="pt-3 border-t space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => switchToOrganizationMutation.mutate(org.id)}
                                  disabled={switchToOrganizationMutation.isPending}
                                  className="bg-spiritual-blue text-white hover:bg-purple-800 flex-1"
                                  data-testid={`button-manage-church-${org.id}`}
                                >
                                  <Shield className="h-3 w-3 mr-1" />
                                  Manage Church
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => window.open(`/join/${org.id}`, '_blank')}
                                  className="text-xs"
                                  data-testid={`button-view-signup-${org.id}`}
                                >
                                  Signup Link
                                </Button>
                              </div>
                              <div className="flex items-center gap-2 pt-2">
                                <Button 
                                  size="sm" 
                                  variant={org.status === "ACTIVE" ? "destructive" : "default"}
                                  onClick={() => toggleOrganizationStatusMutation.mutate({
                                    orgId: org.id,
                                    newStatus: org.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
                                  })}
                                  disabled={toggleOrganizationStatusMutation.isPending}
                                  className="text-xs flex-1"
                                  data-testid={`button-toggle-status-${org.id}`}
                                >
                                  {org.status === "ACTIVE" ? "Deactivate" : "Activate"}
                                </Button>
                                {org.id !== 'default-org-001' && (
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => {
                                      if (window.confirm(`Are you sure you want to permanently delete "${org.name}"? This action cannot be undone and will remove all associated users and data.`)) {
                                        deleteOrganizationMutation.mutate(org.id);
                                      }
                                    }}
                                    disabled={deleteOrganizationMutation.isPending}
                                    className="text-xs"
                                    data-testid={`button-delete-${org.id}`}
                                  >
                                    Delete
                                  </Button>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 text-center">
                                Registered: {new Date(org.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  {!organizationsLoading && (!organizations || !Array.isArray(organizations) || organizations.length === 0) && (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Churches Registered</h3>
                      <p className="text-gray-600 mb-6">Churches will appear here after they register through the signup form.</p>
                      <Button 
                        onClick={() => window.open('/church-signup', '_blank')}
                        className="bg-spiritual-blue hover:bg-purple-800"
                      >
                        View Signup Form
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          {/* Church Settings Tab (for Church Admins/Owners only) */}
          {["ORG_OWNER", "ORG_ADMIN"].includes((user as any)?.role) && !(user as any)?.viewContext?.isViewingAs && (
            <TabsContent value="settings" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Church className="h-5 w-5 mr-2 text-spiritual-blue" />
                    Church Profile & Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Church Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Church Information</h3>
                    
                    {!isEditingProfile ? (
                      <div className="space-y-4">
                        {/* Current Information Display */}
                        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Church Name</Label>
                              <p className="text-gray-900 font-medium mt-1">{organization?.name}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Website</Label>
                              <p className="text-gray-900 mt-1">{organization?.website || "Not specified"}</p>
                            </div>
                            <div className="md:col-span-2">
                              <Label className="text-sm font-medium text-gray-700">Address</Label>
                              <p className="text-gray-900 mt-1">{organization?.address || "Not specified"}</p>
                            </div>
                            <div className="md:col-span-2">
                              <Label className="text-sm font-medium text-gray-700">Description</Label>
                              <p className="text-gray-900 mt-1">{organization?.description || "No description provided"}</p>
                            </div>
                          </div>
                          
                          {/* Invite Code Section - Prominently displayed */}
                          <div className="bg-spiritual-blue/10 border border-spiritual-blue/20 rounded-lg p-4 mt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="text-sm font-medium text-spiritual-blue">Congregation Join Code</Label>
                                <div className="flex items-center space-x-3 mt-2">
                                  <div className="text-2xl font-mono font-bold text-spiritual-blue">
                                    {organization?.inviteCode}
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      navigator.clipboard.writeText(organization?.inviteCode || "");
                                      toast({
                                        title: "Code Copied!",
                                        description: "Invite code copied to clipboard."
                                      });
                                    }}
                                    className="border-spiritual-blue text-spiritual-blue hover:bg-spiritual-blue hover:text-white"
                                    data-testid="button-copy-invite-code"
                                  >
                                    <Copy className="h-4 w-4 mr-1" />
                                    Copy
                                  </Button>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                  Share this code with your congregation members so they can join and take assessments.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => setIsEditingProfile(true)}
                          className="bg-spiritual-blue text-white hover:bg-purple-800"
                          data-testid="button-edit-profile"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Church Profile
                        </Button>
                      </div>
                    ) : (
                      /* Edit Form */
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="churchName">Church Name</Label>
                            <Input
                              id="churchName"
                              value={profileForm.name}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                              data-testid="input-church-name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="website">Website</Label>
                            <Input
                              id="website"
                              value={profileForm.website}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, website: e.target.value }))}
                              placeholder="https://yourchurch.com"
                              data-testid="input-website"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                              id="address"
                              value={profileForm.address}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                              placeholder="123 Main St, City, State 12345"
                              data-testid="input-address"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                              id="description"
                              value={profileForm.description}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, description: e.target.value }))}
                              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-spiritual-blue focus:border-transparent"
                              rows={3}
                              placeholder="Brief description of your church..."
                              data-testid="textarea-description"
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <Button 
                            onClick={() => updateChurchProfileMutation.mutate(profileForm)}
                            disabled={updateChurchProfileMutation.isPending}
                            className="bg-spiritual-blue text-white hover:bg-purple-800"
                            data-testid="button-save-profile"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {updateChurchProfileMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setIsEditingProfile(false);
                              // Reset form to original values
                              if (organization) {
                                setProfileForm({
                                  name: organization.name || "",
                                  description: organization.description || "",
                                  website: organization.website || "",
                                  address: organization.address || ""
                                });
                              }
                            }}
                            data-testid="button-cancel-edit"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Usage Stats */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Church Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{(metrics as any)?.totalCompletions || 0}</p>
                        <p className="text-sm text-blue-700">Total Assessments</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{users?.length || 0}</p>
                        <p className="text-sm text-green-700">Registered Members</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{Math.round((1 - ((metrics as any)?.dropOffRate || 0)) * 100)}%</p>
                        <p className="text-sm text-purple-700">Completion Rate</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Result Detail Modal */}
      <ResultDetailModal
        isOpen={isResultModalOpen}
        onClose={handleCloseResultModal}
        resultId={selectedResultId}
      />

      {/* Role Change Confirmation Modal */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to change {selectedUser?.firstName || selectedUser?.email}'s role to {getRoleDisplayName(newUserRole)}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Changing a user's role will immediately affect their permissions and access to features within the church management system.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-sm font-medium">Current Role:</p>
                <Badge className={`${getRoleBadgeColor(selectedUser?.role || '')}`}>
                  {getRoleDisplayName(selectedUser?.role || '')}
                </Badge>
              </div>
              <div>→</div>
              <div>
                <p className="text-sm font-medium">New Role:</p>
                <Badge className={`${getRoleBadgeColor(newUserRole)}`}>
                  {getRoleDisplayName(newUserRole)}
                </Badge>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmRoleChange}
              disabled={updateUserRoleMutation.isPending}
              data-testid="button-confirm-role-change"
            >
              {updateUserRoleMutation.isPending ? 'Updating...' : 'Change Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}