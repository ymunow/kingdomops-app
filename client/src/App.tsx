import React, { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useSupabaseAuth";
import { viewAsStorage } from "./lib/view-as-storage";
import { useQuery } from "@tanstack/react-query";
import AuthPage from "@/pages/auth";
import { initializeCacheManagement } from "./utils/cache-management";
import ProfileCompletionModal from "@/components/profile/profile-completion-modal";
import Landing from "@/pages/landing";
import Assessment from "@/pages/assessment";
import { SubdomainLanding } from "@/components/subdomain/subdomain-landing";
import { useSubdomain } from "@/hooks/use-subdomain";
import AnonymousAssessment from "@/pages/anonymous-assessment";
import Results from "@/pages/results";
import MyResults from "@/pages/my-results";
import Admin from "@/pages/admin";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminPlatform from "@/pages/admin-platform";
import AdminOrganizations from "@/pages/admin-organizations";
import AdminOrganizationDetail from "@/pages/admin-organization-detail";
import AdminOrganizationSettings from "@/pages/admin-organization-settings";
import AdminSystem from "@/pages/admin-system";
import ChurchOverview from "@/pages/church-overview";
import LeaderOpportunities from "@/pages/leader-opportunities";
import MemberDashboard from "@/pages/member-dashboard";
import Profile from "@/pages/profile";
import ChurchSignup from "@/pages/church-signup";
import ChurchAdminWelcome from "@/pages/church-admin-welcome";
import CongregationSignup from "@/pages/congregation-signup";
import JoinCongregation from "@/pages/join-congregation";
import SubdomainDemo from "@/pages/subdomain-demo";
import Pricing from "@/pages/pricing";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isLoading, session } = useAuth();
  const isAuthenticated = !!user;
  const { subdomain, organization, isSubdomainMode, hasValidOrganization } = useSubdomain();
  
  // For now, skip profile completion check - we'll implement this later
  const needsProfileCompletion = false;
  
  // Fetch current view context for super admins
  const { data: viewContext } = useQuery<{ viewContext: any }>({
    queryKey: ["/api/super-admin/view-context"],
    enabled: user?.role === 'SUPER_ADMIN',
    retry: false,
  });

  // Clear any persistent view context on app load for super admins
  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN' && !window.location.pathname.includes('view-as')) {
      // Clear client-side view context storage
      viewAsStorage.clearViewContext();
    }
  }, [user?.role]);

  // Get current view context from all sources - only if explicitly set
  const localViewContext = viewAsStorage.getViewContext();
  const serverViewContext = viewContext && 'viewContext' in viewContext ? viewContext.viewContext?.viewAsType : null;
  
  // Only use view context if it was explicitly set by user action (not persistent from old sessions)
  // Super admins should get their admin view by default unless they explicitly choose "View As"
  const currentViewType = (user?.role === 'SUPER_ADMIN' && !localViewContext) ? null : (localViewContext?.viewAsType || serverViewContext || null);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spiritual-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle subdomain-based routing
  if (isSubdomainMode) {
    if (hasValidOrganization) {
      // Show subdomain landing page
      return (
        <>
          <ProfileCompletionModal 
            isOpen={needsProfileCompletion} 
            userEmail={(user as any)?.email} 
          />
          <SubdomainLanding subdomain={subdomain!} />
        </>
      );
    } else {
      // Invalid subdomain
      return (
        <>
          <ProfileCompletionModal 
            isOpen={needsProfileCompletion} 
            userEmail={(user as any)?.email} 
          />
          <SubdomainLanding subdomain={subdomain!} />
        </>
      );
    }
  }

  return (
    <>
      {/* Profile Completion Modal - shown when user needs to complete profile */}
      <ProfileCompletionModal 
        isOpen={needsProfileCompletion} 
        userEmail={(user as any)?.email} 
      />
      
      <Switch>
        {/* Authentication routes */}
        <Route path="/auth" component={AuthPage} />
        
        {/* Public routes available to everyone */}
        <Route path="/church-signup" component={ChurchSignup} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/join" component={JoinCongregation} />
        <Route path="/join/:orgId" component={CongregationSignup} />
        <Route path="/results/:responseId" component={Results} />
        <Route path="/subdomain-demo" component={SubdomainDemo} />
        
        {/* Homepage routing - different for authenticated vs non-authenticated */}
        {isAuthenticated ? (
          <>
            {/* Homepage routing based on user role and view context */}
            <Route path="/">
              {() => {
                const userRole = (user as any)?.role;
                const organizationId = (user as any)?.organizationId;
                
                // Normal admin routing - super admins get admin view by default
                if (userRole && ["SUPER_ADMIN", "ORG_OWNER", "ORG_ADMIN", "ORG_LEADER", "ADMIN"].includes(userRole)) {
                  if (userRole === "SUPER_ADMIN") {
                    // If super admin is explicitly viewing as PARTICIPANT, show member dashboard
                    if (currentViewType === "PARTICIPANT") {
                      return <MemberDashboard />;
                    }
                    // Default: show platform overview with default organization
                    return <ChurchOverview organizationId="default-org-001" />;
                  } else if (organizationId && ["ORG_OWNER", "ORG_ADMIN", "ORG_LEADER"].includes(userRole)) {
                    // For church admins, show their own organization overview
                    return <ChurchOverview organizationId={organizationId} />;
                  }
                }
                
                // Default to member dashboard for all other cases
                return <MemberDashboard />;
              }}
            </Route>
            
            {/* Protected routes */}
            <Route path="/assessment" component={Assessment} />
            <Route path="/my-results" component={MyResults} />
            <Route path="/profile" component={Profile} />
            
            {/* Admin routes - only for admin-level roles */}
            {(user as any)?.role && ["SUPER_ADMIN", "ORG_OWNER", "ORG_ADMIN", "ORG_LEADER", "ADMIN"].includes((user as any).role) && (
              <>
                <Route path="/admin" component={Admin} />
                <Route path="/admin-dashboard" component={AdminDashboard} />
                <Route path="/admin/platform" component={AdminPlatform} />
                <Route path="/admin/organizations" component={AdminOrganizations} />
                <Route path="/admin/organizations/:id/settings" component={AdminOrganizationSettings} />
                <Route path="/admin/organizations/:id/overview">
                  {(params) => <ChurchOverview organizationId={params.id} />}
                </Route>
                <Route path="/admin/organizations/:id" component={AdminOrganizationDetail} />
                <Route path="/admin/system" component={AdminSystem} />
              </>
            )}
            
            {/* Leader routes - for ORG_LEADER and above */}
            {(user as any)?.role && ["SUPER_ADMIN", "ORG_OWNER", "ORG_ADMIN", "ORG_LEADER"].includes((user as any).role) && (
              <>
                <Route path="/leader/opportunities" component={LeaderOpportunities} />
              </>
            )}
          </>
        ) : (
          <>
            {/* Public landing page for non-authenticated users */}
            <Route path="/" component={Landing} />
          </>
        )}
        
        {/* Catch-all route */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  // Initialize cache management on app startup
  useEffect(() => {
    initializeCacheManagement();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
