// src/app/api/media/albums/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, execute } from "@/lib/db";
import { z } from "zod";
import slugify from "slugify";

const schema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().optional(),
  coverId:     z.number().optional().nullable(),
  sortOrder:   z.number().default(0),
});

export async function GET() {
  const rows = await query(
    `SELECT a.id, a.title, a.slug, a.description, a.sort_order AS sortOrder,
            m.url AS coverUrl,
            (SELECT COUNT(*) FROM media WHERE album_id = a.id) AS mediaCount
     FROM media_albums a
     LEFT JOIN media m ON a.cover_id = m.id
     ORDER BY a.sort_order`
  );
  return NextResponse.json({ success: true, data: rows });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = schema.parse(await req.json());
  const slug = slugify(data.title, { lower: true, strict: true });

  const result = await execute(
    `INSERT INTO media_albums (title, slug, description, cover_id, sort_order)
     VALUES (?,?,?,?,?)`,
    [data.title, slug, data.description ?? null, data.coverId ?? null, data.sortOrder]
  );
  return NextResponse.json({ success: true, id: result.insertId }, { status: 201 });
}
