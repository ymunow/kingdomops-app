import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useSupabaseAuth";

interface Organization {
  id: string;
  name: string;
  description?: string;
  website?: string;
  address?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface OrganizationContextType {
  organization: Organization | null;
  isLoading: boolean;
  error: Error | null;
}

const OrganizationContext = createContext<OrganizationContextType | null>(null);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth();

  const { data: organization, isLoading, error } = useQuery<Organization | undefined, Error>({
    queryKey: ["/api/auth/organization"],
    enabled: !!user && !!session,
    retry: false,
  });

  return (
    <OrganizationContext.Provider value={{
      organization: organization || null,
      isLoading,
      error
    }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  return context;
}