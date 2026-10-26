import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getWebsiteSettings, updateWebsiteSettings } from "@/services/website-settings";
import { WebsiteSettingsSchema } from "@/validations/website-settings";

export async function GET() {
  return NextResponse.json({ success: true, data: getWebsiteSettings() });
}

export async function PUT(req: NextRequest) {
  // TODO: verify the JWT once real auth exists — this only checks the cookie is present.
  if (!req.cookies.get("admin_token")?.value) {
    return NextResponse.json({ success: false, error: "Sign in to change website settings" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = WebsiteSettingsSchema.safeParse(body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
    return NextResponse.json({ success: false, error: "Some fields are invalid", details }, { status: 400 });
  }

  const saved = updateWebsiteSettings(parsed.data);
  revalidatePath("/", "layout");
  return NextResponse.json({ success: true, data: saved });
}
