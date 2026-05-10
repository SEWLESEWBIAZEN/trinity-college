// src/lib/upload.ts
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = (Number(process.env.MAX_FILE_SIZE_MB ?? 20)) * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
};

export async function saveUploadedFile(
  file: File,
  subfolder: "images" | "videos" | "documents"
): Promise<{ url: string; mimeType: string; sizeKb: number }> {
  if (file.size > MAX_BYTES)
    throw new Error(`File exceeds ${process.env.MAX_FILE_SIZE_MB ?? 20} MB`);

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) throw new Error(`Unsupported file type: ${file.type}`);

  const dir = path.join(UPLOAD_ROOT, subfolder);
  await fs.mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}.${ext}`;
  const fullPath = path.join(dir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(fullPath, buffer);

  return {
    url: `/uploads/${subfolder}/${filename}`,
    mimeType: file.type,
    sizeKb: Math.round(file.size / 1024),
  };
}

export async function deleteFile(url: string): Promise<void> {
  const rel = url.replace(/^\//, "");
  const abs = path.join(process.cwd(), "public", rel);
  await fs.unlink(abs).catch(() => {/* ignore if missing */});
}
