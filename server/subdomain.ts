import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

export interface SubdomainRequest extends Request {
  organization?: {
    id: string;
    name: string;
    subdomain: string;
    inviteCode: string;
  };
}

/**
 * Middleware to detect organization from subdomain
 * Supports both subdomain.domain.com and domain.com/subdomain patterns
 */
export async function subdomainMiddleware(
  req: SubdomainRequest,
  res: Response,
  next: NextFunction
) {
  try {
    let subdomain: string | null = null;

    // Extract subdomain from hostname (e.g., "fwc.kingdomops.app" -> "fwc")
    const hostname = req.hostname;
    const parts = hostname.split('.');
    
    // If we have multiple parts, the first part is likely the subdomain
    if (parts.length > 2) {
      const potentialSubdomain = parts[0];
      
      // Skip common non-subdomain prefixes
      if (!['www', 'api', 'admin', 'app'].includes(potentialSubdomain)) {
        subdomain = potentialSubdomain;
      }
    }

    // Alternative: Check for subdomain in path (e.g., "/org/fwc/...")
    const pathSubdomain = req.path.match(/^\/org\/([^\/]+)/);
    if (pathSubdomain) {
      subdomain = pathSubdomain[1];
    }

    // If subdomain found, look up organization
    if (subdomain) {
      const organization = await storage.getOrganizationBySubdomain(subdomain);
      if (organization) {
        req.organization = organization;
        console.log(`Organization detected from subdomain "${subdomain}": ${organization.name}`);
      }
    }

    next();
  } catch (error) {
    console.error('Subdomain middleware error:', error);
    next(); // Continue without organization context
  }
}

/**
 * Helper to get organization from subdomain
 */
export async function getOrganizationFromSubdomain(hostname: string) {
  const parts = hostname.split('.');
  
  if (parts.length > 2) {
    const subdomain = parts[0];
    
    if (!['www', 'api', 'admin', 'app'].includes(subdomain)) {
      return await storage.getOrganizationBySubdomain(subdomain);
    }
  }
  
  return null;
}

/**
 * Helper to generate subdomain URL
 */
export function generateSubdomainUrl(subdomain: string, baseDomain: string = 'kingdomops.app'): string {
  return `https://${subdomain}.${baseDomain}`;
}

/**
 * Validate subdomain format
 */
export function isValidSubdomain(subdomain: string): boolean {
  // Must be 3-30 characters, alphanumeric and hyphens only
  // Cannot start or end with hyphen
  const subdomainRegex = /^[a-z0-9]([a-z0-9-]{1,28}[a-z0-9])?$/;
  
  // Reserved subdomains
  const reserved = [
    'www', 'api', 'admin', 'app', 'mail', 'ftp', 'blog', 
    'help', 'support', 'dev', 'test', 'staging', 'demo',
    'dashboard', 'portal', 'login', 'signup', 'register'
  ];
  
  return subdomainRegex.test(subdomain.toLowerCase()) && 
         !reserved.includes(subdomain.toLowerCase());
}