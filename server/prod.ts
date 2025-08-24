import express from "express";
import path from "node:path";
import fs from "node:fs";
import multer from "multer";

const app = express();
const resolve = (p: string) => path.resolve(process.cwd(), p);

app.use((req, _res, next) => { console.log("➡️", req.method, req.url); next(); });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/cdn", express.static(resolve("public/cdn")));

// HEALTH
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// UPLOADS
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });

// Profile avatar: square (client already crops; server normalizes)
app.post("/api/profile/photo", upload.single("file"), async (req, res, next) => {
  try {
    console.log("🎯 AVATAR UPLOAD");
    if (!req.file) return res.status(400).json({ error: "No file" });
    const userId = String(req.body.userId || "anonymous");
    const key = `avatars/${userId}.webp`;
    const out = resolve(`public/cdn/${key}`);
    await fs.promises.mkdir(path.dirname(out), { recursive: true });
    await fs.promises.writeFile(out, req.file.buffer);
    return res.json({ ok: true, url: `/cdn/${key}?v=${Date.now()}` });
  } catch (e) { next(e); }
});

// Cover image: wide rectangle
app.post("/api/profile/cover", upload.single("file"), async (req, res, next) => {
  try {
    console.log("🎯 COVER UPLOAD");
    if (!req.file) return res.status(400).json({ error: "No file" });
    const userId = String(req.body.userId || "anonymous");
    const key = `covers/${userId}.webp`;
    const out = resolve(`public/cdn/${key}`);
    await fs.promises.mkdir(path.dirname(out), { recursive: true });
    await fs.promises.writeFile(out, req.file.buffer);
    return res.json({ ok: true, url: `/cdn/${key}?v=${Date.now()}` });
  } catch (e) { next(e); }
});

// Serve built SPA so everything is same-origin
const dist = resolve("dist");
app.use(express.static(dist));
app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));

const port = Number(process.env.PORT || 4000);
app.listen(port, "0.0.0.0", () => console.log(`✅ Server on :${port}`));