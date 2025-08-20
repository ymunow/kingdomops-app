import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ClockIcon, ShareIcon, CalendarIcon, Crown, AlertTriangle, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOrganization } from "@/hooks/use-organization";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "../lib/authUtils";

interface UserResultGift {
  key: string;
  name: string;
  shortName: string;
  definition: string;
  scriptureReference: string;
  description: string;
  examples: string[];
  score: number;
}

interface UserResult {
  id: string;
  responseId: string;
  createdAt: string;
  expiresAt: string;
  isExpired: boolean;
  daysUntilExpiration: number | null;
  isNearExpiration: boolean;
  isVeryNearExpiration: boolean;
  ageGroups: string[];
  ministryInterests: string[];
  gifts: {
    top1: UserResultGift;
    top2: UserResultGift;
    top3: UserResultGift;
  };
}

export default function MyResults() {
  const { isAuthenticated, isLoading } = useAuth();
  const { organization } = useOrganization();
  const { toast } = useToast();

  const { data: results = [], isLoading: resultsLoading, error } = useQuery<UserResult[]>({
    queryKey: ["/api/my-results"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/auth";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Handle unauthorized errors
  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/auth";
      }, 500);
      return;
    }
  }, [error, toast]);

  if (isLoading || resultsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-purple-700">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const copyShareLink = (responseId: string) => {
    const shareUrl = `${window.location.origin}/results/${responseId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: "Link Copied!",
        description: "Results link has been copied to your clipboard.",
      });
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-purple-900 flex items-center gap-2">
                <Crown className="h-8 w-8 text-warm-gold-500" />
                My Results
              </h1>
              <p className="text-purple-600 mt-1">
                {organization?.name ? `View and share your spiritual gifts assessment results from ${organization.name}` : "View and share your spiritual gifts assessment results"}
              </p>
              {organization?.name && (
                <p className="text-sm text-purple-500 mt-1 font-medium">{organization.name}</p>
              )}
            </div>
            <Link href="/">
              <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {(results as UserResult[]).length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <div className="text-6xl text-gray-300 mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-700">No Results Yet</h3>
              <p className="text-gray-500 mb-6">You haven't completed any assessments yet.</p>
              <Link href="/assessment">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Take Assessment
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(results as UserResult[]).map((result: UserResult) => (
              <Card key={result.id} className={`${result.isExpired ? 'opacity-60' : ''} hover:shadow-lg transition-shadow`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
                        <Crown className="h-5 w-5 text-warm-gold-500" />
                        Assessment Results
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-sm">
                          <CalendarIcon className="h-4 w-4" />
                          {formatDate(result.createdAt)}
                        </span>
                        {result.isExpired ? (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Expired
                          </Badge>
                        ) : result.isVeryNearExpiration ? (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            Expires in {result.daysUntilExpiration} days
                          </Badge>
                        ) : result.isNearExpiration ? (
                          <Badge variant="secondary" className="bg-warm-gold-100 text-warm-gold-800 flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            Expires in {result.daysUntilExpiration} days
                          </Badge>
                        ) : null}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-3">Your Top 3 Spiritual Gifts:</h4>
                    <div className="space-y-2">
                      {[result.gifts.top1, result.gifts.top2, result.gifts.top3].map((gift, index) => (
                        <div key={gift.key} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-purple-900">{gift.name}</div>
                              <div className="text-sm text-purple-600">Score: {gift.score}/25</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {(result.ageGroups.length > 0 || result.ministryInterests.length > 0) && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {result.ageGroups.length > 0 && (
                          <div>
                            <h5 className="font-medium text-purple-800 mb-2">Age Groups:</h5>
                            <div className="flex flex-wrap gap-1">
                              {result.ageGroups.map((group) => (
                                <Badge key={group} variant="outline" className="text-xs">
                                  {group}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {result.ministryInterests.length > 0 && (
                          <div>
                            <h5 className="font-medium text-purple-800 mb-2">Ministry Interests:</h5>
                            <div className="flex flex-wrap gap-1">
                              {result.ministryInterests.map((interest) => (
                                <Badge key={interest} variant="outline" className="text-xs">
                                  {interest}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="flex gap-2">
                    <Link href={`/results/${result.responseId}`} className="flex-1">
                      <Button 
                        variant="outline" 
                        className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                        disabled={result.isExpired}
                        data-testid={`button-view-${result.id}`}
                      >
                        <ChevronRight className="h-4 w-4 mr-1" />
                        {result.isExpired ? 'Expired' : 'View Details'}
                      </Button>
                    </Link>
                    {!result.isExpired && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-purple-200 text-purple-700 hover:bg-purple-50"
                        onClick={() => copyShareLink(result.responseId)}
                        data-testid={`button-share-${result.id}`}
                      >
                        <ShareIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {(results as UserResult[]).length > 0 && (
          <div className="mt-8 text-center">
            <Link href="/assessment">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white" data-testid="button-retake-assessment">
                Take Assessment Again
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}