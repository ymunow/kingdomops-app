import React, { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { initializeCacheManagement } from "./utils/cache-management";
import Landing from "@/pages/landing";
import Assessment from "@/pages/assessment";
import Results from "@/pages/results";
import MyResults from "@/pages/my-results";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

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
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/results/:responseId" component={Results} />
      
      {/* Protected routes */}
      <Route path="/assessment">
        {isAuthenticated ? <Assessment /> : <Landing />}
      </Route>
      <Route path="/my-results">
        {isAuthenticated ? <MyResults /> : <Landing />}
      </Route>
      <Route path="/admin">
        {isAuthenticated ? <Admin /> : <Landing />}
      </Route>
      
      {/* Catch-all route */}
      <Route component={NotFound} />
    </Switch>
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
