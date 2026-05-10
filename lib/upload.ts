// // src/lib/upload.ts
// import path from "path";
// import fs from "fs/promises";
// import { randomUUID } from "crypto";

// const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");
// const MAX_BYTES = (Number(process.env.MAX_FILE_SIZE_MB ?? 20)) * 1024 * 1024;

// const ALLOWED_TYPES: Record<string, string> = {
//   "image/jpeg": "jpg",
//   "image/png": "png",
//   "image/webp": "webp",
//   "image/gif": "gif",
//   "video/mp4": "mp4",
//   "video/webm": "webm",
//   "application/pdf": "pdf",
//   "application/msword": "doc",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
//     "docx",
// };

// export async function saveUploadedFile(
//   file: File,
//   subfolder: "images" | "videos" | "documents"
// ): Promise<{ url: string; mimeType: string; sizeKb: number }> {
//   if (file.size > MAX_BYTES)
//     throw new Error(`File exceeds ${process.env.MAX_FILE_SIZE_MB ?? 20} MB`);

//   const ext = ALLOWED_TYPES[file.type];
//   if (!ext) throw new Error(`Unsupported file type: ${file.type}`);

//   const dir = path.join(UPLOAD_ROOT, subfolder);
//   await fs.mkdir(dir, { recursive: true });

//   const filename = `${randomUUID()}.${ext}`;
//   const fullPath = path.join(dir, filename);

//   const buffer = Buffer.from(await file.arrayBuffer());
//   await fs.writeFile(fullPath, buffer);

//   return {
//     url: `/uploads/${subfolder}/${filename}`,
//     mimeType: file.type,
//     sizeKb: Math.round(file.size / 1024),
//   };
// }

// export async function deleteFile(url: string): Promise<void> {
//   const rel = url.replace(/^\//, "");
//   const abs = path.join(process.cwd(), "public", rel);
//   await fs.unlink(abs).catch(() => {/* ignore if missing */});
// }


// src/lib/upload.ts
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import * as ftp from "basic-ftp";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = Number(process.env.MAX_FILE_SIZE_MB ?? 20) * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

const isLocal = process.env.NODE_ENV !== "production";

// ─── FTP helpers ────────────────────────────────────────────────────────────

async function createFTPClient(): Promise<ftp.Client> {
  const client = new ftp.Client();
  await client.access({
    host: process.env.FTP_HOST!,
    user: process.env.FTP_USER!,
    password: process.env.FTP_PASSWORD!,
    port: Number(process.env.FTP_PORT ?? 21),
    secure: false,
  });
  return client;
}

async function ftpUpload(
  buffer: Buffer,
  remotePath: string
): Promise<void> {
  const client = await createFTPClient();
  try {
    const remoteDir = remotePath.substring(0, remotePath.lastIndexOf("/"));
    await client.ensureDir(remoteDir);
    const { Readable } = await import("stream");
    await client.uploadFrom(Readable.from(buffer), remotePath);
  } finally {
    client.close();
  }
}

async function ftpDelete(remotePath: string): Promise<void> {
  const client = await createFTPClient();
  try {
    await client.remove(remotePath).catch(() => {/* ignore if missing */});
  } finally {
    client.close();
  }
}

// ─── FTP path helpers ────────────────────────────────────────────────────────

const FTP_UPLOAD_ROOT = process.env.FTP_UPLOAD_DIR ?? "/httpdocs/uploads";
const FTP_BASE_URL = process.env.FTP_BASE_URL ?? process.env.NEXTAUTH_URL ?? "";

// Converts a remote FTP path to a public URL
// e.g. /httpdocs/uploads/images/abc.jpg → https://yourdomain.com/uploads/images/abc.jpg
function ftpPathToUrl(remotePath: string): string {
  const relative = remotePath.replace(
    FTP_UPLOAD_ROOT,
    "/uploads"
  );
  return `${FTP_BASE_URL}${relative}`;
}

// Converts a public URL back to an FTP path for deletion
function urlToFtpPath(url: string): string {
  const urlObj = new URL(url, FTP_BASE_URL);
  return path.posix.join(
    FTP_UPLOAD_ROOT,
    urlObj.pathname.replace(/^\/uploads/, "")
  );
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function saveUploadedFile(
  file: File,
  subfolder: "images" | "videos" | "documents"
): Promise<{ url: string; mimeType: string; sizeKb: number }> {
  if (file.size > MAX_BYTES)
    throw new Error(`File exceeds ${process.env.MAX_FILE_SIZE_MB ?? 20} MB`);

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) throw new Error(`Unsupported file type: ${file.type}`);

  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  let url: string;

  if (isLocal) {
    // ── Local: write to public/uploads ──────────────────────────────────────
    const dir = path.join(UPLOAD_ROOT, subfolder);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, filename), buffer);
    url = `/uploads/${subfolder}/${filename}`;
  } else {
    // ── Production: upload via FTP ───────────────────────────────────────────
    const remotePath = path.posix.join(FTP_UPLOAD_ROOT, subfolder, filename);
    await ftpUpload(buffer, remotePath);
    url = ftpPathToUrl(remotePath);
  }

  return {
    url,
    mimeType: file.type,
    sizeKb: Math.round(file.size / 1024),
  };
}

export async function deleteFile(url: string): Promise<void> {
  if (isLocal) {
    // ── Local: delete from public/uploads ───────────────────────────────────
    const rel = url.replace(/^\//, "");
    const abs = path.join(process.cwd(), "public", rel);
    await fs.unlink(abs).catch(() => {/* ignore if missing */});
  } else {
    // ── Production: delete via FTP ───────────────────────────────────────────
    const remotePath = urlToFtpPath(url);
    await ftpDelete(remotePath);
  }
}