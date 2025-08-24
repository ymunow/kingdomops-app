import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { registerRoutes } from "./routes";

const app = express();
const resolve = (p: string) => path.resolve(process.cwd(), p);

// 🔎 Global request logger - proves what hits Express
app.use((req, res, next) => { 
  console.log("➡️", req.method, req.url); 
  next(); 
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  console.log("🏥 HEALTH CHECK HIT");
  res.json({ ok: true });
});

// Serve static avatars
app.use("/cdn", express.static(resolve("public/cdn")));

// 🔐 CRITICAL: Upload route matching exact client path
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });
app.post("/api/objects/upload", upload.single("file"), async (req, res, next) => {
  try {
    console.log("🎯 UPLOAD DETECTED - REPLIT BYPASS SUCCESS!");
    
    if (!req.file) {
      console.log("❌ No file in request");
      return res.status(400).json({ error: "No file" });
    }

    const userId = String(req.body.userId || "anonymous");
    const key = `avatars/${userId}.webp`;
    const out = resolve(`public/cdn/${key}`);
    
    await fs.promises.mkdir(path.dirname(out), { recursive: true });
    await fs.promises.writeFile(out, req.file.buffer);

    const url = `/cdn/${key}?v=${Date.now()}`;
    console.log("✅ Avatar saved:", url);
    
    return res.json({ ok: true, url });
  } catch (e) { 
    console.error("❌ Upload error:", e);
    next(e); 
  }
});

// Register existing API routes (auth, etc.)
registerRoutes(app).then(server => {
  // CRITICAL: Use process.env.PORT for Replit, bind to 0.0.0.0
  const port = Number(process.env.PORT || 4000);
  app.listen(port, "0.0.0.0", () => {
    console.log(`🚀 REPLIT DEV OVERRIDE on port ${port}`);
    console.log(`🎯 Ready for /api/objects/upload requests!`);
  });
}).catch(error => {
  console.error('Failed to register routes:', error);
  process.exit(1);
});

