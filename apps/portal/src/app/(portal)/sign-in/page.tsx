import { redirect } from "next/navigation";
import { customerSignInRedirect } from "@/lib/customer-sign-in";
import { getTurfPortalHome, getTurfPortalSlug } from "@/services/turf-portal-request";

export default async function SignInPage({ searchParams }: {
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const [{ from }, slug] = await Promise.all([searchParams, getTurfPortalSlug()]);
  const homePath = await getTurfPortalHome(slug);
  redirect(customerSignInRedirect(typeof from === "string" ? from : null, slug, homePath));
}
