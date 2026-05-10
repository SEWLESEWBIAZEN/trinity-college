// src/app/api/programs/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, execute } from "@/lib/db";
import { z } from "zod";
import slugify from "slugify";

const schema = z.object({
  name:        z.string().min(1).max(120),
  description: z.string().optional(),
  sortOrder:   z.number().default(0),
});

export async function GET() {
  const rows = await query(
    "SELECT id, name, slug, description, sort_order AS sortOrder FROM program_categories ORDER BY sort_order"
  );
  return NextResponse.json({ success: true, data: rows });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = schema.parse(await req.json());
  const slug = slugify(data.name, { lower: true, strict: true });
  const result = await execute(
    "INSERT INTO program_categories (name, slug, description, sort_order) VALUES (?,?,?,?)",
    [data.name, slug, data.description ?? null, data.sortOrder]
  );
  return NextResponse.json({ success: true, id: result.insertId }, { status: 201 });
}
