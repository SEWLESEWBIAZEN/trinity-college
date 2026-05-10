// src/app/api/services/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { execute } from "@/lib/db";
import { z } from "zod";
import slugify from "slugify";

const schema = z.object({
  name:        z.string().min(1).max(200),
  description: z.string().optional(),
  icon:        z.string().max(80).optional(),
  imageUrl:    z.string().optional().nullable(),
  sortOrder:   z.number().default(0),
  isActive:    z.boolean(),
});

interface Ctx { params: { id: string } }

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = schema.parse(await req.json());
  const slug = slugify(data.name, { lower: true, strict: true });

  await execute(
    `UPDATE student_services
     SET name=?, slug=?, description=?, icon=?, image_url=?, sort_order=?, is_active=?, updated_at=NOW()
     WHERE id=?`,
    [data.name, slug, data.description ?? null, data.icon ?? null,
     data.imageUrl ?? null, data.sortOrder, data.isActive, params.id]
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await execute("DELETE FROM student_services WHERE id = ?", [params.id]);
  return NextResponse.json({ success: true });
}
