import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error, isSuccess } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/user");
        if (response.status === 401) {
          return null; // Not authenticated
        }
        if (!response.ok) {
          return null; // Treat other errors as not authenticated
        }
        return response.json();
      } catch (error) {
        // Network errors or other issues - treat as not authenticated
        console.log("Auth check failed:", error);
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Only loading if the query hasn't completed yet
  const actuallyLoading = isLoading && !isSuccess;
  
  // User is authenticated if we have user data (not null)
  const isAuthenticated = !!user;
  const needsProfileCompletion = isAuthenticated && !(user as any)?.profileCompleted;

  return {
    user,
    isLoading: actuallyLoading,
    isAuthenticated,
    needsProfileCompletion,
  };
}
