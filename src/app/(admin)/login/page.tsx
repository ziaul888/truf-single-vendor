import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, LayoutDashboard } from "lucide-react";
import { LoginBrand, TurfLoginBrand } from "@/components/features/login/login-branding";
import { LoginForm } from "@/components/features/login/login-form";
import { DEFAULT_TAB_ICONS, tabIcons } from "@/lib/app-icons";
import { getTurfLoginBranding, TURFORG_BRAND } from "@/services/tab-branding";
import styles from "./login.module.css";

export async function generateMetadata({ searchParams }: {
  searchParams: Promise<{ turf?: string | string[] }>;
}): Promise<Metadata> {
  const { turf } = await searchParams;
  const brand = await getTurfLoginBranding(turf);
  return {
    title: `Owner sign in · ${brand?.venue.name ?? TURFORG_BRAND.name}`,
    icons: brand ? tabIcons({ turf: brand.slug }) : DEFAULT_TAB_ICONS,
  };
}

export default async function LoginPage({ searchParams }: {
  searchParams: Promise<{ turf?: string | string[] }>;
}) {
  const { turf } = await searchParams;

  return (
    <main className={`${styles.page} pitch bg-sidebar text-foreground grid min-h-dvh place-items-center px-4 sm:px-8`}>
      <div className="bg-card grid w-full max-w-lg overflow-hidden rounded-3xl border shadow-2xl shadow-black/25 lg:max-w-6xl lg:grid-cols-[minmax(25rem,0.85fr)_minmax(0,1.15fr)]">
        <section aria-labelledby="owner-login-heading" className="min-w-0 px-5 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
          <Suspense fallback={<LoginBrand />}>
            <TurfLoginBrand turf={turf} />
          </Suspense>

          <div className="mt-9 mb-7 sm:mt-10 sm:mb-8">
            <h1 id="owner-login-heading" className="text-3xl font-bold tracking-[-0.045em] sm:text-4xl">
              Owner sign in
            </h1>
            <p className="text-muted-foreground mt-3 max-w-[35ch] text-sm leading-relaxed">
              Use your turf owner or staff account to open the dashboard.
            </p>
          </div>

          <Suspense fallback={<LoginFormFallback />}>
            <LoginForm />
          </Suspense>

          <div className="border-border mt-6 flex flex-wrap items-center gap-x-2 border-t pt-3 text-sm">
            <span className="text-muted-foreground">Need an owner account?</span>
            <Link
              href="/saas/apply"
              className="text-primary inline-flex min-h-11 items-center gap-1 rounded-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              Apply for access <ArrowUpRight aria-hidden className="size-4 shrink-0" />
            </Link>
          </div>
        </section>

        <aside className={`${styles.preview} hidden min-w-0 flex-col justify-center border-l px-8 py-12 lg:flex xl:px-12`} aria-labelledby="login-preview-heading">
          <h2 id="login-preview-heading" className="max-w-[17ch] text-3xl font-bold tracking-[-0.045em] xl:text-[2.75rem] xl:leading-[1.12]">
            Your turf, at a glance.
          </h2>
          <p className="text-muted-foreground mt-4 max-w-[38ch] text-sm leading-relaxed">
            Check bookings, availability and payments from your dashboard.
          </p>

          <figure className="bg-sidebar mt-8 overflow-hidden rounded-2xl border shadow-xl shadow-black/30">
            <figcaption className="text-muted-foreground flex items-center gap-2 border-b px-4 py-3 text-xs font-medium">
              <LayoutDashboard aria-hidden className="text-primary size-4" />
              Dashboard preview
            </figcaption>
            <Image
              src="/saas/owner-dashboard.webp"
              alt="Dashboard showing sales, upcoming bookings and ground availability"
              width={1600}
              height={866}
              sizes="(min-width: 1216px) 560px, (min-width: 1024px) 50vw, 0px"
              className="block h-auto w-full"
            />
          </figure>
        </aside>
      </div>
    </main>
  );
}

function LoginFormFallback() {
  return (
    <div role="status" className="grid gap-5">
      <span className="sr-only">Loading sign-in form…</span>
      {[0, 1].map((field) => (
        <div key={field} className="grid gap-2" aria-hidden>
          <div className="bg-muted h-3.5 w-20 rounded" />
          <div className="bg-muted h-12 rounded-xl border" />
        </div>
      ))}
      <div className="bg-muted h-12 rounded-xl border" aria-hidden />
    </div>
  );
}
