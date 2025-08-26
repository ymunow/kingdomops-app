import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useSupabaseAuth";
import { apiRequest } from "@/lib/queryClient";

interface Organization {
  id: string;
  name: string;
  description?: string;
  website?: string;
  address?: string;
  inviteCode: string;
}

export function useOrganization() {
  const { user, session } = useAuth();
  
  const { data: organization, isLoading, error } = useQuery({
    queryKey: ["/api/auth/organization"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/auth/organization");
        return response;
      } catch (error: any) {
        if (error.status === 404) {
          return null; // User not associated with organization
        }
        throw error;
      }
    },
    enabled: !!(user && session),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    organization,
    isLoading,
    error,
    hasOrganization: !!organization,
  };
}