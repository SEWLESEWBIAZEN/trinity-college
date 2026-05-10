// src/app/api/announcements/route.ts
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
  category:    z.enum(["news", "event", "notice", "scholarship"]).default("news"),
  eventDate:   z.string().optional().nullable(),   // "YYYY-MM-DD"
  isPublished: z.boolean().default(false),
  isPinned:    z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publicOnly = searchParams.get("public") === "1";
    const category = searchParams.get("category");
    const pageRaw = Number(searchParams.get("page") ?? 1);
    const limitRaw = Number(searchParams.get("limit") ?? 20);
    const page = Number.isFinite(pageRaw) ? Math.max(1, Math.floor(pageRaw)) : 1;
    const limit = Number.isFinite(limitRaw)
      ? Math.max(1, Math.min(50, Math.floor(limitRaw)))
      : 20;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: unknown[] = [];

    if (publicOnly) conditions.push("a.is_published = 1");
    if (category) {
      conditions.push("a.category = ?");
      values.push(category);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const rows = await query(
      `SELECT a.id, a.title, a.slug, a.excerpt, a.cover_url AS coverUrl,
              a.category, a.event_date AS eventDate,
              a.is_published AS isPublished, a.is_pinned AS isPinned,
              a.published_at AS publishedAt, a.created_at AS createdAt,
              u.name AS authorName
       FROM announcements a
       LEFT JOIN users u ON a.author_id = u.id
       ${where}
       ORDER BY a.is_pinned DESC, a.published_at DESC, a.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      values
    );

    const [{ total }] = await query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM announcements a ${where}`,
      values
    );

    return NextResponse.json({ success: true, data: rows, total, page, limit });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch announcements";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data   = schema.parse(await req.json());
  const slug   = slugify(data.title, { lower: true, strict: true }).slice(0, 280)
               + `-${Date.now()}`;
  const userId = (session.user as { id?: string })?.id ?? null;
  const pubAt  = data.isPublished ? new Date().toISOString() : null;

  const result = await execute(
    `INSERT INTO announcements
       (title, slug, excerpt, body, cover_url, category, event_date,
        is_published, is_pinned, author_id, published_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [
      data.title, slug, data.excerpt ?? null, data.body ?? null,
      data.coverUrl ?? null, data.category, data.eventDate ?? null,
      data.isPublished, data.isPinned, userId, pubAt,
    ]
  );
  return NextResponse.json({ success: true, id: result.insertId }, { status: 201 });
}
