import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

const MAX_BYTES = 10 * 1024 * 1024;
const SAFE_NAME = /[^a-zA-Z0-9._-]/g;

router.post("/upload", requireAuth, async (req: AuthRequest, res) => {
  try {
    const folder = String(req.body?.folder || "documents").replace(/[^\w/-]/g, "");
    const originalName = String(req.body?.filename || "file.bin");
    const mimeType = String(req.body?.mimeType || "application/octet-stream");
    const base64 = String(req.body?.contentBase64 || "");

    if (!base64) return res.status(400).json({ error: "contentBase64 is required" });

    const fileBuffer = Buffer.from(base64, "base64");
    if (!fileBuffer.length || Number.isNaN(fileBuffer.length)) {
      return res.status(400).json({ error: "Invalid file content" });
    }
    if (fileBuffer.length > MAX_BYTES) {
      return res.status(400).json({ error: "File size exceeds 10MB" });
    }

    const safeName = originalName.replace(SAFE_NAME, "_");
    const targetDir = path.join(process.cwd(), "uploads", req.userId!, folder);
    await fs.mkdir(targetDir, { recursive: true });
    const fileName = `${Date.now()}_${safeName}`;
    const fullPath = path.join(targetDir, fileName);

    await fs.writeFile(fullPath, fileBuffer);

    const relativePath = path
      .join("uploads", req.userId!, folder, fileName)
      .replace(/\\/g, "/");
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`;

    res.json({
      filePath: relativePath,
      mimeType,
      publicUrl: `${backendUrl}/${relativePath}`,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
