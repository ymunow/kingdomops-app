import express from "express";
import { createServer as createViteServer } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { registerRoutes } from "./routes";
import compression from "compression";
import helmet from "helmet";
import session from "express-session";
import MemoryStore from "memorystore";

const app = express();
const resolve = (p: string) => path.resolve(process.cwd(), p);

// 🔎 Global request logger
app.use((req, res, next) => {
  console.log("➡️", req.method, req.url);
  next();
});

// Security and middleware setup (same as main server)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Session middleware
const MemStore = MemoryStore(session);
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-dev-secret',
  resave: true,
  saveUninitialized: true,
  name: 'kingdomops.sid',
  store: new MemStore({ checkPeriod: 86400000 }),
  cookie: {
    secure: false,
    httpOnly: false,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  },
  rolling: true,
  unset: 'keep'
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

// Register all existing API routes BEFORE Vite
const server = await registerRoutes(app);

// Create Vite server with configFile: false to bypass protected config
const vite = await createViteServer({
  configFile: false,                // ⬅️ bypasses protected vite.config & Replit plugin
  root: resolve('client'),
  appType: 'spa',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "client", "src"),
      "@shared": path.resolve(process.cwd(), "shared"),
      "@assets": path.resolve(process.cwd(), "attached_assets"),
    },
  },
  server: { 
    middlewareMode: true, 
    hmr: { 
      overlay: false  // ⬅️ no runtime error modal
    }
  }
});

// Mount Vite middleware AFTER API routes
app.use(vite.middlewares);

// SPA fallback for non-API routes
app.get("*", async (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  
  try {
    const template = fs.readFileSync(resolve("client/index.html"), "utf-8");
    const html = await vite.transformIndexHtml(req.originalUrl, template);
    res.setHeader("Content-Type", "text/html");
    res.status(200).end(html);
  } catch (e: any) {
    vite.ssrFixStacktrace?.(e);
    next(e);
  }
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("❌ Dev Override Error:", err);
  if (!res.headersSent) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`🚀 DEV OVERRIDE SERVER on http://localhost:${port}`);
  console.log(`🔥 Vite overlay DISABLED - API requests should reach Express!`);
});