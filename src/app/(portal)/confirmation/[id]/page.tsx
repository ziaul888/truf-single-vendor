import type { Metadata } from "next";
import { getPublicVenue } from "@/services/website-settings";
import { getTurfPortalSlug } from "@/services/turf-portal-request";
import { ConfirmationView } from "@/components/portal/confirmation/confirmation-view";

export const metadata: Metadata = { title: "Booking confirmation" };

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ id }, { token }, slug] = await Promise.all([params, searchParams, getTurfPortalSlug()]);
  const venue = await getPublicVenue(slug);

  return <ConfirmationView id={id} token={token} venueName={venue.name} />;
}
