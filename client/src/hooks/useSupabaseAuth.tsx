import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { createClient, User, Session } from '@supabase/supabase-js';
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as AppUser } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Using provided credentials with environment variable fallback
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "https://uhrveotjyufguojzpawy.supabase.co",
  import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVocnZlb3RqeXVmZ3VvanpwYXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NzY2ODksImV4cCI6MjA3MTA1MjY4OX0.pttCCLGODMAMarg6YAZUM6kczMCkB-FLREoAsV8paMk",
  {
    auth: {
      // Disable automatic redirect to avoid the long URL issue
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'implicit'
    }
  }
);

type AuthContextType = {
  user: AppUser | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
  signInMutation: UseMutationResult<any, Error, SignInData>;
  signUpMutation: UseMutationResult<any, Error, SignUpData>;
  signOutMutation: UseMutationResult<void, Error, void>;
  resetPasswordMutation: UseMutationResult<void, Error, { email: string }>;
};

type SignInData = {
  email: string;
  password: string;
};

type SignUpData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for initial session with error handling
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session initialization error:', error);
        } else {
          setSession(session);
          // Set initial auth token if session exists
          if (session?.access_token) {
            queryClient.setQueryData(['authToken'], session.access_token);
            console.log('Initial auth token set:', session.access_token.substring(0, 20) + '...');
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log('Auth state change:', event, session?.user?.email || 'no user');
          setSession(session);
          
          if (session) {
            // Set the auth token for API requests
            queryClient.setQueryData(['authToken'], session.access_token);
            console.log('Set auth token:', session.access_token?.substring(0, 20) + '...');
          } else {
            queryClient.clear();
          }
        } catch (error) {
          console.error('Auth state change error:', error);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user data from our backend
  const {
    data: user,
    error,
    isLoading: userLoading,
  } = useQuery<AppUser | undefined, Error>({
    queryKey: ["/api/auth/user"],
    enabled: !!session, // Only fetch when we have a session
    retry: false,
  });

  const signInMutation = useMutation({
    mutationFn: async (credentials: SignInData) => {
      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setSession(data.session);
      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully.",
      });
      // Redirect to dashboard after successful signin
      window.location.href = '/';
    },
    onError: (error: Error) => {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async (credentials: SignUpData) => {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            first_name: credentials.firstName,
            last_name: credentials.lastName,
          }
        }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.session) {
        // User is automatically logged in
        setSession(data.session);
        toast({
          title: "Welcome!",
          description: "Your account has been created successfully.",
        });
        window.location.href = '/';
      } else {
        // Email confirmation required
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      setSession(null);
      queryClient.clear();
      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      // Use the current window origin which will be the Replit URL in development
      const redirectUrl = `${window.location.origin}/auth?reset=true`;
      console.log('Password reset redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Password reset email sent",
        description: "Please check your email for password reset instructions.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Reset failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        session,
        isLoading: isLoading || userLoading,
        error,
        signInMutation,
        signUpMutation,
        signOutMutation,
        resetPasswordMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Hook for accessing Supabase client directly
export function useSupabase() {
  return supabase;
}