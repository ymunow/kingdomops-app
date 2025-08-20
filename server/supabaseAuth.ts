import { createClient } from '@supabase/supabase-js';
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// Using provided credentials with environment variable fallback
const SUPABASE_URL = process.env.SUPABASE_URL || "https://uhrveotjyufguojzpawy.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVocnZlb3RqeXVmZ3VvanpwYXd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NzY2ODksImV4cCI6MjA3MTA1MjY4OX0.pttCCLGODMAMarg6YAZUM6kczMCkB-FLREoAsV8paMk";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

export async function setupSupabaseAuth(app: Express) {
  // Middleware to extract user from Supabase session
  app.use(async (req: any, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('Auth middleware - Processing token:', token.substring(0, 20) + '...');
      
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (user && !error) {
          console.log('Auth middleware - User authenticated:', user.email);
          
          // Ensure user exists in our database and get full user info
          await storage.upsertUser({
            id: user.id,
            email: user.email,
            firstName: user.user_metadata?.first_name,
            lastName: user.user_metadata?.last_name,
            profileImageUrl: user.user_metadata?.avatar_url,
          });
          
          // Get full user info including role and organizationId from database
          const dbUser = await storage.getUser(user.id);
          
          // Store complete user info in request for downstream middleware
          req.user = {
            id: user.id,
            email: user.email,
            firstName: user.user_metadata?.first_name,
            lastName: user.user_metadata?.last_name,
            profileImageUrl: user.user_metadata?.avatar_url,
            role: dbUser?.role,
            organizationId: dbUser?.organizationId,
            claims: {
              sub: user.id,
              email: user.email,
            }
          };
        } else {
          console.log('Auth middleware - Token invalid:', error?.message);
        }
      } catch (error) {
        console.error('Error verifying Supabase token:', error);
      }
    } else {
      console.log('Auth middleware - No auth header found');
    }
    next();
  });

  // Auth routes
  app.post('/api/auth/signin', async (req, res) => {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({
      user: data.user,
      session: data.session,
    });
  });

  app.post('/api/auth/signup', async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
        emailRedirectTo: process.env.NODE_ENV === 'production' 
          ? `https://kingdomops.org/auth?confirmed=true`
          : `https://${process.env.REPLIT_DEV_DOMAIN || req.get('host')}/auth?confirmed=true`
      }
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({
      user: data.user,
      session: data.session,
    });
  });

  app.post('/api/auth/signout', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await supabase.auth.admin.signOut(token);
    }
    res.json({ message: 'Signed out successfully' });
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

export const isAuthenticated: RequestHandler = (req: any, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};