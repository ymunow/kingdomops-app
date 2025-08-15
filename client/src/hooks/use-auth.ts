import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "PARTICIPANT";
}

interface AuthResponse {
  token: string;
  user: User;
}

interface LoginData {
  email: string;
  password: string;
}

interface SignupData {
  name?: string;
  email: string;
  password: string;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const authToken = localStorage.getItem("auth_token");
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    enabled: !!authToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
  
  // If there's no auth token, we're not loading
  const actuallyLoading = !!authToken && isLoading;

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await authApiRequest("POST", "/api/auth/signin", data);
      return await response.json();
    },
    onSuccess: (data: AuthResponse) => {
      localStorage.setItem("auth_token", data.token);
      queryClient.setQueryData(["/api/auth/me"], data.user);
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupData) => {
      const response = await authApiRequest("POST", "/api/auth/signup", data);
      return await response.json();
    },
    onSuccess: (data: AuthResponse) => {
      localStorage.setItem("auth_token", data.token);
      queryClient.setQueryData(["/api/auth/me"], data.user);
    },
  });

  const logout = () => {
    localStorage.removeItem("auth_token");
    queryClient.setQueryData(["/api/auth/me"], null);
    queryClient.clear();
  };

  return {
    user,
    isLoading: actuallyLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    signup: signupMutation.mutateAsync,
    logout,
    isLoginLoading: loginMutation.isPending,
    isSignupLoading: signupMutation.isPending,
  };
}

// Custom apiRequest with authorization header
export const authApiRequest = async (
  method: string,
  url: string,
  data?: unknown
): Promise<Response> => {
  const token = localStorage.getItem("auth_token");
  const headers: HeadersInit = data ? { "Content-Type": "application/json" } : {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  return res;
};
