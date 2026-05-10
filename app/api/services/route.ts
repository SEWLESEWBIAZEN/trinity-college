// src/app/api/services/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, execute } from "@/lib/db";
import { z } from "zod";
import slugify from "slugify";

const schema = z.object({
  name:        z.string().min(1).max(200),
  description: z.string().optional(),
  icon:        z.string().max(80).optional(),
  imageUrl:    z.string().optional().nullable(),
  sortOrder:   z.number().default(0),
  isActive:    z.boolean().default(true),
});

export async function GET() {
  const rows = await query(
    `SELECT id, name, slug, description, icon,
            image_url AS imageUrl, sort_order AS sortOrder, is_active AS isActive
     FROM student_services ORDER BY sort_order`
  );
  return NextResponse.json({ success: true, data: rows });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = schema.parse(await req.json());
  const slug = slugify(data.name, { lower: true, strict: true });

  const result = await execute(
    `INSERT INTO student_services (name, slug, description, icon, image_url, sort_order, is_active)
     VALUES (?,?,?,?,?,?,?)`,
    [data.name, slug, data.description ?? null, data.icon ?? null,
     data.imageUrl ?? null, data.sortOrder, data.isActive]
  );
  return NextResponse.json({ success: true, id: result.insertId }, { status: 201 });
}
