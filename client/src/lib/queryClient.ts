import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Try to get auth token from query cache first (set by auth hook)
  let authToken = queryClient.getQueryData(['authToken']) as string;
  
  // Fallback to Supabase localStorage if not in cache
  if (!authToken) {
    const supabaseSession = localStorage.getItem('sb-uhrveotjyufguojzpawy-auth-token');
    if (supabaseSession) {
      try {
        const session = JSON.parse(supabaseSession);
        authToken = session?.access_token;
        // Store in cache for next time
        if (authToken) {
          queryClient.setQueryData(['authToken'], authToken);
        }
      } catch (e) {
        console.warn('Failed to parse Supabase session:', e);
      }
    }
  }
  
  console.log('API Request - Token available:', !!authToken, 'Token starts with:', authToken?.substring(0, 10), 'for URL:', url);
  
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  
  // Profile uploads are auto-saved (no header needed)

  // BYPASS VITE: Call Express directly on port 5000 for API routes
  const fullUrl = url.startsWith('/api') ? `http://localhost:5000${url}` : url;
  
  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Try to get auth token from query cache first (set by auth hook)
    let authToken = queryClient.getQueryData(['authToken']) as string;
    
    // Fallback to Supabase localStorage if not in cache
    if (!authToken) {
      const supabaseSession = localStorage.getItem('sb-uhrveotjyufguojzpawy-auth-token');
      if (supabaseSession) {
        try {
          const session = JSON.parse(supabaseSession);
          authToken = session?.access_token;
        } catch (e) {
          console.warn('Failed to parse Supabase session:', e);
        }
      }
    }
    
    const headers: Record<string, string> = {};
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const res = await fetch(queryKey.join("/") as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
