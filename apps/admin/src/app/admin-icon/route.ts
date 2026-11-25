import { getDashboardBranding } from "@/services/tab-branding";
import { getTurfLoginBranding, TURFORG_BRAND } from "@/services/turf-login-branding";
import { getPublicVenue } from "@/services/website-settings";
import { renderAppIcon } from "@/services/render-app-icon";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  if (params.get("brand") === "owner") {
    const { venue } = await getDashboardBranding();
    return renderAppIcon(venue, params, true);
  }

  const turf = params.get("turf");
  const venue = turf
    ? (await getTurfLoginBranding(turf))?.venue ?? TURFORG_BRAND
    : await getPublicVenue();
  return renderAppIcon(venue, params);
}
