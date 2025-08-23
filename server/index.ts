import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import helmet from "helmet";
import session from "express-session";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// Security middleware with development-friendly CSP
const isDevelopment = process.env.NODE_ENV !== "production";

app.use(helmet({
  contentSecurityPolicy: isDevelopment ? false : {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "https://replit.com"],
      connectSrc: ["'self'", "wss:", "ws:"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
}));

// Body parsing with security limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Session middleware for View As functionality - use memory store for development
import MemoryStore from "memorystore";
const MemStore = MemoryStore(session);

app.use(session({
  secret: process.env.SESSION_SECRET || 'default-dev-secret-change-in-production',
  resave: true, // Changed to true to force session save
  saveUninitialized: true, // Create sessions for all users
  name: 'kingdomops.sid', // Use unique session name
  store: new MemStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  cookie: {
    secure: false, // Set to false for development
    httpOnly: false, // Allow client-side access for session debugging
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' // Better compatibility
  },
  rolling: true, // Refresh session on each request
  unset: 'keep' // Keep session data when unsetting values
}));

// Cache control for API routes
app.use('/api', (req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  next();
});

// --- request/response logger for API routes ---
app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        try {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        } catch {
          /* ignore stringify errors */
        }
      }

      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Skip database seeding since we're using in-memory storage
  console.log("Using in-memory storage - skipping database seeding");

  // Check environment more explicitly
  const isProduction = process.env.NODE_ENV === "production";
  
  // Static file + SPA fallback for production
  if (isProduction) {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const distPath = path.join(__dirname, "public");

    app.use(express.static(distPath, { index: false }));

    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      res.setHeader("Cache-Control", "no-cache");
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    // Dev mode: Vite middleware
    await setupVite(app, server);
  }

  // Global error handler (must be last)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    // Only send response if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
    
    // Don't re-throw the error to prevent further error propagation
    console.error('Express error:', err.message);
  });

  // Port setup
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`✅ serving on port ${port}`);
    }
  );
})();
