import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useSupabaseAuth';
import { 
  Clock, 
  Calendar,
  Globe,
  Mail,
  ArrowLeft,
  ExternalLink,
  Users,
  ChevronRight,
  CheckCircle2
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
  createdAt: string;
}

export default function AdminApprovedChurches() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Fetch approved churches (ready to activate)
  const { data: churches, isLoading } = useQuery<Organization[]>({
    queryKey: ['/api/admin/orgs?status=approved'],
    enabled: !!user && user.role === 'SUPER_ADMIN',
  });

  const handleChurchClick = (churchId: string) => {
    setLocation(`/admin/churches/${churchId}`);
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
                <h1 className="text-3xl font-bold text-charcoal">Approved Churches</h1>
                <p className="text-gray-600 mt-1">Churches approved but waiting to activate</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
              {churches?.length || 0} Ready to Activate
            </Badge>
          </div>

          {/* Churches List */}
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
            ) : churches?.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-charcoal mb-2">No Churches Waiting</h3>
                  <p className="text-gray-600">All approved churches have already been activated.</p>
                </CardContent>
              </Card>
            ) : (
              churches?.map((church) => (
                <Card 
                  key={church.id} 
                  className="bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all cursor-pointer hover:scale-[1.01]"
                  onClick={() => handleChurchClick(church.id)}
                  data-testid={`church-card-${church.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-4">
                          <h3 className="text-xl font-semibold text-charcoal">{church.name}</h3>
                          <Badge className="bg-blue-100 text-blue-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Ready to Activate
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {church.contactEmail && (
                            <div className="flex items-center text-gray-600">
                              <Mail className="h-4 w-4 mr-2" />
                              <span className="text-sm">{church.contactEmail}</span>
                            </div>
                          )}
                          {church.website && (
                            <div className="flex items-center text-gray-600">
                              <Globe className="h-4 w-4 mr-2" />
                              <span className="text-sm">{church.website}</span>
                            </div>
                          )}
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="text-sm">
                              Approved {church.approvedAt ? new Date(church.approvedAt).toLocaleDateString() : 'Recently'}
                            </span>
                          </div>
                          {church.subdomain && (
                            <div className="flex items-center text-gray-600">
                              <Globe className="h-4 w-4 mr-2" />
                              <span className="text-sm">{church.subdomain}.kingdomops.org</span>
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </div>
                          )}
                        </div>

                        {church.description && (
                          <p className="text-gray-700 mb-4">{church.description}</p>
                        )}

                        {church.address && (
                          <p className="text-sm text-gray-600 mb-4">{church.address}</p>
                        )}

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Applied: {new Date(church.createdAt).toLocaleDateString()}</span>
                          {church.subdomain && (
                            <a 
                              href={`https://${church.subdomain}.kingdomops.org`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-blue-600 hover:text-blue-800"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Visit Portal <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          )}
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Next Steps:</strong> This church is approved and ready for onboarding. 
                            They will move to "Active" status once they complete setup or have their first login.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center ml-6">
                        <ChevronRight className="h-5 w-5 text-gray-400" />
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