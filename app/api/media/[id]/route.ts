// src/app/api/media/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, execute } from "@/lib/db";
import { deleteFile } from "@/lib/upload";

interface Ctx { params: { id: string } }

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await query<{ url: string }>(
    "SELECT url FROM media WHERE id = ?", [params.id]
  );
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteFile(rows[0].url);
  await execute("DELETE FROM media WHERE id = ?", [params.id]);
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, altText, albumId, isPublic } = await req.json();
  await execute(
    `UPDATE media SET title=?, alt_text=?, album_id=?, is_public=? WHERE id=?`,
    [title ?? null, altText ?? null, albumId ?? null, isPublic ?? true, params.id]
  );
  return NextResponse.json({ success: true });
}
