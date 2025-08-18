import { useState } from "react";
import { useAuth } from "@/hooks/useSupabaseAuth";
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
  ChevronDown 
} from "lucide-react";

interface AdminNavigationBarProps {
  className?: string;
}

export function AdminNavigationBar({ className = "" }: AdminNavigationBarProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Only show for admin users
  if (!user?.role || !["SUPER_ADMIN", "ORG_ADMIN", "ORG_OWNER"].includes(user.role)) {
    return null;
  }

  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const isChurchAdmin = user.role === "ORG_ADMIN";

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
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }>
                  <Shield className="mr-1 h-3 w-3" />
                  {isSuperAdmin ? "Super Admin" : "Admin"}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
    </div>
  );
}