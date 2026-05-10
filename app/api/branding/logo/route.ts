import fs from "fs/promises";
import { NextResponse } from "next/server";

const ATTACHED_LOGO_PATH =
  "C:\\Users\\sewlesewb\\.cursor\\projects\\d-Personal-projects-trinity-lutheran-college-trinity-college\\assets\\c__Users_sewlesewb_AppData_Roaming_Cursor_User_workspaceStorage_61b0945853fc292a0b12cc8168ac28e8_images_image-47be3058-d7c3-4ae4-a261-b69429d2c80a.png";

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
