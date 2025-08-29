import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// Dialog imports removed - using custom modal components
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
import { useBetaApplicationNotifications } from '@/hooks/useBetaApplicationNotifications';

interface Application {
  id: string;
  pastorName: string;
  pastorEmail: string;
  pastorPhone: string;
  churchName: string;
  churchWebsite: string | null;
  churchAddress: string;
  churchSize: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  answers: Record<string, string>;
  attachments: Record<string, string>;
  reviewedById: string | null;
  reviewedAt: Date | null;
  decisionNotes: string | null;
  organizationId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function AdminApplications() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Beta application notifications
  const { markApplicationsAsRead } = useBetaApplicationNotifications();

  // Mark applications as read when this page loads
  React.useEffect(() => {
    markApplicationsAsRead();
  }, [markApplicationsAsRead]);

  // Fetch pending applications
  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ['/api/applications?status=PENDING'],
    enabled: !!user && user.role === 'SUPER_ADMIN',
  });

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
              applications?.map((app) => (
                <Card key={app.id} className="bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-4">
                          <h3 className="text-xl font-semibold text-charcoal">{app.churchName}</h3>
                          <Badge className="bg-orange-100 text-orange-800">
                            <Clock className="h-3 w-3 mr-1" />
                            {app.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            <span className="text-sm">Pastor: {app.pastorName}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            <span className="text-sm">{app.pastorEmail}</span>
                          </div>
                          {app.churchWebsite && (
                            <div className="flex items-center text-gray-600">
                              <Globe className="h-4 w-4 mr-2" />
                              <span className="text-sm">{app.churchWebsite}</span>
                            </div>
                          )}
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="text-sm">Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">Church Size: {app.churchSize}</p>
                        <p className="text-sm text-gray-600 mb-4">{app.churchAddress}</p>
                      </div>

                      <div className="flex space-x-3 ml-6">
                        <Button
                          onClick={() => setLocation(`/admin/applications/${app.id}`)}
                          className="bg-spiritual-blue hover:bg-spiritual-blue/90 text-white"
                          data-testid={`button-review-${app.id}`}
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Review Application
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

      </div>
    </MainLayout>
  );
}