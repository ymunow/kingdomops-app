import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, EyeOff, Crown, Users, Shield, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ViewContext {
  isViewingAs: boolean;
  originalUser: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  viewAsType: string;
}

interface ViewAsSwitcherProps {
  user: any;
  className?: string;
}

export function ViewAsSwitcher({ user, className }: ViewAsSwitcherProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Get current view context
  const { data: viewContextData } = useQuery({
    queryKey: ["/api/super-admin/view-context"],
    enabled: user?.role === "SUPER_ADMIN",
    refetchOnWindowFocus: false,
  });

  // Get all organizations for super admin
  const { data: organizations = [] } = useQuery<any[]>({
    queryKey: ["/api/organizations"],
    enabled: user?.role === "SUPER_ADMIN",
    refetchOnWindowFocus: false,
  });

  const viewContext: ViewContext | null = user?.viewContext || null;

  // Switch view mutation
  const switchViewMutation = useMutation({
    mutationFn: async ({ userType, organizationId }: { userType?: string; organizationId?: string }) => {
      const response = await fetch("/api/super-admin/view-as", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userType, organizationId }),
      });
      if (!response.ok) {
        throw new Error("Failed to switch view");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/organization"] });
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/view-context"] });
      toast({
        title: "View switched",
        description: "Successfully switched user view context.",
      });
      setIsOpen(false);
      // Refresh page to ensure all components update
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: "Switch failed",
        description: error.message || "Failed to switch view context.",
        variant: "destructive",
      });
    },
  });

  // Return to admin view mutation
  const returnToAdminMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/super-admin/view-as", {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to return to admin view");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/organization"] });
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/view-context"] });
      toast({
        title: "Returned to admin view",
        description: "You're now viewing as the super admin again.",
      });
      setIsOpen(false);
      // Refresh page to ensure all components update
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: "Return failed",
        description: error.message || "Failed to return to admin view.",
        variant: "destructive",
      });
    },
  });

  // Only show for super admins
  if (user?.role !== "SUPER_ADMIN" && !viewContext) {
    return null;
  }

  const handleSwitchView = (userType: string) => {
    switchViewMutation.mutate({ userType });
  };

  const handleSwitchToOrganization = (organizationId: string) => {
    switchViewMutation.mutate({ organizationId });
  };

  const handleReturnToAdmin = () => {
    returnToAdminMutation.mutate();
  };

  const getViewTypeIcon = (type: string) => {
    switch (type) {
      case "PARTICIPANT":
        return <User className="h-4 w-4" />;
      case "ORG_ADMIN":
        return <Shield className="h-4 w-4" />;
      case "ORG_LEADER":
        return <Users className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getViewTypeLabel = (type: string) => {
    switch (type) {
      case "PARTICIPANT":
        return "Church Member";
      case "ORG_ADMIN":
        return "Church Admin";
      case "ORG_LEADER":
        return "Church Leader";
      default:
        return type.replace("_", " ");
    }
  };

  return (
    <div className={className}>
      {viewContext ? (
        // Currently viewing as someone else or managing an organization
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-800">
            <Eye className="h-3 w-3 mr-1" />
            {viewContext.targetOrganization 
              ? `Managing ${viewContext.targetOrganization.name}` 
              : `Viewing as ${getViewTypeLabel(viewContext.viewAsType)}`}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReturnToAdmin}
            disabled={returnToAdminMutation.isPending}
            data-testid="button-return-to-admin"
          >
            <Crown className="h-4 w-4 mr-2" />
            Return to Super Admin
          </Button>
        </div>
      ) : (
        // Super admin view - show view switcher
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
              data-testid="button-view-as-dropdown"
            >
              <Eye className="h-4 w-4 mr-2" />
              View As
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-sm font-semibold text-gray-700">
              Switch User View
            </div>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              onClick={() => handleSwitchView("PARTICIPANT")}
              disabled={switchViewMutation.isPending}
              data-testid="menu-item-view-as-participant"
            >
              <User className="h-4 w-4 mr-2" />
              Church Member
              <span className="ml-auto text-xs text-gray-500">Regular user</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => handleSwitchView("ORG_ADMIN")}
              disabled={switchViewMutation.isPending}
              data-testid="menu-item-view-as-org-admin"
            >
              <Shield className="h-4 w-4 mr-2" />
              Church Admin
              <span className="ml-auto text-xs text-gray-500">Admin access</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => handleSwitchView("ORG_LEADER")}
              disabled={switchViewMutation.isPending}
              data-testid="menu-item-view-as-org-leader"
            >
              <Users className="h-4 w-4 mr-2" />
              Church Leader
              <span className="ml-auto text-xs text-gray-500">Leader access</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {/* Organization Management Section */}
            {organizations.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-sm font-semibold text-gray-700">
                  Manage Organizations
                </div>
                
                {organizations.map((org: any) => (
                  <DropdownMenuItem
                    key={org.id}
                    onClick={() => handleSwitchToOrganization(org.id)}
                    disabled={switchViewMutation.isPending}
                    data-testid={`menu-item-manage-org-${org.id}`}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {org.name}
                    <span className="ml-auto text-xs text-gray-500">Manage</span>
                  </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator />
              </>
            )}
            
            <div className="px-2 py-1.5 text-xs text-gray-500">
              Test different user experiences without logging out
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}