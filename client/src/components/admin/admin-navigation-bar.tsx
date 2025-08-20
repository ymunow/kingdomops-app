import { useState } from "react";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Settings, 
  Church, 
  BarChart3, 
  Users, 
  User,
  ChevronUp,
  ChevronDown,
  Award,
  Target,
  Calendar,
  TrendingUp
} from "lucide-react";

interface AdminNavigationBarProps {
  className?: string;
}

export function AdminNavigationBar({ className = "" }: AdminNavigationBarProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Check for view-as context
  const { data: viewContext } = useQuery<{ viewContext: any }>({
    queryKey: ['/api/super-admin/view-context'],
    enabled: user?.role === "SUPER_ADMIN"
  });

  // Determine effective role (considering view-as context)
  const effectiveRole = viewContext?.viewContext?.viewAsType || user?.role;

  // Only show for admin users or leaders
  if (!user?.role || !["SUPER_ADMIN", "ORG_ADMIN", "ORG_OWNER", "ORG_LEADER"].includes(user.role)) {
    // Also check if super admin is viewing as leader
    if (!(user?.role === "SUPER_ADMIN" && effectiveRole === "ORG_LEADER")) {
      return null;
    }
  }

  const isSuperAdmin = user.role === "SUPER_ADMIN" && (!viewContext?.viewContext || viewContext.viewContext.viewAsType === "SUPER_ADMIN");
  const isChurchAdmin = user.role === "ORG_ADMIN" || (user.role === "SUPER_ADMIN" && effectiveRole === "ORG_ADMIN");
  const isChurchLeader = user.role === "ORG_LEADER" || (user.role === "SUPER_ADMIN" && effectiveRole === "ORG_LEADER");

  if (isCollapsed) {
    return (
      <div className={`sticky top-4 z-10 ${className}`}>
        <Card className="bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={
                  isSuperAdmin 
                    ? "bg-purple-50 text-purple-700 border-purple-200" 
                    : isChurchLeader
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }>
                  <Shield className="mr-1 h-3 w-3" />
                  {isSuperAdmin ? "Super Admin" : isChurchLeader ? "Church Leader" : "Admin"}
                </Badge>
                <span className="text-sm text-gray-600">Quick Actions</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(false)}
                className="h-8 w-8 p-0"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`sticky top-4 z-10 ${className}`}>
      {/* Super Admin Controls */}
      {isSuperAdmin && (
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="font-semibold text-purple-900">Super Admin Controls</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(true)}
                className="h-8 w-8 p-0 text-purple-600 hover:bg-purple-100"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/admin/platform')}
                className="bg-white hover:bg-purple-50 text-xs"
              >
                <BarChart3 className="mr-1 h-3 w-3" />
                Platform
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/admin/organizations')}
                className="bg-white hover:bg-purple-50 text-xs"
              >
                <Church className="mr-1 h-3 w-3" />
                Churches
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/admin/questions')}
                className="bg-white hover:bg-purple-50 text-xs"
              >
                <Award className="mr-1 h-3 w-3" />
                Questions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/admin/system')}
                className="bg-white hover:bg-purple-50 text-xs"
              >
                <Settings className="mr-1 h-3 w-3" />
                System
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/')}
                className="bg-white hover:bg-purple-50 text-xs"
              >
                <BarChart3 className="mr-1 h-3 w-3" />
                Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Church Admin Controls */}
      {isChurchAdmin && (
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-900">Admin Controls</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(true)}
                className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/admin')}
                className="bg-white hover:bg-blue-50 text-xs"
              >
                <User className="mr-1 h-3 w-3" />
                Users
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/admin')}
                className="bg-white hover:bg-blue-50 text-xs"
              >
                <BarChart3 className="mr-1 h-3 w-3" />
                Assessments
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/admin')}
                className="bg-white hover:bg-blue-50 text-xs"
              >
                <Users className="mr-1 h-3 w-3" />
                Ministries
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/')}
                className="bg-white hover:bg-blue-50 text-xs"
              >
                <BarChart3 className="mr-1 h-3 w-3" />
                Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Church Leader Controls */}
      {isChurchLeader && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Award className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-green-900">Ministry Leadership Tools</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(true)}
                className="h-8 w-8 p-0 text-green-600 hover:bg-green-100"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/leader/opportunities')}
                className="bg-white hover:bg-green-50 text-xs"
              >
                <Target className="mr-1 h-3 w-3" />
                Create Opportunities
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/leader/opportunities')}
                className="bg-white hover:bg-green-50 text-xs"
              >
                <Users className="mr-1 h-3 w-3" />
                View Matches
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/admin')}
                className="bg-white hover:bg-green-50 text-xs"
              >
                <BarChart3 className="mr-1 h-3 w-3" />
                Team Results
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/admin')}
                className="bg-white hover:bg-green-50 text-xs"
              >
                <TrendingUp className="mr-1 h-3 w-3" />
                Analytics
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/admin')}
                className="bg-white hover:bg-green-50 text-xs"
              >
                <Calendar className="mr-1 h-3 w-3" />
                Placements
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/')}
                className="bg-white hover:bg-green-50 text-xs"
              >
                <BarChart3 className="mr-1 h-3 w-3" />
                Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}