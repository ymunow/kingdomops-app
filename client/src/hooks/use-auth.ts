import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error, isSuccess, isFetching } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/user", {
          credentials: "include"
        });
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
    refetchOnMount: false,
    refetchInterval: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Only loading if the query is actively fetching and we don't have data yet
  const actuallyLoading = (isLoading || isFetching) && user === undefined;
  
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
