import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { ROLE_PERMISSIONS, ROLE_HIERARCHY, type OrganizationRole } from "@shared/schema";

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        claims?: {
          sub: string;
          email?: string;
        };
        organizationId?: string;
        role?: OrganizationRole;
        id?: string;
        email?: string;
      };
    }
  }
}

/**
 * Middleware to check if user has required permission
 */
export function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.claims?.sub) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }

      const userId = req.user.claims.sub;
      const hasPermission = await storage.hasPermission(userId, permission);

      if (!hasPermission) {
        res.status(403).json({ 
          message: "Insufficient permissions",
          required: permission
        });
        return;
      }

      next();
    } catch (error) {
      console.error("Permission check failed:", error);
      res.status(500).json({ message: "Permission check failed" });
    }
  };
}

/**
 * Middleware to check if user has required role or higher
 */
export function requireRole(minRole: OrganizationRole) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.claims?.sub) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      const userRoleLevel = ROLE_HIERARCHY[user.role as keyof typeof ROLE_HIERARCHY] || 0;
      const requiredRoleLevel = ROLE_HIERARCHY[minRole];

      if (userRoleLevel < requiredRoleLevel) {
        res.status(403).json({ 
          message: "Insufficient role permissions",
          userRole: user.role,
          requiredRole: minRole
        });
        return;
      }

      // Add user info to request for downstream handlers
      req.user = {
        ...req.user,
        organizationId: user.organizationId,
        role: user.role as OrganizationRole
      };

      next();
    } catch (error) {
      console.error("Role check failed:", error);
      res.status(500).json({ message: "Role check failed" });
    }
  };
}

/**
 * Middleware to check if user can access specific organization
 */
export function requireOrganizationAccess(organizationIdParam?: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.claims?.sub) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      // Get organization ID from params, body, or query
      const organizationId = organizationIdParam || 
                           req.params.organizationId || 
                           req.body.organizationId || 
                           req.query.organizationId as string;

      if (!organizationId) {
        res.status(400).json({ message: "Organization ID required" });
        return;
      }

      const canAccess = await storage.canAccessOrganization(userId, organizationId);

      if (!canAccess) {
        res.status(403).json({ 
          message: "Access denied to organization",
          organizationId 
        });
        return;
      }

      // Add organization context to request
      req.user = {
        ...req.user,
        organizationId: user.organizationId,
        role: user.role as OrganizationRole
      };

      next();
    } catch (error) {
      console.error("Organization access check failed:", error);
      res.status(500).json({ message: "Organization access check failed" });
    }
  };
}

/**
 * Middleware to ensure user belongs to their own organization for data access
 */
export function requireOwnOrganization() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.claims?.sub) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user || !user.organizationId) {
        res.status(401).json({ message: "User organization not found" });
        return;
      }

      // Add organization context to request
      req.user = {
        ...req.user,
        organizationId: user.organizationId,
        role: user.role as OrganizationRole
      };

      next();
    } catch (error) {
      console.error("Organization context check failed:", error);
      res.status(500).json({ message: "Organization context check failed" });
    }
  };
}

/**
 * Middleware for super admin only access
 */
export const requireSuperAdmin = requireRole("SUPER_ADMIN");

/**
 * Middleware for organization owner or higher
 */
export const requireOrgOwner = requireRole("ORG_OWNER");

/**
 * Middleware for organization admin or higher
 */
export const requireOrgAdmin = requireRole("ORG_ADMIN");

/**
 * Middleware for organization leader or higher
 */
export const requireOrgLeader = requireRole("ORG_LEADER");

/**
 * Helper function to check if user can manage another user
 */
export async function canManageUser(managerId: string, targetUserId: string): Promise<boolean> {
  try {
    const manager = await storage.getUser(managerId);
    const target = await storage.getUser(targetUserId);

    if (!manager || !target) return false;

    // Super admin can manage anyone
    if (manager.role === "SUPER_ADMIN") return true;

    // Users can only manage users in their own organization
    if (manager.organizationId !== target.organizationId) return false;

    // Check role hierarchy
    const managerLevel = ROLE_HIERARCHY[manager.role as keyof typeof ROLE_HIERARCHY] || 0;
    const targetLevel = ROLE_HIERARCHY[target.role as keyof typeof ROLE_HIERARCHY] || 0;

    // Manager must have higher role level than target
    return managerLevel > targetLevel;
  } catch (error) {
    console.error("Error checking user management permissions:", error);
    return false;
  }
}

/**
 * Helper function to get user's organization context
 */
export async function getUserOrganizationContext(userId: string) {
  try {
    const user = await storage.getUser(userId);
    if (!user) return null;

    const organization = user.organizationId 
      ? await storage.getOrganization(user.organizationId)
      : null;

    return {
      user,
      organization,
      role: user.role as OrganizationRole,
      permissions: ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || []
    };
  } catch (error) {
    console.error("Error getting user organization context:", error);
    return null;
  }
}

/**
 * Middleware to add user context to request
 */
export function addUserContext() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.claims?.sub) {
        const context = await getUserOrganizationContext(req.user.claims.sub);
        if (context) {
          req.user = {
            ...req.user,
            organizationId: context.user.organizationId,
            role: context.role
          };
        }
      }
      next();
    } catch (error) {
      console.error("Error adding user context:", error);
      next(); // Continue even if context fails
    }
  };
}

/**
 * Permission constants for easy reference
 */
export const PERMISSIONS = {
  // Organization management
  ORG_MANAGE: "org_manage",
  ORG_VIEW: "org_view",
  
  // User management
  USERS_MANAGE: "users_manage",
  USERS_VIEW: "users_view",
  
  // Results and assessments
  RESULTS_MANAGE: "results_manage",
  RESULTS_VIEW: "results_view",
  
  // Placements
  PLACEMENTS_MANAGE: "placements_manage",
  PLACEMENTS_VIEW: "placements_view",
  
  // Data export
  EXPORT_DATA: "export_data",
  
  // Assessment taking
  ASSESSMENT_TAKE: "assessment_take",
  
  // Global permissions
  ALL: "all"
} as const;