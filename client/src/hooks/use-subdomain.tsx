import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface OrganizationInfo {
  id: string;
  name: string;
  subdomain: string;
  description?: string;
  website?: string;
  contactEmail?: string;
}

/**
 * Hook to detect and manage subdomain organization context
 */
export function useSubdomain() {
  const [subdomain, setSubdomain] = useState<string | null>(null);

  // Extract subdomain from hostname
  useEffect(() => {
    const hostname = window.location.hostname;
    
    // Skip subdomain detection for development/localhost environments
    if (hostname === 'localhost' || hostname.includes('127.0.0.1') || hostname.includes('replit.dev')) {
      // For development, check for hash-based routing like /#/org/subdomain
      const hash = window.location.hash;
      const hashSubdomain = hash.match(/#\/org\/([^\/]+)/);
      if (hashSubdomain) {
        setSubdomain(hashSubdomain[1]);
      }
      return;
    }
    
    const parts = hostname.split('.');
    
    // If we have multiple parts and it's not a reserved subdomain
    if (parts.length > 2) {
      const potentialSubdomain = parts[0];
      
      // Skip common non-subdomain prefixes
      if (!['www', 'api', 'admin', 'app'].includes(potentialSubdomain)) {
        setSubdomain(potentialSubdomain);
      }
    }
  }, []);

  // Fetch organization info if subdomain is detected
  const { data: organization, isLoading, error } = useQuery<OrganizationInfo>({
    queryKey: [`/api/subdomain/${subdomain}/info`],
    enabled: !!subdomain,
    retry: false
  });

  return {
    subdomain,
    organization,
    isLoading,
    error,
    isSubdomainMode: !!subdomain,
    hasValidOrganization: !!organization && !error
  };
}

/**
 * Generate subdomain URL for an organization
 */
export function generateSubdomainUrl(subdomain: string, path: string = ''): string {
  // In development, use hash routing
  if (window.location.hostname === 'localhost' || window.location.hostname.includes('replit')) {
    return `${window.location.origin}/#/org/${subdomain}${path}`;
  }
  
  // In production, use actual subdomains
  const protocol = window.location.protocol;
  const baseDomain = window.location.hostname.split('.').slice(-2).join('.');
  return `${protocol}//${subdomain}.${baseDomain}${path}`;
}

/**
 * Navigate to subdomain context
 */
export function navigateToSubdomain(subdomain: string, path: string = '') {
  const url = generateSubdomainUrl(subdomain, path);
  window.location.href = url;
}