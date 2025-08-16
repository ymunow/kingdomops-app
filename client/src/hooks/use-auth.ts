import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/user");
        if (response.status === 401) {
          return null; // Return null for 401 instead of throwing
        }
        if (!response.ok) {
          throw new Error(`${response.status}: ${response.statusText}`);
        }
        return response.json();
      } catch (error) {
        // For network errors or other issues, return null to indicate no authentication
        console.log("Auth check failed:", error);
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // User is authenticated if we have user data and no errors
  const isAuthenticated = !!user && !error;
  const needsProfileCompletion = isAuthenticated && !(user as any)?.profileCompleted;

  return {
    user,
    isLoading,
    isAuthenticated,
    needsProfileCompletion,
  };
}
