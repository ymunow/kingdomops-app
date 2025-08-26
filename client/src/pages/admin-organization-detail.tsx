import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Download,
  MoreHorizontal,
  UserCheck,
  XCircle,
  Edit3,
  TrendingUp,
  Activity,
  Heart,
  BookOpen,
  MessageSquare,
  Image,
  Shield,
  KeyRound,
  ExternalLink,
  Phone
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface OrganizationDetail {
  id: string;
  name: string;
  subdomain?: string;
  contactEmail: string;
  contactName?: string;
  contactRole?: string;
  contactPhone?: string;
  website?: string;
  address?: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'PENDING' | 'APPROVED' | 'DENIED' | 'SUSPENDED';
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
  approvedAt?: string;
  activatedAt?: string;
  settings: any;
  // Dashboard Stats
  totalMembers: number;
  activeUsers30Days: number;
  memberGrowthPercent: number;
  pendingInvitations: number;
  groupsCreated: number;
  eventsCreatedQuarter: number;
  healthScore: number;
  assessmentsCompleted: number;
  pendingAssessments: number;
  ministryMatches: number;
  volunteerOpportunities: number;
  posts30Days: number;
  prayerRequests: number;
  announcementsSent: number;
  mediaUploaded: number;
  // Application notes
  adminNotes?: string;
}

interface OrganizationStats {
  usersByRole: Record<string, number>;
  assessmentsByMonth: Array<{ month: string; count: number }>;
  topGifts: Array<{ gift: string; count: number }>;
  recentActivity: Array<{ type: string; description: string; timestamp: string }>;
  memberGrowthData: Array<{ month: string; members: number }>;
  activityBreakdown: Array<{ name: string; value: number; color: string }>;
  weeklyActivity: Array<{ day: string; activity: number }>;
}

interface OrganizationMember {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
  hasCompletedAssessment: boolean;
  assessmentDate?: string;
  topGifts?: string[];
  joinedAt: string;
  lastActive?: string;
}

