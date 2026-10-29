import { getWebsiteSettings } from "@/services/website-settings";
import { ConfirmationView } from "@/components/portal/confirmation/confirmation-view";

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ id }, { token }] = await Promise.all([params, searchParams]);
  const { venueName } = getWebsiteSettings().contact;

  return <ConfirmationView id={id} token={token} venueName={venueName} />;
}
