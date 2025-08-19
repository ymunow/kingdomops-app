import { useAuth } from "@/hooks/useSupabaseAuth";
import { useOrganization } from "@/hooks/use-organization";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ViewAsSwitcher } from "@/components/admin/view-as-switcher";
import { viewAsStorage } from "@/lib/view-as-storage";
import { 
  Crown,
  Gift,
  Calendar,
  Heart,
  Users,
  ChevronRight,
  MapPin,
  Clock,
  DollarSign,
  Target,
  MessageSquare,
  Sparkles,
  Plus,
  ExternalLink
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface DashboardData {
  greeting: {
    name: string;
    time: string;
  };
  primaryCta: {
    type: 'take_assessment' | 'view_gifts' | 'complete_profile';
    title: string;
    description: string;
    action: string;
  };
  serveHighlights: {
    id: string;
    title: string;
    ministry: string;
    matchScore: number;
    requiredGifts: string[];
  }[];
  upcomingEvents: {
    id: string;
    title: string;
    startsAt: string;
    location?: string;
    isVirtual: boolean;
    rsvpStatus?: 'going' | 'interested' | 'cant';
    isRegistered?: boolean;
  }[];
  givingCard: {
    lastGift?: {
      amount: number;
      date: string;
    };
    recurringSetup: boolean;
  };
  connectTeaser: {
    id: string;
    type: string;
    author: {
      name: string;
      avatar?: string;
    };
    body: string;
    createdAt: string;
    reactionCounts: {
      like?: number;
      heart?: number;
      pray?: number;
    };
  }[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const [, setLocation] = useLocation();

  // Get current view context for super admins
  const { data: viewContext } = useQuery<{ viewContext: any }>({
    queryKey: ["/api/super-admin/view-context"],
    enabled: user?.role === 'SUPER_ADMIN',
    retry: false,
  });

  // Get current view context from all sources
  const localViewContext = viewAsStorage.getViewContext();
  const currentViewType = 
    localViewContext?.viewAsType || 
    (viewContext && 'viewContext' in viewContext ? viewContext.viewContext?.viewAsType : null) || 
    null;

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
    enabled: !!user,
    retry: false,
  });

  if (isLoading || !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spiritual-blue mb-4 mx-auto"></div>
          <p className="text-charcoal">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handlePrimaryCta = () => {
    if (dashboardData.primaryCta.type === 'take_assessment') {
      setLocation("/assessment");
    } else if (dashboardData.primaryCta.type === 'view_gifts') {
      setLocation("/my-results");
    } else {
      setLocation("/profile");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Top Navigation for Super Admins */}
      {user?.role === 'SUPER_ADMIN' && !currentViewType && (
        <div className="bg-white/80 backdrop-blur-sm border-b border-purple-200 p-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Crown className="text-spiritual-blue h-6 w-6" />
              <span className="font-semibold text-charcoal">Super Admin View</span>
            </div>
            <ViewAsSwitcher user={user} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 pt-8 space-y-8">
        {/* Greeting + Church Brand */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-charcoal mb-2">
              {getGreeting()}, {user?.firstName || user?.displayName || 'Friend'}!
            </h1>
            <p className="text-gray-600 flex items-center">
              <Crown className="h-5 w-5 text-spiritual-blue mr-2" />
              Welcome to {organization?.name || 'KingdomOps'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/connect")}
            className="flex items-center gap-2"
            data-testid="button-connect"
          >
            <Plus className="h-4 w-4" />
            Share
          </Button>
        </div>

        {/* Primary CTA */}
        <Card className="bg-gradient-to-r from-spiritual-blue to-purple-700 text-white shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">{dashboardData.primaryCta.title}</h2>
                <p className="text-blue-100 text-lg">{dashboardData.primaryCta.description}</p>
                <Button
                  onClick={handlePrimaryCta}
                  size="lg"
                  className="bg-white text-spiritual-blue hover:bg-gray-100"
                  data-testid="button-primary-cta"
                >
                  {dashboardData.primaryCta.action}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <div className="hidden md:flex">
                <Gift className="h-24 w-24 text-blue-200" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Serve Central Highlights */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-spiritual-blue" />
                  Perfect Matches for You
                </CardTitle>
                <CardDescription>
                  Serving opportunities that match your spiritual gifts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData.serveHighlights.length > 0 ? (
                  dashboardData.serveHighlights.map((opportunity) => (
                    <div
                      key={opportunity.id}
                      className="p-4 rounded-lg border border-gray-200 hover:border-spiritual-blue transition-colors cursor-pointer"
                      onClick={() => setLocation(`/serve/${opportunity.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-charcoal">{opportunity.title}</h3>
                          <p className="text-sm text-gray-600">{opportunity.ministry}</p>
                          <div className="flex flex-wrap gap-1">
                            {opportunity.requiredGifts.map((gift) => (
                              <Badge key={gift} variant="secondary" className="text-xs">
                                {gift}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-spiritual-blue">
                            {opportunity.matchScore}% match
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 mt-1" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Complete your assessment to see personalized opportunities!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-spiritual-blue" />
                    Upcoming Events
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setLocation("/events")}>
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData.upcomingEvents.length > 0 ? (
                  dashboardData.upcomingEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="p-4 rounded-lg border border-gray-200 hover:border-spiritual-blue transition-colors cursor-pointer"
                      onClick={() => setLocation(`/events/${event.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-charcoal">{event.title}</h3>
                          <div className="flex items-center text-sm text-gray-600 space-x-4">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {format(new Date(event.startsAt), "MMM d, h:mm a")}
                            </div>
                            <div className="flex items-center">
                              {event.isVirtual ? (
                                <>
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Virtual
                                </>
                              ) : (
                                <>
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {event.location || "Location TBD"}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          {event.rsvpStatus && (
                            <Badge variant={event.rsvpStatus === 'going' ? 'default' : 'secondary'}>
                              {event.rsvpStatus === 'going' ? 'Going' : 
                               event.rsvpStatus === 'interested' ? 'Interested' : 'Can\'t Go'}
                            </Badge>
                          )}
                          <div>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No upcoming events at this time.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Giving Quick Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Generosity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData.givingCard.lastGift ? (
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Last gift</p>
                      <p className="text-2xl font-bold text-charcoal">
                        ${dashboardData.givingCard.lastGift.amount}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(dashboardData.givingCard.lastGift.date))} ago
                      </p>
                    </div>
                    <Separator />
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <DollarSign className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-600">Start your giving journey</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={() => setLocation("/give")}
                    data-testid="button-give"
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Give Now
                  </Button>
                  
                  {!dashboardData.givingCard.recurringSetup && (
                    <Button 
                      variant="outline" 
                      className="w-full text-xs"
                      onClick={() => setLocation("/give/recurring")}
                    >
                      Set up recurring giving
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Connect Teaser */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-spiritual-blue" />
                    KingdomOps Connect
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setLocation("/connect")}>
                    View All
                  </Button>
                </CardTitle>
                <CardDescription>
                  What's happening in your community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData.connectTeaser.length > 0 ? (
                  dashboardData.connectTeaser.map((post) => (
                    <div
                      key={post.id}
                      className="p-3 rounded-lg border border-gray-200 hover:border-spiritual-blue transition-colors cursor-pointer"
                      onClick={() => setLocation(`/connect/post/${post.id}`)}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback>
                            {post.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-charcoal">
                              {post.author.name}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {post.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {post.body}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(post.createdAt))} ago
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              {post.reactionCounts.like && (
                                <span>❤️ {post.reactionCounts.like}</span>
                              )}
                              {post.reactionCounts.pray && (
                                <span>🙏 {post.reactionCounts.pray}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Sparkles className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="mb-2">Be the first to share!</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setLocation("/connect")}
                    >
                      Start connecting
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}