import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useSupabaseAuth';
import { apiRequest } from '@/lib/queryClient';
import { 
  Clock, 
  CheckCircle, 
  XCircle,
  Calendar,
  Globe,
  Mail,
  ArrowLeft
} from 'lucide-react';
import { useLocation } from 'wouter';
import { MainLayout } from '@/components/navigation/main-layout';

interface Organization {
  id: string;
  name: string;
  subdomain?: string;
  contactEmail?: string;
  website?: string;
  address?: string;
  description?: string;
  status: string;
  createdAt: string;
  deniedReason?: string;
}

export default function AdminApplications() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDenyModalOpen, setIsDenyModalOpen] = useState(false);
  const [denyReason, setDenyReason] = useState('');

  // Fetch pending applications
  const { data: applications, isLoading } = useQuery<Organization[]>({
    queryKey: ['/api/admin/orgs?status=pending'],
    enabled: !!user && user.role === 'SUPER_ADMIN',
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (orgId: string) => {
      return apiRequest(`/api/admin/orgs/${orgId}/approve`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orgs'] });
      toast({
        title: "Application Approved",
        description: "The church application has been approved successfully.",
      });
      setIsApproveModalOpen(false);
      setSelectedOrg(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve application. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Deny mutation
  const denyMutation = useMutation({
    mutationFn: async ({ orgId, reason }: { orgId: string; reason: string }) => {
      return apiRequest(`/api/admin/orgs/${orgId}/deny`, {
        method: 'POST',
        data: { reason },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orgs'] });
      toast({
        title: "Application Denied",
        description: "The church application has been denied.",
      });
      setIsDenyModalOpen(false);
      setSelectedOrg(null);
      setDenyReason('');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to deny application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (org: Organization) => {
    setSelectedOrg(org);
    setIsApproveModalOpen(true);
  };

  const handleDeny = (org: Organization) => {
    setSelectedOrg(org);
    setIsDenyModalOpen(true);
  };

  const confirmApprove = () => {
    if (selectedOrg) {
      approveMutation.mutate(selectedOrg.id);
    }
  };

  const confirmDeny = () => {
    if (selectedOrg) {
      denyMutation.mutate({ orgId: selectedOrg.id, reason: denyReason });
    }
  };

  if (user?.role !== 'SUPER_ADMIN') {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-charcoal mb-2">Access Denied</h2>
            <p className="text-gray-600">Super Admin access required</p>
            <Button onClick={() => setLocation('/')} className="mt-4">Return Home</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-spiritual-blue/5 to-warm-gold/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setLocation('/')}
                className="flex items-center"
                data-testid="button-back-home"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-charcoal">Beta Applications</h1>
                <p className="text-gray-600 mt-1">Review and manage church applications</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
              {applications?.length || 0} Pending
            </Badge>
          </div>

          {/* Applications List */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="grid gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : applications?.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-charcoal mb-2">No Pending Applications</h3>
                  <p className="text-gray-600">All applications have been reviewed. Great work!</p>
                </CardContent>
              </Card>
            ) : (
              applications?.map((org) => (
                <Card key={org.id} className="bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-4">
                          <h3 className="text-xl font-semibold text-charcoal">{org.name}</h3>
                          <Badge className="bg-orange-100 text-orange-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {org.contactEmail && (
                            <div className="flex items-center text-gray-600">
                              <Mail className="h-4 w-4 mr-2" />
                              <span className="text-sm">{org.contactEmail}</span>
                            </div>
                          )}
                          {org.website && (
                            <div className="flex items-center text-gray-600">
                              <Globe className="h-4 w-4 mr-2" />
                              <span className="text-sm">{org.website}</span>
                            </div>
                          )}
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="text-sm">Applied {new Date(org.createdAt).toLocaleDateString()}</span>
                          </div>
                          {org.subdomain && (
                            <div className="flex items-center text-gray-600">
                              <Globe className="h-4 w-4 mr-2" />
                              <span className="text-sm">{org.subdomain}.kingdomops.org</span>
                            </div>
                          )}
                        </div>

                        {org.description && (
                          <p className="text-gray-700 mb-4">{org.description}</p>
                        )}

                        {org.address && (
                          <p className="text-sm text-gray-600 mb-4">{org.address}</p>
                        )}
                      </div>

                      <div className="flex space-x-3 ml-6">
                        <Button
                          onClick={() => handleApprove(org)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          data-testid={`button-approve-${org.id}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDeny(org)}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          data-testid={`button-deny-${org.id}`}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Deny
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Approve Confirmation Modal */}
        <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Application</DialogTitle>
              <DialogDescription>
                Are you sure you want to approve "{selectedOrg?.name}"? This will activate their church account and grant access to all platform features.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApproveModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={confirmApprove}
                disabled={approveMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {approveMutation.isPending ? 'Approving...' : 'Approve'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Deny Confirmation Modal */}
        <Dialog open={isDenyModalOpen} onOpenChange={setIsDenyModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deny Application</DialogTitle>
              <DialogDescription>
                Please provide a reason for denying "{selectedOrg?.name}". This will be recorded for future reference.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Enter reason for denial..."
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDenyModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={confirmDeny}
                disabled={denyMutation.isPending || !denyReason.trim()}
                variant="destructive"
              >
                {denyMutation.isPending ? 'Denying...' : 'Deny Application'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}