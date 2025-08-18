import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useOrganization } from "@/hooks/use-organization";
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
  const { organization, isLoading: orgLoading } = useOrganization();
  const { toast } = useToast();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    const adminRoles = ["SUPER_ADMIN", "ORG_OWNER", "ORG_ADMIN", "ORG_LEADER", "ADMIN"];
    
    // Check actual user role (including original role if in view-as mode)
    const actualUserRole = (user as any)?.viewContext?.originalUser?.role || (user as any)?.role;
    
    if (!isLoading && (!user || !adminRoles.includes(actualUserRole))) {
      toast({
        title: "Access denied",
        description: "Admin access required to view this page.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [user, isLoading, setLocation, toast]);

  if (isLoading || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spiritual-blue mb-4 mx-auto"></div>
          <p className="text-charcoal">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const adminRoles = ["SUPER_ADMIN", "ORG_OWNER", "ORG_ADMIN", "ORG_LEADER", "ADMIN"];
  const actualUserRole = (user as any)?.viewContext?.originalUser?.role || (user as any)?.role;
  if (!user || !adminRoles.includes(actualUserRole)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Crown className="text-spiritual-blue h-8 w-8 mr-3" />
                <div>
                  <h1 className="font-display font-bold text-xl text-charcoal">
                    {organization?.name || "Kingdom Impact Training"}
                  </h1>
                  <p className="text-sm text-gray-600">Church Administration Portal</p>
                </div>
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
      <section className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-display font-bold text-3xl text-charcoal">
                {organization?.name ? `${organization.name} - Admin Dashboard` : "Admin Dashboard"}
              </h1>
              <p className="text-gray-600 mt-2">
                {organization?.name ? `Manage assessments and participant insights for ${organization.name}` : "Manage assessments and view participant insights"}
              </p>
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
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
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
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200 h-full">
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
