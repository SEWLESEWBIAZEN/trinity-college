// src/app/api/admissions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, execute } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  groupName:   z.string().min(1),
  title:       z.string().min(1).max(300),
  description: z.string().optional(),
  sortOrder:   z.number().default(0),
  isActive:    z.boolean().default(true),
});

export async function GET() {
  const rows = await query(
    `SELECT id, group_name AS groupName, title, description,
            sort_order AS sortOrder, is_active AS isActive
     FROM admission_requirements ORDER BY group_name, sort_order`
  );
  return NextResponse.json({ success: true, data: rows });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = schema.parse(await req.json());
  const result = await execute(
    `INSERT INTO admission_requirements (group_name, title, description, sort_order, is_active)
     VALUES (?,?,?,?,?)`,
    [data.groupName, data.title, data.description ?? null, data.sortOrder, data.isActive]
  );
  return NextResponse.json({ success: true, id: result.insertId }, { status: 201 });
}
