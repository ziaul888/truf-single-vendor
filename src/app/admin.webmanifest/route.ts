import { getPublicVenue } from "@/services/website-settings";
import { appIcons } from "@/lib/app-icons";

/**
 * The staff app, installable from the dashboard. Its own id and start page, so staff can keep it on
 * the home screen next to the customer app. Scope is the whole site: signing in happens on /login.
 */
export async function GET() {
  const venue = await getPublicVenue();
  const manifest = {
    id: "/dashboard",
    name: `${venue.name} Admin`,
    short_name: "Turf Admin",
    description: "Bookings, slots and payments for the venue.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: appIcons(),
  };
  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=3600" },
  });
}
