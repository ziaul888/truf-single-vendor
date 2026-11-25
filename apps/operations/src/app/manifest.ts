import type { MetadataRoute } from "next";
import { getPublicVenue } from "@/services/website-settings";
import { getTurfPortalHome } from "@/services/turf-portal-request";
import { appIcons } from "@/lib/app-icons";

/** The customer booking app, installable from the portal ("Add to Home Screen"). */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const venue = await getPublicVenue();
  return {
    id: "/",
    name: venue.name,
    short_name: venue.name.length > 12 ? venue.name.split(" ")[0] : venue.name,
    description: "Book your turf slot in a few taps.",
    start_url: await getTurfPortalHome(),
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b2612",
    theme_color: "#110d0c",
    icons: appIcons(),
  };
}
