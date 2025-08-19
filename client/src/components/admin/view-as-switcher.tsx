import { useState, useEffect } from "react";
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
import { Eye, EyeOff, Sparkles, Users, Shield, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { viewAsStorage } from "@/lib/view-as-storage";

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
  targetOrganization?: {
    id: string;
    name: string;
  };
}

interface ViewAsSwitcherProps {
  user: any;
  className?: string;
}

export function ViewAsSwitcher({ user, className }: ViewAsSwitcherProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [localViewContext, setLocalViewContext] = useState<any>(null);

  // Check local storage for view context on component mount
  useEffect(() => {
    const storedContext = viewAsStorage.getViewContext();
    setLocalViewContext(storedContext);
  }, []);

  // Get current view context from server (backup)
  const { data: viewContextData } = useQuery({
    queryKey: ["/api/super-admin/view-context"],
    enabled: user?.role === "SUPER_ADMIN" && !localViewContext,
    refetchOnWindowFocus: false,
  });

  // Get all organizations for super admin
  const { data: organizations = [] } = useQuery<any[]>({
    queryKey: ["/api/organizations"],
    enabled: user?.role === "SUPER_ADMIN",
    refetchOnWindowFocus: false,
  });

  // Use local context first, then server context, then user context
  const viewContext: ViewContext | null = localViewContext || viewContextData?.viewContext || user?.viewContext || null;

  // Switch view mutation
  const switchViewMutation = useMutation({
    mutationFn: async ({ userType, organizationId }: { userType?: string; organizationId?: string }) => {
      const response = await apiRequest("POST", "/api/super-admin/view-as", { userType, organizationId });
      return response.json();
    },
    onSuccess: (data) => {
      // Store context locally for immediate UI update
      if (data?.viewContext) {
        viewAsStorage.setViewContext({
          originalUserId: user.id,
          viewAsType: data.viewContext.viewAsType,
          viewAsUserId: data.viewContext.viewAsUserId,
          viewAsOrganizationId: data.viewContext.viewAsOrganizationId,
          timestamp: new Date().toISOString()
        });
        setLocalViewContext(data.viewContext);
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/organization"] });
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/view-context"] });
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-results"] });
      toast({
        title: "View switched",
        description: "Successfully switched user view context.",
      });
      setIsOpen(false);
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
      const response = await apiRequest("DELETE", "/api/super-admin/view-as");
      return response.json();
    },
    onSuccess: () => {
      // Clear local view context
      viewAsStorage.clearViewContext();
      setLocalViewContext(null);
      
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/organization"] });
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/view-context"] });
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-results"] });
      toast({
        title: "Returned to admin view",
        description: "You're now viewing as the super admin again.",
      });
      setIsOpen(false);
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

  // Show return to admin button if currently in view mode
  if (user?.viewContext?.isViewingAs) {
    return (
      <Button
        variant="outline"
        onClick={() => returnToAdminMutation.mutate()}
        disabled={returnToAdminMutation.isPending}
        className="bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
      >
        <User className="mr-2 h-4 w-4" />
        Return to Admin
      </Button>
    );
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
        return type ? type.replace("_", " ") : "Unknown";
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
            <Sparkles className="h-4 w-4 mr-2" />
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