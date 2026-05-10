// src/app/api/admissions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { execute } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  groupName:   z.string().min(1),
  title:       z.string().min(1).max(300),
  description: z.string().optional(),
  sortOrder:   z.number().default(0),
  isActive:    z.boolean(),
});

interface Ctx { params: { id: string } }

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = schema.parse(await req.json());
  await execute(
    `UPDATE admission_requirements
     SET group_name=?, title=?, description=?, sort_order=?, is_active=?
     WHERE id=?`,
    [data.groupName, data.title, data.description ?? null, data.sortOrder, data.isActive, params.id]
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await execute("DELETE FROM admission_requirements WHERE id = ?", [params.id]);
  return NextResponse.json({ success: true });
}
