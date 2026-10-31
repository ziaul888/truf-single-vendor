import { getPublicVenue } from "@/services/website-settings";
import { ConfirmationView } from "@/components/portal/confirmation/confirmation-view";

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ id }, { token }, venue] = await Promise.all([params, searchParams, getPublicVenue()]);

  return <ConfirmationView id={id} token={token} venueName={venue.name} />;
}
