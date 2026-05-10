// src/app/api/staff/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, execute } from "@/lib/db";
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
  isPublished: z.boolean().default(true),
  sortOrder:   z.number().default(0),
});

export async function GET() {
  const rows = await query(
    `SELECT id, full_name AS fullName, title, position, department,
            bio, email, phone, photo_url AS photoUrl, is_published AS isPublished,
            sort_order AS sortOrder, created_at AS createdAt
     FROM staff ORDER BY sort_order, full_name`
  );
  return NextResponse.json({ success: true, data: rows });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = schema.parse(await req.json());
  const result = await execute(
    `INSERT INTO staff
       (full_name, title, position, department, bio, email, phone,
        photo_url, is_published, sort_order)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
      data.fullName, data.title ?? null, data.position ?? null, data.department ?? null,
      data.bio ?? null, data.email || null, data.phone ?? null,
      data.photoUrl ?? null, data.isPublished, data.sortOrder,
    ]
  );
  return NextResponse.json({ success: true, id: result.insertId }, { status: 201 });
}
