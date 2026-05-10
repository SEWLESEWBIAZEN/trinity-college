// src/app/api/content/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, execute } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const section = searchParams.get("section");

  const rows = section
    ? await query("SELECT section, `key`, value FROM site_content WHERE section = ?", [section])
    : await query("SELECT section, `key`, value FROM site_content ORDER BY section, `key`");

  return NextResponse.json({ success: true, data: rows });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: { section: string; key: string; value: string }[] = await req.json();
  const userId = (session.user as { id?: string })?.id ?? null;

  for (const item of body) {
    await execute(
      `INSERT INTO site_content (section, \`key\`, value, updated_by)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE value = VALUES(value), updated_by = VALUES(updated_by)`,
      [item.section, item.key, item.value, userId]
    );
  }
  return NextResponse.json({ success: true });
}
