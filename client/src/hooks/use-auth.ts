import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, isSuccess } = useQuery({
    queryKey: ["auth-user"], // Use a key that won't be treated as URL by default queryFn
    queryFn: async () => {
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
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Only fetch on initial mount
    refetchInterval: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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
