import { getPlatformBranding } from "@/services/platform-branding";
import { renderAppIcon } from "@/services/render-app-icon";
import { PRODUCT_NAME } from "@/lib/product-name";

export async function GET(request: Request) {
  const { logoUrl } = await getPlatformBranding();
  return renderAppIcon({ name: PRODUCT_NAME, logoUrl }, new URL(request.url).searchParams);
}
