// src/app/api/announcements/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, execute } from "@/lib/db";
import { z } from "zod";
import slugify from "slugify";

const schema = z.object({
  title:       z.string().min(1).max(300),
  excerpt:     z.string().optional(),
  body:        z.string().optional(),
  coverUrl:    z.string().optional().nullable(),
  category:    z.enum(["news", "event", "notice", "scholarship"]),
  eventDate:   z.string().optional().nullable(),
  isPublished: z.boolean(),
  isPinned:    z.boolean(),
});

interface Ctx { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const rows = await query(
    `SELECT a.*, u.name AS authorName
     FROM announcements a LEFT JOIN users u ON a.author_id = u.id
     WHERE a.id = ?`,
    [params.id]
  );
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: rows[0] });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = schema.parse(await req.json());

  // Fetch current row to preserve slug if title unchanged
  const [current] = await query<{ title: string; slug: string; published_at: string | null }>(
    "SELECT title, slug, published_at FROM announcements WHERE id = ?", [params.id]
  );
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const slug  = data.title !== current.title
    ? slugify(data.title, { lower: true, strict: true }).slice(0, 280) + `-${Date.now()}`
    : current.slug;

  const pubAt = data.isPublished
    ? (current.published_at ?? new Date().toISOString())
    : null;

  await execute(
    `UPDATE announcements SET
       title=?, slug=?, excerpt=?, body=?, cover_url=?, category=?,
       event_date=?, is_published=?, is_pinned=?, published_at=?, updated_at=NOW()
     WHERE id=?`,
    [
      data.title, slug, data.excerpt ?? null, data.body ?? null,
      data.coverUrl ?? null, data.category, data.eventDate ?? null,
      data.isPublished, data.isPinned, pubAt, params.id,
    ]
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await execute("DELETE FROM announcements WHERE id = ?", [params.id]);
  return NextResponse.json({ success: true });
}
