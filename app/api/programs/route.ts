// src/app/api/programs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, execute } from "@/lib/db";
import { z } from "zod";
import slugify from "slugify";

const schema = z.object({
  categoryId:     z.number().optional().nullable(),
  name:           z.string().min(1).max(200),
  degreeType:     z.enum(["certificate","diploma","bachelor","master","phd"]),
  durationYears:  z.number().optional().nullable(),
  description:    z.string().optional(),
  objectives:     z.string().optional(),
  careerOutcomes: z.string().optional(),
  admissionReq:   z.string().optional(),
  thumbnailUrl:   z.string().optional().nullable(),
  isPublished:    z.boolean().default(false),
  sortOrder:      z.number().default(0),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pageRaw = Number(searchParams.get("page") ?? 1);
    const limitRaw = Number(searchParams.get("limit") ?? 20);
    const page = Number.isFinite(pageRaw) ? Math.max(1, Math.floor(pageRaw)) : 1;
    const limit = Number.isFinite(limitRaw)
      ? Math.max(1, Math.min(50, Math.floor(limitRaw)))
      : 20;
    const offset = (page - 1) * limit;

    const rows = await query(
      `SELECT p.*, pc.name AS categoryName
       FROM programs p
       LEFT JOIN program_categories pc ON p.category_id = pc.id
       ORDER BY p.sort_order, p.name
       LIMIT ${limit} OFFSET ${offset}`
    );
    const [{ total }] = await query<{ total: number }>(
      "SELECT COUNT(*) AS total FROM programs"
    );
    return NextResponse.json({ success: true, data: rows, total, page, limit });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch programs";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = schema.parse(body);
  const slug = slugify(data.name, { lower: true, strict: true });

  const result = await execute(
    `INSERT INTO programs
       (category_id, name, slug, degree_type, duration_years, description,
        objectives, career_outcomes, admission_req, thumbnail_url, is_published, sort_order)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      data.categoryId ?? null, data.name, slug, data.degreeType,
      data.durationYears ?? null, data.description ?? null,
      data.objectives ?? null, data.careerOutcomes ?? null,
      data.admissionReq ?? null, data.thumbnailUrl ?? null,
      data.isPublished, data.sortOrder,
    ]
  );
  return NextResponse.json({ success: true, id: result.insertId }, { status: 201 });
}
