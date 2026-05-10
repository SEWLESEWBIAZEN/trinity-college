// src/app/api/media/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, execute } from "@/lib/db";
import { saveUploadedFile } from "@/lib/upload";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // image | video | document
    const albumId = searchParams.get("albumId");
    const pageRaw = Number(searchParams.get("page") ?? 1);
    const limitRaw = Number(searchParams.get("limit") ?? 30);
    const page = Number.isFinite(pageRaw) ? Math.max(1, Math.floor(pageRaw)) : 1;
    const limit = Number.isFinite(limitRaw)
      ? Math.max(1, Math.min(100, Math.floor(limitRaw)))
      : 30;
    const offset = (page - 1) * limit;

    const conditions: string[] = ["is_public = 1"];
    const values: unknown[] = [];
    if (type) {
      conditions.push("type = ?");
      values.push(type);
    }
    if (albumId) {
      conditions.push("album_id = ?");
      values.push(albumId);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const rows = await query(
      `SELECT m.*, a.title AS albumTitle
       FROM media m LEFT JOIN media_albums a ON m.album_id = a.id
       ${where} ORDER BY m.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      values
    );
    const [{ total }] = await query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM media ${where}`,
      values
    );
    return NextResponse.json({ success: true, data: rows, total, page, limit });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch media";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const subfolder =
    file.type.startsWith("image/") ? "images" :
    file.type.startsWith("video/") ? "videos" : "documents";

  const { url, mimeType, sizeKb } = await saveUploadedFile(file, subfolder);

  const type =
    subfolder === "images" ? "image" :
    subfolder === "videos" ? "video" : "document";

  const title   = (formData.get("title") as string) || file.name;
  const altText = (formData.get("altText") as string) || null;
  const albumId = formData.get("albumId") ? Number(formData.get("albumId")) : null;
  const userId  = (session.user as { id?: string })?.id ?? null;

  const result = await execute(
    `INSERT INTO media (title, type, url, mime_type, file_size_kb, alt_text, album_id, uploaded_by)
     VALUES (?,?,?,?,?,?,?,?)`,
    [title, type, url, mimeType, sizeKb, altText, albumId, userId]
  );
  return NextResponse.json({ success: true, id: result.insertId, url }, { status: 201 });
}
