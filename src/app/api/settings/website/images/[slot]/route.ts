import { NextRequest, NextResponse } from "next/server";
import { getWebsiteImage, saveWebsiteImage } from "@/services/website-images";
import {
  WEBSITE_IMAGE_MAX_UPLOAD_BYTES, WEBSITE_IMAGE_SLOTS, WEBSITE_IMAGE_TYPES, type WebsiteImageSlot,
} from "@/validations/website-settings";

type Params = { params: Promise<{ slot: string }> };

function parseSlot(slot: string): WebsiteImageSlot | null {
  return (WEBSITE_IMAGE_SLOTS as readonly string[]).includes(slot) ? (slot as WebsiteImageSlot) : null;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const slot = parseSlot((await params).slot);
  const image = slot && getWebsiteImage(slot);
  if (!image) {
    return NextResponse.json({ success: false, error: "Image not found" }, { status: 404 });
  }
  return new NextResponse(Buffer.from(image.bytes), {
    headers: {
      "Content-Type": image.contentType,
      // The URL carries ?v=<version>, so each upload gets a fresh URL.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

export async function POST(req: NextRequest, { params }: Params) {
  // TODO: verify the JWT once real auth exists — this only checks the cookie is present.
  if (!req.cookies.get("admin_token")?.value) {
    return NextResponse.json({ success: false, error: "Sign in to upload images" }, { status: 401 });
  }
  const slot = parseSlot((await params).slot);
  if (!slot) {
    return NextResponse.json({ success: false, error: "Unknown image slot" }, { status: 404 });
  }

  const file = (await req.formData().catch(() => null))?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: "Choose an image to upload" }, { status: 400 });
  }
  if (!(WEBSITE_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return NextResponse.json({ success: false, error: "Use a JPG, PNG or WebP image" }, { status: 400 });
  }
  if (file.size > WEBSITE_IMAGE_MAX_UPLOAD_BYTES) {
    return NextResponse.json({ success: false, error: "Image is larger than 2 MB" }, { status: 400 });
  }

  const url = saveWebsiteImage(slot, new Uint8Array(await file.arrayBuffer()), file.type);
  return NextResponse.json({ success: true, data: { url } }, { status: 201 });
}
