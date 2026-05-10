// src/app/api/programs/[id]/route.ts
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
  isPublished:    z.boolean(),
  sortOrder:      z.number().default(0),
});

interface Ctx { params: { id: string } }

function normalizeProgramPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") return payload;
  const input = payload as Record<string, unknown>;

  const normalizeNullableString = (value: unknown) => {
    if (value == null) return "";
    return String(value);
  };

  const normalizeBoolean = (value: unknown) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") return value === "1" || value.toLowerCase() === "true";
    return false;
  };

  return {
    ...input,
    description: normalizeNullableString(input.description),
    objectives: normalizeNullableString(input.objectives),
    careerOutcomes: normalizeNullableString(input.careerOutcomes),
    admissionReq: normalizeNullableString(input.admissionReq),
    isPublished: normalizeBoolean(input.isPublished),
  };
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const rows = await query(
    `SELECT p.*, pc.name AS categoryName
     FROM programs p LEFT JOIN program_categories pc ON p.category_id = pc.id
     WHERE p.id = ?`,
    [params.id]
  );
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: rows[0] });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = schema.parse(normalizeProgramPayload(body));
  const slug = slugify(data.name, { lower: true, strict: true });

  await execute(
    `UPDATE programs SET
       category_id=?, name=?, slug=?, degree_type=?, duration_years=?,
       description=?, objectives=?, career_outcomes=?, admission_req=?,
       thumbnail_url=?, is_published=?, sort_order=?, updated_at=NOW()
     WHERE id=?`,
    [
      data.categoryId ?? null, data.name, slug, data.degreeType,
      data.durationYears ?? null, data.description ?? null,
      data.objectives ?? null, data.careerOutcomes ?? null,
      data.admissionReq ?? null, data.thumbnailUrl ?? null,
      data.isPublished, data.sortOrder, params.id,
    ]
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await execute("DELETE FROM programs WHERE id = ?", [params.id]);
  return NextResponse.json({ success: true });
}
