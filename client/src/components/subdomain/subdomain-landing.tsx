import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Church, 
  Users, 
  Heart, 
  Award, 
  ArrowRight, 
  CheckCircle,
  MapPin,
  Mail,
  Globe,
  AlertTriangle
} from "lucide-react";
import { useLocation } from "wouter";

interface OrganizationInfo {
  id: string;
  name: string;
  subdomain: string;
  description?: string;
  website?: string;
  contactEmail?: string;
}

interface SubdomainLandingProps {
  subdomain: string;
}

export function SubdomainLanding({ subdomain }: SubdomainLandingProps) {
  const [, setLocation] = useLocation();

  const { data: orgInfo, isLoading, error } = useQuery<OrganizationInfo>({
    queryKey: [`/api/subdomain/${subdomain}/info`],
    enabled: !!subdomain,
    retry: false
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spiritual-blue/10 to-warm-gold/10 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spiritual-blue mx-auto mb-4"></div>
              <p className="text-gray-600">Loading church information...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !orgInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spiritual-blue/10 to-warm-gold/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Church Not Found
                </h2>
                <p className="text-gray-600 mb-4">
                  The subdomain "{subdomain}" doesn't match any registered church.
                </p>
                <Button 
                  onClick={() => setLocation('/register')}
                  className="w-full"
                >
                  Register Your Church
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spiritual-blue/10 to-warm-gold/10">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-spiritual-blue/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-spiritual-blue to-warm-gold text-white p-2 rounded-lg shadow-md">
                <Church className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-charcoal">{orgInfo.name}</h1>
                <p className="text-sm text-warm-gold font-medium">{subdomain}.kingdomops.app</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setLocation('/auth')}
                data-testid="button-login"
              >
                Login
              </Button>
              <Button 
                onClick={() => setLocation('/auth')}
                className="bg-gradient-to-r from-spiritual-blue to-warm-gold hover:from-spiritual-blue/90 hover:to-warm-gold/90 text-white shadow-lg"
                data-testid="button-join"
              >
                Join Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-warm-gold/20 text-warm-gold border-warm-gold/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active Church
          </Badge>
          <h1 className="text-4xl font-bold text-charcoal mb-4">
            Welcome to {orgInfo.name}
          </h1>
          <p className="text-xl text-charcoal/70 max-w-2xl mx-auto">
            Discover your unique spiritual gifts and find your perfect place to serve in ministry
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-spiritual-blue/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Award className="h-8 w-8 text-spiritual-blue mx-auto mb-2" />
              <CardTitle className="text-lg text-charcoal">Discover Your Gifts</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-charcoal/70">
                Take our comprehensive spiritual gifts assessment to uncover your God-given talents and calling
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-warm-gold/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-8 w-8 text-warm-gold mx-auto mb-2" />
              <CardTitle className="text-lg text-charcoal">Find Your Team</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-charcoal/70">
                Connect with ministry opportunities that match your gifts and passion for serving
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-warm-gold/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Heart className="h-8 w-8 text-warm-gold mx-auto mb-2" />
              <CardTitle className="text-lg text-charcoal">Make an Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-charcoal/70">
                Use your gifts to build God's kingdom and make a lasting difference in your community
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Church Information */}
        {(orgInfo.description || orgInfo.website || orgInfo.contactEmail) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Church className="h-5 w-5 mr-2" />
                About {orgInfo.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orgInfo.description && (
                <p className="text-gray-600">{orgInfo.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm">
                {orgInfo.website && (
                  <a 
                    href={orgInfo.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-spiritual-blue hover:underline"
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    Visit Website
                  </a>
                )}
                {orgInfo.contactEmail && (
                  <a 
                    href={`mailto:${orgInfo.contactEmail}`}
                    className="flex items-center text-spiritual-blue hover:underline"
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Contact Us
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-spiritual-blue to-warm-gold text-white">
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Discover Your Calling?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join hundreds of church members who have already discovered their spiritual gifts and found their perfect ministry fit.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => setLocation('/auth')}
              className="bg-white text-spiritual-blue hover:bg-gray-50"
              data-testid="button-start-assessment"
            >
              Start Your Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>Powered by Kingdom Impact Training • Spiritual Gifts Assessment Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}