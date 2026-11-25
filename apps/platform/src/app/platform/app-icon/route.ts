import { getPlatformBranding } from "@/services/platform-branding";
import { renderAppIcon } from "@/services/render-app-icon";

export async function GET(request: Request) {
  const { title, logoUrl } = await getPlatformBranding();
  return renderAppIcon({ name: title, logoUrl }, new URL(request.url).searchParams);
}
