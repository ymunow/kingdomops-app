import React, { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { initializeCacheManagement } from "./utils/cache-management";
import ProfileCompletionModal from "@/components/profile/profile-completion-modal";
import Landing from "@/pages/landing";
import Assessment from "@/pages/assessment";
import Results from "@/pages/results";
import MyResults from "@/pages/my-results";
import Admin from "@/pages/admin";
import AdminDashboard from "@/pages/admin-dashboard";
import Profile from "@/pages/profile";
import ChurchSignup from "@/pages/church-signup";
import CongregationSignup from "@/pages/congregation-signup";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, needsProfileCompletion, user } = useAuth();

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

  return (
    <>
      {/* Profile Completion Modal - shown when user needs to complete profile */}
      <ProfileCompletionModal 
        isOpen={needsProfileCompletion} 
        userEmail={(user as any)?.email} 
      />
      
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/results/:responseId" component={Results} />
        
        {/* Public routes for church and congregation signup */}
        <Route path="/church-signup" component={ChurchSignup} />
        <Route path="/join/:orgId" component={CongregationSignup} />
        
        {/* Protected routes - only render if authenticated and profile completed */}
        {isAuthenticated && !needsProfileCompletion && (
          <>
            <Route path="/assessment" component={Assessment} />
            <Route path="/my-results" component={MyResults} />
            <Route path="/profile" component={Profile} />
            
            {/* Admin routes - only for admin-level roles */}
            {(user as any)?.role && ["SUPER_ADMIN", "ORG_OWNER", "ORG_ADMIN", "ORG_LEADER", "ADMIN"].includes((user as any).role) && (
              <>
                <Route path="/admin" component={Admin} />
                <Route path="/admin-dashboard" component={AdminDashboard} />
              </>
            )}
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
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
