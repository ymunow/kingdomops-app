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

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "https://uhrveotjyufguojzpawy.supabase.co",
  import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVocnZlb3RqeXVmZ3VvanpwYXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NzY2ODksImV4cCI6MjA3MTA1MjY4OX0.pttCCLGODMAMarg6YAZUM6kczMCkB-FLREoAsV8paMk"
);

type AuthContextType = {
  user: AppUser | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
  signInMutation: UseMutationResult<any, Error, SignInData>;
  signUpMutation: UseMutationResult<any, Error, SignUpData>;
  signOutMutation: UseMutationResult<void, Error, void>;
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session) {
          // Set the auth token for API requests
          queryClient.setQueryData(['authToken'], session.access_token);
        } else {
          queryClient.removeQueries();
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
    enabled: !!session,
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
    onSuccess: () => {
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
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