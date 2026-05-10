// src/app/api/messages/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await query(
    `SELECT id, name, email, phone, subject, message,
            is_read AS isRead, created_at AS createdAt
     FROM contact_messages ORDER BY created_at DESC`
  );
  return NextResponse.json({ success: true, data: rows });
}
