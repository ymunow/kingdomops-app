import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useOrganization } from "@/hooks/use-organization";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Crown, CheckCircle, Users, Code, Settings, BarChart3, Copy, UserPlus, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RegistrationData {
  churchName: string;
  inviteCode: string;
  contactEmail: string;
}

export default function ChurchAdminWelcome() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { organization } = useOrganization();
  const { toast } = useToast();
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);

  // Load registration data from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem('church_registration_success');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setRegistrationData(data);
        // Clear it after loading
        sessionStorage.removeItem('church_registration_success');
      } catch (error) {
        console.error("Failed to parse registration data:", error);
      }
    }
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const copyInviteCode = () => {
    if (registrationData?.inviteCode) {
      navigator.clipboard.writeText(registrationData.inviteCode);
      toast({
        title: "Invite code copied!",
        description: "Share this code with your congregation members.",
      });
    }
  };

  const goToAdminDashboard = () => {
    setLocation("/admin-dashboard");
  };

  const goToAddMinistryOpportunities = () => {
    setLocation("/admin");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-700">Loading your admin portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const churchName = organization?.name || registrationData?.churchName || "Your Church";
  const inviteCode = organization?.inviteCode || registrationData?.inviteCode;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-spiritual-blue rounded-full mb-4">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Your Admin Portal!
            </h1>
            <p className="text-lg text-gray-600">
              {churchName} is now set up for spiritual gifts assessments
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message */}
        <Card className="mb-8 border-green-200 bg-green-50/80 backdrop-blur-sm shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-green-900">Setup Complete!</h2>
                <p className="text-green-700">
                  {churchName} has been successfully registered and you're now logged in as the church administrator.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm shadow-lg border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-spiritual-blue" />
              Next Steps to Get Started
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Step 1: Invite Code */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-spiritual-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Share Your Church Invite Code</h3>
                <p className="text-gray-600 mb-4">
                  Give this unique code to your congregation members so they can join your church and take assessments.
                </p>
                {inviteCode && (
                  <div className="bg-gray-50 border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Code className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Church Invite Code:</span>
                      </div>
                      <div className="text-2xl font-mono font-bold text-spiritual-blue mt-1">
                        {inviteCode}
                      </div>
                    </div>
                    <Button variant="outline" onClick={copyInviteCode} data-testid="button-copy-invite-code">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Step 2: Admin Dashboard */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-spiritual-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Monitor Your Congregation</h3>
                <p className="text-gray-600 mb-4">
                  Track assessment participation, view results, and monitor engagement through your admin dashboard.
                </p>
                <Button onClick={goToAdminDashboard} className="bg-spiritual-blue text-white hover:bg-purple-800" data-testid="button-go-to-dashboard">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Step 3: Ministry Opportunities */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-spiritual-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Create Ministry Opportunities</h3>
                <p className="text-gray-600 mb-4">
                  Set up volunteer positions and ministry roles to match people with their spiritual gifts.
                </p>
                <Button variant="outline" onClick={goToAddMinistryOpportunities} className="border-spiritual-blue text-spiritual-blue hover:bg-spiritual-blue hover:text-white" data-testid="button-add-ministry-opportunities">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Ministry Opportunities
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Features Overview */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-spiritual-blue" />
              Your Admin Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Congregation Management</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• View all member assessment results</li>
                  <li>• Track participation rates</li>
                  <li>• Export data and reports</li>
                  <li>• Manage member accounts</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Ministry Matching</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Create volunteer opportunities</li>
                  <li>• Match members to ministry roles</li>
                  <li>• Track ministry placements</li>
                  <li>• Send invitations to serve</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Church Info */}
        {organization && (
          <div className="mt-8 text-center">
            <Badge variant="outline" className="text-sm">
              Logged in as Administrator for {organization.name}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}