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
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Save,
  Settings,
  AlertTriangle,
  Globe,
  Mail,
  MapPin,
  FileText,
  Shield,
  Users
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { SubdomainManagement } from "@/components/admin/subdomain-management";

interface OrganizationSettings {
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
}

export default function AdminOrganizationSettings() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Extract organization ID from URL
  const [orgId, setOrgId] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    contactEmail: "",
    website: "",
    address: "",
    description: "",
    status: "ACTIVE" as 'ACTIVE' | 'INACTIVE' | 'TRIAL',
    inviteCode: ""
  });
  
  useEffect(() => {
    const path = window.location.pathname;
    const id = path.split('/admin/organizations/')[1]?.split('/')[0];
    if (id) setOrgId(id);
  }, []);

  const { data: organization, isLoading: orgLoading, error } = useQuery<OrganizationSettings>({
    queryKey: ['/api/super-admin/organizations', orgId],
    enabled: user?.role === 'SUPER_ADMIN' && !!orgId,
  });

  // Update form data when organization loads
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || "",
        subdomain: organization.subdomain || "",
        contactEmail: organization.contactEmail || "",
        website: organization.website || "",
        address: organization.address || "",
        description: organization.description || "",
        status: organization.status,
        inviteCode: organization.inviteCode || ""
      });
    }
  }, [organization]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('PATCH', `/api/super-admin/organizations/${orgId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/organizations', orgId] });
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/organizations'] });
      toast({ title: "Success", description: "Organization settings updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  // Handle loading states
  if (isLoading || orgLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spiritual-blue/5 to-warm-gold/5">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spiritual-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading organization settings...</p>
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
                onClick={() => setLocation(`/admin/organizations/${orgId}`)}
                data-testid="button-back-to-organization"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to {organization.name}
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-charcoal flex items-center">
                  <Settings className="h-6 w-6 mr-3" />
                  Organization Settings
                  <Badge className={`ml-3 ${getStatusColor(organization.status)}`}>
                    {organization.status}
                  </Badge>
                </h1>
                <p className="text-gray-600">Configure settings for {organization.name}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle className="text-charcoal flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
              <CardDescription>Update basic organization details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Organization Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter organization name"
                    required
                    data-testid="input-org-name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="subdomain">Subdomain</Label>
                  <Input
                    id="subdomain"
                    value={formData.subdomain}
                    onChange={(e) => setFormData(prev => ({ ...prev, subdomain: e.target.value }))}
                    placeholder="e.g., fwc"
                    data-testid="input-subdomain"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used for custom URLs and branding</p>
                </div>

                <div>
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="contact@church.org"
                    required
                    data-testid="input-contact-email"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://church.org"
                    data-testid="input-website"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Street address, city, state, zip"
                  rows={3}
                  data-testid="textarea-address"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of your organization"
                  rows={4}
                  data-testid="textarea-description"
                />
              </div>
            </CardContent>
          </Card>

          {/* Status and Access Control */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle className="text-charcoal flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Status & Access
              </CardTitle>
              <CardDescription>Control organization status and member access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="status">Organization Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'ACTIVE' | 'INACTIVE' | 'TRIAL' }))}
                  >
                    <SelectTrigger data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="TRIAL">Trial</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Active organizations can take assessments and access all features
                  </p>
                </div>

                <div>
                  <Label htmlFor="inviteCode">Invite Code</Label>
                  <Input
                    id="inviteCode"
                    value={formData.inviteCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, inviteCode: e.target.value.toUpperCase() }))}
                    placeholder="CHURCH2024"
                    className="font-mono"
                    data-testid="input-invite-code"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Members use this code to join your organization during signup
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subdomain Management */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle className="text-charcoal flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Web Address Management
              </CardTitle>
              <CardDescription>
                Manage your church's professional web address and sharing links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubdomainManagement organization={organization} />
            </CardContent>
          </Card>

          {/* Save Actions */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-charcoal">Save Changes</h3>
                  <p className="text-gray-600">Review your changes and update the organization settings</p>
                </div>
                <div className="flex space-x-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setLocation(`/admin/organizations/${orgId}`)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateMutation.isPending}
                    data-testid="button-save-settings"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  );
}