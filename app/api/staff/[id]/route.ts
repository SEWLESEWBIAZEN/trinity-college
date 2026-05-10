// src/app/api/staff/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { execute } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  fullName:    z.string().min(1).max(150),
  title:       z.string().max(120).optional(),
  position:    z.string().max(150).optional(),
  department:  z.string().max(150).optional(),
  bio:         z.string().optional(),
  email:       z.string().email().optional().or(z.literal("")),
  phone:       z.string().max(30).optional(),
  photoUrl:    z.string().optional().nullable(),
  isPublished: z.boolean(),
  sortOrder:   z.number().default(0),
});

interface Ctx { params: { id: string } }

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = schema.parse(await req.json());
  await execute(
    `UPDATE staff SET full_name=?, title=?, position=?, department=?, bio=?,
       email=?, phone=?, photo_url=?, is_published=?, sort_order=?, updated_at=NOW()
     WHERE id=?`,
    [
      data.fullName, data.title ?? null, data.position ?? null, data.department ?? null,
      data.bio ?? null, data.email || null, data.phone ?? null,
      data.photoUrl ?? null, data.isPublished, data.sortOrder, params.id,
    ]
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await execute("DELETE FROM staff WHERE id = ?", [params.id]);
  return NextResponse.json({ success: true });
}
