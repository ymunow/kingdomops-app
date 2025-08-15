import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown } from "lucide-react";
import { StatsDashboard } from "@/components/admin/stats-dashboard";
import { ParticipantsTable } from "@/components/admin/participants-table";
import { useEffect } from "react";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!user || user?.role !== "ADMIN")) {
      toast({
        title: "Access denied",
        description: "Admin access required to view this page.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [user, isLoading, setLocation, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spiritual-blue mb-4 mx-auto"></div>
          <p className="text-charcoal">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-soft-cream">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Crown className="text-spiritual-blue h-8 w-8 mr-3" />
                <h1 className="font-display font-bold text-xl text-charcoal">Kingdom Impact Training</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-charcoal" data-testid="text-admin-username">
                {user?.name || user?.email} (Admin)
              </span>
              <Button variant="outline" onClick={() => setLocation("/")} data-testid="button-back-home">
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-display font-bold text-3xl text-charcoal">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage assessments and view participant insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats Dashboard */}
          <StatsBoard />

          {/* Participants Table */}
          <Card className="bg-white shadow-sm border border-gray-100">
            <CardContent className="p-0">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="font-display font-semibold text-xl text-charcoal">Assessment Responses</h3>
                <p className="text-gray-600 text-sm">View and manage all participant responses</p>
              </div>
              <ParticipantsTable />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function StatsBoard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <StatsChboard />
      </div>
      <div>
        <Card className="bg-white shadow-sm border border-gray-100 h-full">
          <CardContent className="p-6">
            <h3 className="font-display font-semibold text-xl text-charcoal mb-6">Quick Actions</h3>
            <div className="space-y-4">
              <Button 
                className="w-full bg-sage-green text-white hover:bg-green-600"
                onClick={() => window.location.href = '/api/admin/export'}
                data-testid="button-export-csv"
              >
                Export All Data (CSV)
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.reload()}
                data-testid="button-refresh-data"
              >
                Refresh Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsChboard() {
  return <StatsDashboard />;
}
