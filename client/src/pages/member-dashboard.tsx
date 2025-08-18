import { useAuth } from "@/hooks/useSupabaseAuth";
import { useOrganization } from "@/hooks/use-organization";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  BarChart3, 
  User, 
  Award, 
  Clock, 
  Crown,
  ChevronRight,
  Calendar,
  Target,
  Users,
  Church
} from "lucide-react";

interface UserResult {
  id: string;
  responseId: string;
  createdAt: string;
  gifts: {
    top1: { name: string; key: string; score: number };
    top2: { name: string; key: string; score: number };
    top3: { name: string; key: string; score: number };
  };
}

export default function MemberDashboard() {
  const { user, signOutMutation } = useAuth();
  const { organization } = useOrganization();
  const [, setLocation] = useLocation();

  // Fetch user's results
  const { data: results = [], isLoading: resultsLoading } = useQuery<UserResult[]>({
    queryKey: ["/api/my-results"],
    enabled: !!user,
    retry: false,
  });

  const hasCompletedAssessment = results.length > 0;
  const latestResult = results[0]; // Most recent result

  const handleStartAssessment = () => {
    setLocation("/assessment");
  };

  const handleViewResults = () => {
    setLocation("/my-results");
  };

  const handleViewProfile = () => {
    setLocation("/profile");
  };

  const handleLogout = () => {
    signOutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Crown className="text-spiritual-blue h-8 w-8 mr-3" />
              <div>
                <h1 className="font-display font-bold text-xl text-charcoal">
                  {organization?.name || "Kingdom Impact Training"}
                </h1>
                <p className="text-sm text-gray-600">Member Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700" data-testid="text-username">
                Welcome, {user?.firstName || user?.email?.split('@')[0] || "Member"}
              </span>
              <Button variant="outline" onClick={handleViewProfile} data-testid="button-profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
              <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {hasCompletedAssessment ? "Welcome back!" : "Welcome to your spiritual journey!"}
          </h2>
          <p className="text-gray-600">
            {hasCompletedAssessment 
              ? "View your spiritual gifts and explore new opportunities to serve."
              : "Discover your unique spiritual gifts through our comprehensive assessment."
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Primary Action Card */}
          <div className="lg:col-span-2">
            <Card className="border-spiritual-blue border-2">
              <CardHeader className="text-center pb-4">
                <div className="inline-block p-3 bg-spiritual-blue/10 rounded-full mb-4">
                  {hasCompletedAssessment ? (
                    <Award className="h-8 w-8 text-spiritual-blue" />
                  ) : (
                    <Play className="h-8 w-8 text-spiritual-blue" />
                  )}
                </div>
                <CardTitle className="text-2xl text-spiritual-blue">
                  {hasCompletedAssessment ? "Your Spiritual Gifts" : "Take Assessment"}
                </CardTitle>
                <CardDescription className="text-base">
                  {hasCompletedAssessment 
                    ? "View your complete spiritual gifts profile and ministry recommendations"
                    : "Discover your top 3 spiritual gifts through our 60-question assessment"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {hasCompletedAssessment && latestResult ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">Your Top 3 Spiritual Gifts</p>
                      <div className="flex justify-center space-x-4">
                        <Badge variant="default" className="bg-warm-gold text-spiritual-blue px-4 py-2 text-sm font-semibold">
                          1. {latestResult.gifts.top1.name}
                        </Badge>
                        <Badge variant="outline" className="border-spiritual-blue text-spiritual-blue px-4 py-2 text-sm">
                          2. {latestResult.gifts.top2.name}
                        </Badge>
                        <Badge variant="outline" className="border-gray-300 text-gray-600 px-4 py-2 text-sm">
                          3. {latestResult.gifts.top3.name}
                        </Badge>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex space-x-4">
                      <Button 
                        onClick={handleViewResults} 
                        className="flex-1 bg-spiritual-blue text-white hover:bg-purple-800"
                        data-testid="button-view-results"
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        View Complete Results
                      </Button>
                      <Button 
                        onClick={handleStartAssessment} 
                        variant="outline"
                        className="flex-1 border-spiritual-blue text-spiritual-blue hover:bg-spiritual-blue hover:text-white"
                        data-testid="button-retake-assessment"
                      >
                        Retake Assessment
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-6">
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        <Clock className="inline h-4 w-4 mr-1" />
                        Takes about 15-20 minutes
                      </p>
                      <p className="text-gray-600">
                        <Target className="inline h-4 w-4 mr-1" />
                        60 questions covering 12 spiritual gifts
                      </p>
                    </div>
                    <Button 
                      onClick={handleStartAssessment} 
                      size="lg"
                      className="w-full bg-warm-gold text-spiritual-blue px-8 py-4 text-lg font-semibold hover:bg-yellow-400 transition-colors"
                      data-testid="button-start-assessment"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Start Your Assessment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organization Info */}
            {organization && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center">
                    <Church className="mr-2 h-5 w-5 text-spiritual-blue" />
                    Your Church
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-gray-900">{organization.name}</h3>
                  {organization.address && (
                    <p className="text-sm text-gray-600 mt-1">{organization.address}</p>
                  )}
                  {organization.website && (
                    <a 
                      href={organization.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-spiritual-blue hover:underline mt-2 inline-block"
                    >
                      Visit Website
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  onClick={handleViewProfile}
                  data-testid="button-edit-profile"
                >
                  <User className="mr-2 h-4 w-4" />
                  Edit Profile
                  <ChevronRight className="ml-auto h-4 w-4" />
                </Button>
                {hasCompletedAssessment && (
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={handleViewResults}
                    data-testid="button-view-all-results"
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View All Results
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Assessment Stats */}
            {hasCompletedAssessment && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Your Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Assessments Completed</span>
                    <Badge variant="secondary">{results.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Assessment</span>
                    <span className="text-sm text-gray-900">
                      {new Date(latestResult.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}