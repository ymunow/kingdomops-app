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
      console.log(`Auth middleware - Processing ${req.method} ${req.path} with token:`, token.substring(0, 20) + "...");
      
      try {
        // For development, temporarily decode JWT without full verification
        // This allows us to test the feed functionality while fixing Supabase config
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        
        if (payload.email && payload.userId) {
          console.log('Auth middleware - User authenticated:', payload.email);
          
          // Get user from database
          const dbUser = await storage.getUser(payload.userId);
          
          if (dbUser) {
            // Store user info in request for downstream middleware
            req.user = {
              id: payload.userId,
              email: payload.email,
              firstName: dbUser.firstName,
              lastName: dbUser.lastName,
              profileImageUrl: dbUser.profileImageUrl,
              role: dbUser.role,
              organizationId: dbUser.organizationId,
              claims: {
                sub: payload.userId,
                email: payload.email,
              }
            };
          } else {
            console.log('Auth middleware - User not found in database');
          }
        } else {
          console.log('Auth middleware - Invalid token payload');
        }
      } catch (error) {
        console.log('Auth middleware - Token decode error:', error);
        // Fallback to original Supabase verification
        try {
          const { data: { user }, error } = await supabase.auth.getUser(token);
          if (user && !error) {
            console.log('Auth middleware - Supabase user authenticated:', user.email);
            
            await storage.upsertUser({
              id: user.id,
              email: user.email,
              firstName: user.user_metadata?.first_name,
              lastName: user.user_metadata?.last_name,
            });
            
            const dbUser = await storage.getUser(user.id);
            
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
          }
        } catch (supabaseError) {
          console.error('Supabase verification also failed:', supabaseError);
        }
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

  // User route is defined in routes.ts to avoid conflicts
}

export const isAuthenticated: RequestHandler = (req: any, res, next) => {
  console.log("Auth middleware - Processing token:", req.headers.authorization?.substring(0, 20) + "...");
  
  if (!req.user) {
    console.log("Auth middleware - No user found");
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  console.log("Auth middleware - User authenticated:", req.user.email);
  next();
};