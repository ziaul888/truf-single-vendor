import { redirect } from "next/navigation";

export default async function OwnerApplicationPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string | string[]; interval?: string | string[] }>;
}) {
  const { plan, interval } = await searchParams;
  const query = new URLSearchParams();
  if (typeof plan === "string" && plan) query.set("plan", plan);
  if (interval === "yearly" || interval === "monthly") query.set("interval", interval);
  redirect(`/saas${query.size ? `?${query}` : ""}#apply`);
}
