import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useSupabaseAuth';
import { 
  ArrowLeft,
  Calendar,
  Globe,
  Mail,
  MapPin,
  Users,
  ExternalLink,
  Settings,
  Eye
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
  approvedAt?: string;
  deniedAt?: string;
  deniedReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface ChurchDetailProps {
  params: { id: string };
}

export default function AdminChurchDetail({ params }: ChurchDetailProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const churchId = params.id;

  // Fetch church details
  const { data: church, isLoading } = useQuery<Organization>({
    queryKey: [`/api/admin/orgs/${churchId}`],
    enabled: !!user && user.role === 'SUPER_ADMIN' && !!churchId,
  });

  const handleViewAsOrg = () => {
    // TODO: Implement view-as functionality if not already available
    console.log('View as organization:', churchId);
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

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-spiritual-blue/5 to-warm-gold/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!church) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-charcoal mb-2">Church Not Found</h2>
            <p className="text-gray-600">The requested church could not be found.</p>
            <Button onClick={() => setLocation('/admin/churches')} className="mt-4">
              Back to Churches
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'PENDING':
        return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>;
      case 'DENIED':
        return <Badge className="bg-red-100 text-red-800">Denied</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-spiritual-blue/5 to-warm-gold/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setLocation('/admin/churches')}
                className="flex items-center"
                data-testid="button-back-churches"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Churches
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-charcoal">{church.name}</h1>
                <p className="text-gray-600 mt-1">Church Details & Management</p>
              </div>
            </div>
            {getStatusBadge(church.status)}
          </div>

          <div className="space-y-6">
            {/* Main Information Card */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Church Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-charcoal mb-3">Basic Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700">
                        <Users className="h-4 w-4 mr-3 text-gray-400" />
                        <div>
                          <span className="font-medium">Name:</span>
                          <span className="ml-2">{church.name}</span>
                        </div>
                      </div>
                      
                      {church.contactEmail && (
                        <div className="flex items-center text-gray-700">
                          <Mail className="h-4 w-4 mr-3 text-gray-400" />
                          <div>
                            <span className="font-medium">Contact:</span>
                            <span className="ml-2">{church.contactEmail}</span>
                          </div>
                        </div>
                      )}
                      
                      {church.website && (
                        <div className="flex items-center text-gray-700">
                          <Globe className="h-4 w-4 mr-3 text-gray-400" />
                          <div>
                            <span className="font-medium">Website:</span>
                            <a 
                              href={church.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="ml-2 text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              {church.website} <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        </div>
                      )}
                      
                      {church.subdomain && (
                        <div className="flex items-center text-gray-700">
                          <Globe className="h-4 w-4 mr-3 text-gray-400" />
                          <div>
                            <span className="font-medium">KingdomOps URL:</span>
                            <a 
                              href={`https://${church.subdomain}.kingdomops.org`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="ml-2 text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              {church.subdomain}.kingdomops.org <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        </div>
                      )}
                      
                      {church.address && (
                        <div className="flex items-start text-gray-700">
                          <MapPin className="h-4 w-4 mr-3 text-gray-400 mt-0.5" />
                          <div>
                            <span className="font-medium">Address:</span>
                            <span className="ml-2">{church.address}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-charcoal mb-3">Timeline</h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700">
                        <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                        <div>
                          <span className="font-medium">Applied:</span>
                          <span className="ml-2">{new Date(church.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {church.approvedAt && (
                        <div className="flex items-center text-gray-700">
                          <Calendar className="h-4 w-4 mr-3 text-green-400" />
                          <div>
                            <span className="font-medium">Approved:</span>
                            <span className="ml-2">{new Date(church.approvedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}
                      
                      {church.deniedAt && (
                        <div className="flex items-center text-gray-700">
                          <Calendar className="h-4 w-4 mr-3 text-red-400" />
                          <div>
                            <span className="font-medium">Denied:</span>
                            <span className="ml-2">{new Date(church.deniedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center text-gray-700">
                        <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                        <div>
                          <span className="font-medium">Last Updated:</span>
                          <span className="ml-2">{new Date(church.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {church.description && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-charcoal mb-2">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{church.description}</p>
                  </div>
                )}

                {church.deniedReason && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-2">Denial Reason</h3>
                    <p className="text-red-700">{church.deniedReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions Card */}
            {church.status === 'APPROVED' && (
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Management Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <Button 
                      onClick={handleViewAsOrg}
                      className="flex items-center"
                      data-testid="button-view-as-org"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View as Church Admin
                    </Button>
                    
                    {church.subdomain && (
                      <Button 
                        variant="outline"
                        onClick={() => window.open(`https://${church.subdomain}.kingdomops.org`, '_blank')}
                        className="flex items-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Church Portal
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-3">
                    Use these tools to manage and access the church's platform features.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}