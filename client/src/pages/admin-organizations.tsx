import { useState } from "react";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { 
  Church, 
  Users, 
  ArrowLeft,
  Shield,
  Plus,
  Edit,
  MoreHorizontal,
  Trash2,
  Settings,
  Eye
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AdminNavigationBar } from "@/components/admin/admin-navigation-bar";
import { apiRequest } from "@/lib/queryClient";

interface Organization {
  id: string;
  name: string;
  contactEmail: string;
  phone?: string;
  address?: string;
  memberCount: number;
  completedAssessments: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export default function AdminOrganizations() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: organizations, isLoading: orgsLoading } = useQuery<Organization[]>({
    queryKey: ['/api/super-admin/organizations'],
    enabled: user?.role === 'SUPER_ADMIN',
  });

  const createOrgMutation = useMutation({
    mutationFn: async (data: { name: string; contactEmail: string; phone?: string; address?: string }) => {
      return apiRequest('POST', '/api/super-admin/organizations', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/organizations'] });
      toast({ title: "Success", description: "Organization created successfully" });
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const updateOrgMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; contactEmail: string; phone?: string; address?: string; status?: string }) => {
      return apiRequest('PATCH', `/api/super-admin/organizations/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/organizations'] });
      toast({ title: "Success", description: "Organization updated successfully" });
      setEditingOrg(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  if (isLoading || orgsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spiritual-blue mb-4 mx-auto"></div>
          <p className="text-charcoal">Loading organizations...</p>
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

  const filteredOrganizations = organizations?.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-300';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'SUSPENDED': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Admin Navigation Bar */}
      <AdminNavigationBar className="mx-4 mt-4" />
      
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
                <Church className="text-spiritual-blue h-8 w-8 mr-3" />
                <div>
                  <h1 className="font-display font-bold text-xl text-charcoal">
                    Manage Churches
                  </h1>
                  <p className="text-sm text-gray-600">Organization & Congregation Management</p>
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
                Church Organizations
              </h1>
              <p className="text-gray-600 mt-2">
                Manage all registered churches and their configurations
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Church
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Organization</DialogTitle>
                  <DialogDescription>Add a new church organization to the platform</DialogDescription>
                </DialogHeader>
                <CreateOrgForm onSubmit={(data) => createOrgMutation.mutate(data)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Recent Beta Applications Alert */}
          {(() => {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const recentBetaApps = organizations?.filter(org => 
              new Date(org.createdAt) > sevenDaysAgo
            ) || [];
            
            if (recentBetaApps.length === 0) return null;
            
            return (
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-green-600 rounded-full p-2">
                      <Church className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">
                        🚀 New Beta Applications ({recentBetaApps.length})
                      </h3>
                      <p className="text-green-700">Churches that have applied in the last 7 days</p>
                    </div>
                  </div>
                  <div className="grid gap-3">
                    {recentBetaApps.map((org) => (
                      <div key={org.id} className="bg-white rounded-lg border border-green-200 p-4 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{org.name}</h4>
                              <Badge className="bg-green-100 text-green-800 border-green-300">
                                NEW
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                              <div>📧 {org.contactEmail}</div>
                              <div>👥 {org.memberCount} members</div>
                              <div>📅 {new Date(org.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              onClick={() => setLocation(`/admin/organizations/${org.id}`)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Review
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingOrg(org)}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Search and Filters */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Organizations</Label>
                  <Input
                    id="search"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    data-testid="input-search-organizations"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organizations Table */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle className="text-charcoal">Organizations ({filteredOrganizations.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-700">Church Name</th>
                      <th className="text-left p-4 font-medium text-gray-700">Contact</th>
                      <th className="text-left p-4 font-medium text-gray-700">Members</th>
                      <th className="text-left p-4 font-medium text-gray-700">Assessments</th>
                      <th className="text-left p-4 font-medium text-gray-700">Status</th>
                      <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrganizations.map((org) => (
                      <tr key={org.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-charcoal">{org.name}</p>
                            <p className="text-sm text-gray-500">ID: {org.id}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-charcoal">{org.contactEmail}</p>
                            {org.phone && <p className="text-sm text-gray-500">{org.phone}</p>}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-charcoal">{org.memberCount}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-charcoal">{org.completedAssessments}</span>
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(org.status)}>
                            {org.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingOrg(org)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setLocation(`/admin/organizations/${org.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setLocation(`/admin/organizations/${org.id}/settings`)}>
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Edit Organization Dialog */}
      {editingOrg && (
        <Dialog open={!!editingOrg} onOpenChange={() => setEditingOrg(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Organization</DialogTitle>
              <DialogDescription>Update organization details</DialogDescription>
            </DialogHeader>
            <EditOrgForm 
              organization={editingOrg} 
              onSubmit={(data) => updateOrgMutation.mutate({ ...data, id: editingOrg.id })} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function CreateOrgForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    phone: '',
    address: ''
  });

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Church Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter church name"
          data-testid="input-church-name"
        />
      </div>
      <div>
        <Label htmlFor="email">Contact Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.contactEmail}
          onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
          placeholder="Enter contact email"
          data-testid="input-contact-email"
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone (Optional)</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          placeholder="Enter phone number"
          data-testid="input-phone"
        />
      </div>
      <div>
        <Label htmlFor="address">Address (Optional)</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          placeholder="Enter address"
          data-testid="input-address"
        />
      </div>
      <DialogFooter>
        <Button
          onClick={() => onSubmit(formData)}
          disabled={!formData.name || !formData.contactEmail}
          data-testid="button-create-organization"
        >
          Create Organization
        </Button>
      </DialogFooter>
    </div>
  );
}

function EditOrgForm({ organization, onSubmit }: { organization: Organization; onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: organization.name,
    contactEmail: organization.contactEmail,
    phone: organization.phone || '',
    address: organization.address || '',
    status: organization.status
  });

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="edit-name">Church Name</Label>
        <Input
          id="edit-name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          data-testid="input-edit-church-name"
        />
      </div>
      <div>
        <Label htmlFor="edit-email">Contact Email</Label>
        <Input
          id="edit-email"
          type="email"
          value={formData.contactEmail}
          onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
          data-testid="input-edit-contact-email"
        />
      </div>
      <div>
        <Label htmlFor="edit-phone">Phone</Label>
        <Input
          id="edit-phone"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          data-testid="input-edit-phone"
        />
      </div>
      <div>
        <Label htmlFor="edit-address">Address</Label>
        <Input
          id="edit-address"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          data-testid="input-edit-address"
        />
      </div>
      <div>
        <Label htmlFor="edit-status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' }))}>
          <SelectTrigger data-testid="select-edit-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button onClick={() => onSubmit(formData)} data-testid="button-update-organization">
          Update Organization
        </Button>
      </DialogFooter>
    </div>
  );
}