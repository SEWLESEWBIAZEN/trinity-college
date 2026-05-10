import fs from "fs/promises";
import { NextResponse } from "next/server";

const ATTACHED_LOGO_PATH ="public\images\logo\photo_2026-05-10_19-01-38.jpg"

export async function GET() {
  try {
    const image = await fs.readFile(ATTACHED_LOGO_PATH);
    return new NextResponse(new Uint8Array(image), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Logo image not found" }, { status: 404 });
  }
}
