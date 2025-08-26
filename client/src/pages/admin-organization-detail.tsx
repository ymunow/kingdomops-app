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
  Edit3
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
  status: 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'PENDING' | 'APPROVED' | 'DENIED';
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
  settings: any;
  // Stats
  totalUsers: number;
  totalAssessments: number;
  activeUsers: number;
  completionRate: number;
  // Application notes
  adminNotes?: string;
}

interface OrganizationStats {
  usersByRole: Record<string, number>;
  assessmentsByMonth: Array<{ month: string; count: number }>;
  topGifts: Array<{ gift: string; count: number }>;
  recentActivity: Array<{ type: string; description: string; timestamp: string }>;
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
      apiRequest(`/api/admin/orgs/${orgId}/approve`, { method: 'POST' }),
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
      apiRequest(`/api/admin/orgs/${orgId}/reject`, { 
        method: 'POST', 
        body: { reason }
      }),
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
      apiRequest(`/api/admin/orgs/${orgId}/notes`, { 
        method: 'POST', 
        body: { adminNotes: notes }
      }),
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

            {/* Members Section */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardHeader>
                <CardTitle className="text-charcoal flex items-center justify-between">
                  <span className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Members & Users
                  </span>
                  <Button variant="outline" size="sm" disabled>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardTitle>
                <CardDescription>View and manage all members of {organization.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <MembersTable organizationId={orgId} organizationName={organization.name} />
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Admin Notes Section */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardHeader>
                <CardTitle className="text-charcoal flex items-center justify-between">
                  <span className="flex items-center">
                    <Edit3 className="h-5 w-5 mr-2" />
                    Admin Notes
                  </span>
                  {!isEditingNotes ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsEditingNotes(true)}
                      data-testid="button-edit-notes"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setIsEditingNotes(false);
                          setAdminNotes(organization?.adminNotes || "");
                        }}
                        disabled={updateNotesMutation.isPending}
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