import { getPublicVenue } from "@/services/website-settings";
import { getTurfLoginBranding, PRODUCT_BRAND } from "@/services/turf-login-branding";
import { getPlatformBranding } from "@/services/platform-branding";
import { renderAppIcon } from "@/services/render-app-icon";

async function iconBrand(params: URLSearchParams) {
  const brand = params.get("brand");
  if (brand === "platform") {
    const platform = await getPlatformBranding();
    return { name: platform.title, logoUrl: platform.logoUrl };
  }
  const turf = params.get("turf");
  if (turf) return (await getTurfLoginBranding(turf))?.venue ?? PRODUCT_BRAND;
  return getPublicVenue();
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  return renderAppIcon(await iconBrand(params), params);
}
