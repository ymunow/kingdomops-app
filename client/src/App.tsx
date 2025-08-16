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

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/results/:responseId" component={Results} />
      {isAuthenticated && (
        <>
          <Route path="/assessment" component={Assessment} />
          <Route path="/my-results" component={MyResults} />
          <Route path="/admin" component={Admin} />
        </>
      )}
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
