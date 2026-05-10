// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { execute } from "@/lib/db";

const schema = z.object({
  name:    z.string().min(1).max(150),
  email:   z.string().email().optional().or(z.literal("")),
  phone:   z.string().max(30).optional(),
  subject: z.string().max(300).optional(),
  message: z.string().min(1).max(5000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    await execute(
      `INSERT INTO contact_messages (name, email, phone, subject, message)
       VALUES (?, ?, ?, ?, ?)`,
      [data.name, data.email || null, data.phone || null, data.subject || null, data.message]
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.flatten() }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