// Members Table Component
function MembersTable({ organizationId, organizationName }: { organizationId: string; organizationName: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data: members, isLoading: membersLoading } = useQuery<OrganizationMember[]>({
    queryKey: ['/api/super-admin/organizations', organizationId, 'members'],
    enabled: !!organizationId,
  });

  if (membersLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spiritual-blue mx-auto mb-4"></div>
        <p className="text-gray-600">Loading members...</p>
      </div>
    );
  }

  const filteredMembers = members?.filter(member => {
    const matchesSearch = !searchTerm || 
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "ALL" || member.role === roleFilter;
    const matchesStatus = statusFilter === "ALL" || member.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ORG_ADMIN':
      case 'ORG_OWNER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ORG_LEADER':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="member-search">Search Members</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="member-search"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-members"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="min-w-[150px]">
            <Label>Role</Label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger data-testid="select-role-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="MEMBER">Member</SelectItem>
                <SelectItem value="ORG_LEADER">Leader</SelectItem>
                <SelectItem value="ORG_ADMIN">Admin</SelectItem>
                <SelectItem value="ORG_OWNER">Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[150px]">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="select-status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Members Table */}
      {filteredMembers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">Member</th>
                <th className="text-left p-4 font-medium text-gray-700">Role</th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
                <th className="text-left p-4 font-medium text-gray-700">Assessment</th>
                <th className="text-left p-4 font-medium text-gray-700">Top Gifts</th>
                <th className="text-left p-4 font-medium text-gray-700">Joined</th>
                <th className="text-left p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-charcoal">
                        {member.firstName && member.lastName 
                          ? `${member.firstName} ${member.lastName}`
                          : member.email
                        }
                      </p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge className={getRoleColor(member.role)}>
                      {member.role.replace('ORG_', '').replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge className={getStatusColor(member.status)}>
                      {member.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      {member.hasCompletedAssessment ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <div>
                            <span className="text-green-600 text-sm font-medium">Completed</span>
                            {member.assessmentDate && (
                              <p className="text-xs text-gray-500">
                                {new Date(member.assessmentDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-orange-500 mr-2" />
                          <span className="text-orange-600 text-sm">Pending</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {member.topGifts && member.topGifts.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {member.topGifts.slice(0, 2).map((gift, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {gift.replace('_', ' ')}
                          </Badge>
                        ))}
                        {member.topGifts.length > 2 && (
                          <span className="text-xs text-gray-500">+{member.topGifts.length - 2} more</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-600">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {member.hasCompletedAssessment && (
                          <DropdownMenuItem disabled>
                            <Eye className="mr-2 h-4 w-4" />
                            View Results
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem disabled>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Manage Role
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No Members Found</p>
          <p className="mb-4">
            {searchTerm || roleFilter !== "ALL" || statusFilter !== "ALL" 
              ? "No members match your current filters." 
              : "This organization has no members yet."
            }
          </p>
          {(searchTerm || roleFilter !== "ALL" || statusFilter !== "ALL") && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setRoleFilter("ALL");
                setStatusFilter("ALL");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminOrganizationDetail() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Extract organization ID from URL
  const [orgId, setOrgId] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  
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

  // Initialize notes when organization loads
  useEffect(() => {
    if (organization?.adminNotes) {
      setAdminNotes(organization.adminNotes);
    }
  }, [organization]);

  // Approval/Rejection mutations
  const approveMutation = useMutation({
    mutationFn: (orgId: string) => 
      apiRequest('POST', `/api/admin/orgs/${orgId}/approve`),
    onSuccess: () => {
      toast({ title: "Success", description: "Application approved successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/organizations', orgId] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orgs'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to approve application",
        variant: "destructive" 
      });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ orgId, reason }: { orgId: string; reason: string }) => 
      apiRequest('POST', `/api/admin/orgs/${orgId}/reject`, { reason }),
    onSuccess: () => {
      toast({ title: "Success", description: "Application rejected successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/organizations', orgId] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orgs'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to reject application",
        variant: "destructive" 
      });
    }
  });

  const updateNotesMutation = useMutation({
    mutationFn: ({ orgId, notes }: { orgId: string; notes: string }) => 
      apiRequest('POST', `/api/admin/orgs/${orgId}/notes`, { adminNotes: notes }),
    onSuccess: () => {
      toast({ title: "Success", description: "Notes updated successfully!" });
      setIsEditingNotes(false);
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/organizations', orgId] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update notes",
        variant: "destructive" 
      });
    }
  });

  const handleApprove = () => {
    if (window.confirm(`Are you sure you want to approve ${organization?.name}?`)) {
      approveMutation.mutate(orgId);
    }
  };

  const handleReject = () => {
    const reason = window.prompt("Please provide a reason for rejection:");
    if (reason && reason.trim()) {
      rejectMutation.mutate({ orgId, reason: reason.trim() });
    }
  };

  const handleSaveNotes = () => {
    updateNotesMutation.mutate({ orgId, notes: adminNotes });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DENIED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'TRIAL':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Mock data for charts when stats are not available
  const mockMemberGrowthData = [
    { month: 'Jan', members: 45 },
    { month: 'Feb', members: 52 },
    { month: 'Mar', members: 61 },
    { month: 'Apr', members: 68 },
    { month: 'May', members: 75 },
    { month: 'Jun', members: 82 }
  ];

  const mockActivityBreakdown = [
    { name: 'Posts', value: 35, color: '#4A90E2' },
    { name: 'Assessments', value: 25, color: '#7ED321' },
    { name: 'Events', value: 20, color: '#F5A623' },
    { name: 'Prayer Requests', value: 20, color: '#D0021B' }
  ];

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
              {/* Application Actions for Pending Status */}
              {organization.status === 'PENDING' && (
                <>
                  <Button 
                    onClick={handleApprove}
                    disabled={approveMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    data-testid="button-approve-application"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {approveMutation.isPending ? 'Approving...' : 'Approve'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleReject}
                    disabled={rejectMutation.isPending}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    data-testid="button-reject-application"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                  </Button>
                </>
              )}
              
              <Button 
                variant="outline"
                onClick={() => setLocation(`/admin/organizations/${orgId}/overview`)}
                data-testid="button-church-overview"
                className="bg-spiritual-blue/5 border-spiritual-blue/20 text-spiritual-blue hover:bg-spiritual-blue/10"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Church Overview
              </Button>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section with Primary Contact and Subdomain */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle className="text-charcoal flex items-center">
                <Users className="h-5 w-5 mr-2 text-spiritual-blue" />
                Primary Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-charcoal">{organization.contactEmail}</p>
                </div>
              </div>
              {organization.contactName && (
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Name & Role</p>
                    <p className="text-charcoal">{organization.contactName} {organization.contactRole && `- ${organization.contactRole}`}</p>
                  </div>
                </div>
              )}
              {organization.contactPhone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone</p>
                    <p className="text-charcoal">{organization.contactPhone}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle className="text-charcoal flex items-center">
                <Globe className="h-5 w-5 mr-2 text-spiritual-blue" />
                Church URL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Subdomain</p>
                  <a 
                    href={`https://${organization.subdomain || organization.name.toLowerCase().replace(/\\s+/g, '')}.kingdomops.org`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-spiritual-blue hover:underline flex items-center"
                    data-testid="link-church-subdomain"
                  >
                    {organization.subdomain || organization.name.toLowerCase().replace(/\\s+/g, '')}.kingdomops.org
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Cards (6 cards across) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-spiritual-blue/10 to-spiritual-blue/5 border-spiritual-blue/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Members</p>
                  <p className="text-2xl font-bold text-charcoal">{organization.totalMembers || 0}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{organization.memberGrowthPercent || 0}% this month
                  </p>
                </div>
                <Users className="h-8 w-8 text-spiritual-blue/70" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-sage-green/10 to-sage-green/5 border-sage-green/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-charcoal">{organization.activeUsers30Days || 0}</p>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </div>
                <Activity className="h-8 w-8 text-sage-green/70" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warm-gold/10 to-warm-gold/5 border-warm-gold/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Invites</p>
                  <p className="text-2xl font-bold text-charcoal">{organization.pendingInvitations || 0}</p>
                  <p className="text-xs text-gray-500">Unconfirmed</p>
                </div>
                <Clock className="h-8 w-8 text-warm-gold/70" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-100/50 to-purple-50/30 border-purple-200/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Groups Created</p>
                  <p className="text-2xl font-bold text-charcoal">{organization.groupsCreated || 0}</p>
                  <p className="text-xs text-gray-500">Ministries</p>
                </div>
                <Users className="h-8 w-8 text-purple-500/70" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-100/50 to-blue-50/30 border-blue-200/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Events Created</p>
                  <p className="text-2xl font-bold text-charcoal">{organization.eventsCreatedQuarter || 0}</p>
                  <p className="text-xs text-gray-500">This quarter</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500/70" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-100/50 to-emerald-50/30 border-emerald-200/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Health Score</p>
                  <p className="text-2xl font-bold text-charcoal">{organization.healthScore || 85}/100</p>
                  <p className="text-xs text-emerald-600">Excellent</p>
                </div>
                <Heart className="h-8 w-8 text-emerald-500/70" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Engagement & Growth Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle className="text-charcoal flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-spiritual-blue" />
                Member Growth Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.memberGrowthData || mockMemberGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="members" stroke="#4A90E2" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle className="text-charcoal flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-spiritual-blue" />
                Activity Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.activityBreakdown || mockActivityBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {(stats?.activityBreakdown || mockActivityBreakdown).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ministry & Spiritual Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Assessments Completed</p>
                  <p className="text-xl font-bold text-charcoal">{organization.assessmentsCompleted || 0}</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Assessments</p>
                  <p className="text-xl font-bold text-charcoal">{organization.pendingAssessments || 0}</p>
                </div>
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ministry Matches</p>
                  <p className="text-xl font-bold text-charcoal">{organization.ministryMatches || 0}</p>
                </div>
                <UserCheck className="h-6 w-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Volunteer Opportunities</p>
                  <p className="text-xl font-bold text-charcoal">{organization.volunteerOpportunities || 0}</p>
                </div>
                <Heart className="h-6 w-6 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Communication Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Posts in Feed</p>
                  <p className="text-xl font-bold text-charcoal">{organization.posts30Days || 0}</p>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </div>
                <MessageSquare className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Prayer Requests</p>
                  <p className="text-xl font-bold text-charcoal">{organization.prayerRequests || 0}</p>
                </div>
                <Heart className="h-6 w-6 text-pink-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Announcements Sent</p>
                  <p className="text-xl font-bold text-charcoal">{organization.announcementsSent || 0}</p>
                </div>
                <FileText className="h-6 w-6 text-indigo-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Photos/Media Uploaded</p>
                  <p className="text-xl font-bold text-charcoal">{organization.mediaUploaded || 0}</p>
                </div>
                <Image className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline / Activity Log */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle className="text-charcoal flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-spiritual-blue" />
              Timeline & Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-4"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Date Applied</p>
                  <p className="text-xs text-gray-500">{new Date(organization.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              {organization.approvedAt && (
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-4"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Date Approved</p>
                    <p className="text-xs text-gray-500">{new Date(organization.approvedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              
              {organization.activatedAt && (
                <div className="flex items-center p-3 bg-emerald-50 rounded-lg">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-4"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Date Activated</p>
                    <p className="text-xs text-gray-500">{new Date(organization.activatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              
              {organization.lastActiveAt && (
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-4"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Most Recent Activity</p>
                    <p className="text-xs text-gray-500">{new Date(organization.lastActiveAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin Tools Action Buttons */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle className="text-charcoal flex items-center">
              <Settings className="h-5 w-5 mr-2 text-spiritual-blue" />
              Admin Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline"
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                data-testid="button-suspend-church"
              >
                <Shield className="h-4 w-4 mr-2" />
                {organization.status === 'SUSPENDED' ? 'Reactivate Church' : 'Suspend Church'}
              </Button>
              
              <Button 
                variant="outline"
                className="w-full justify-start"
                data-testid="button-reset-password"
              >
                <KeyRound className="h-4 w-4 mr-2" />
                Reset Admin Password
              </Button>
              
              <Button 
                variant="outline"
                className="w-full justify-start"
                data-testid="button-export-report"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report (CSV)
              </Button>
              
              <Button 
                variant="outline"
                className="w-full justify-start"
                data-testid="button-email-admin"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Church Admin
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Admin Notes */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle className="text-charcoal flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-spiritual-blue" />
                Admin Notes
              </div>
              {!isEditingNotes && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setIsEditingNotes(true)}
                  data-testid="button-edit-notes"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              {isEditingNotes && (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => {
                      setIsEditingNotes(false);
                      setAdminNotes(organization?.adminNotes || "");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleSaveNotes}
                    disabled={updateNotesMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {updateNotesMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditingNotes ? (
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes about this organization..."
                className="min-h-[120px] resize-none"
                data-testid="textarea-admin-notes"
              />
            ) : (
              <div className="min-h-[120px] p-3 bg-gray-50 rounded-md">
                {adminNotes || organization?.adminNotes ? (
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {adminNotes || organization?.adminNotes}
                  </p>
                ) : (
                  <p className="text-gray-500 italic">No notes added yet. Click Edit to add notes.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Members Table */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle className="text-charcoal flex items-center">
              <Users className="h-5 w-5 mr-2 text-spiritual-blue" />
              Members Management
            </CardTitle>
            <CardDescription>
              Manage organization members and their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MembersTable organizationId={orgId} organizationName={organization.name} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}