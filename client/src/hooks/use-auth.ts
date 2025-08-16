import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // If there's a 401 error, we're not authenticated
  const isAuthenticated = !!user && !error;
  const needsProfileCompletion = isAuthenticated && !(user as any)?.profileCompleted;

  return {
    user,
    isLoading,
    isAuthenticated,
    needsProfileCompletion,
  };
}
