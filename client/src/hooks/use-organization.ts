import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

interface Organization {
  id: string;
  name: string;
  description?: string;
  website?: string;
  address?: string;
  inviteCode: string;
}

export function useOrganization() {
  const { isAuthenticated } = useAuth();
  
  const { data: organization, isLoading, error } = useQuery({
    queryKey: ["/api/auth/organization"],
    queryFn: async () => {
      const response = await fetch("/api/auth/organization");
      if (response.status === 404) {
        return null; // User not associated with organization
      }
      if (!response.ok) {
        throw new Error("Failed to fetch organization");
      }
      return response.json();
    },
    enabled: isAuthenticated,
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