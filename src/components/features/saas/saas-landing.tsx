import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  Clock,
  Layers3,
  MapPin,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaasPricing } from "./saas-pricing";

const available = [
  {
    title: "Turf settings",
    description: "Set up your venue profile, booking rules and preferences.",
    icon: ShieldCheck,
  },
  {
    title: "Grounds and pricing",
    description: "Add grounds with operating hours, slot lengths and peak rates.",
    icon: MapPin,
  },
  {
    title: "Slot generation",
    description: "Generate time slots manually, set up automatic generation and manage closures.",
    icon: CalendarDays,
  },
  {
    title: "Staff accounts",
    description: "Give your own admins and managers access to your turf.",
    icon: UsersRound,
  },
  {
    title: "Bookings and customers",
    description: "Manage the booking calendar, customer records, manual payments and refunds.",
    icon: CalendarRange,
  },
  {
    title: "Sales reports and exports",
    description: "Review your turf’s sales, booking activity and ground performance.",
    icon: BarChart3,
  },
];

const bookingWebsite = {
  title: "Customer booking website",
  description:
    "Publish your turf website with live availability and cash, bKash or Nagad booking options.",
};

const upcoming = ["Online card payments and booking emails"];

const steps = [
  {
    title: "Choose a plan",
    description: "See the full amount due for your chosen billing cycle.",
  },
  {
    title: "Pay and submit your reference",
    description: "Use an available bKash, Nagad or bank transfer option.",
  },
  {
    title: "Log in after payment verification",
    description: "The platform admin confirms your payment and activates your turf account.",
  },
];

const textLink =
  "focus-visible:ring-ring min-h-11 items-center rounded-md px-3 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:outline-none";

export function SaasLanding() {
  return (
    <div className="saas-page">
      <header className="border-border bg-background sticky top-0 z-40 border-b">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex min-h-16 max-w-[90rem] items-center justify-between gap-3 px-4 sm:px-6 lg:px-16"
        >
          <Link
            href="/saas"
            className="focus-visible:ring-ring flex min-h-11 shrink-0 items-center gap-2.5 rounded-md font-semibold focus-visible:ring-2 focus-visible:outline-none"
          >
            <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg">
              <Layers3 aria-hidden className="size-5" />
            </span>
            Turf SaaS
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <a href="#features" className={`${textLink} hidden md:inline-flex`}>
              Features
            </a>
            <a href="#plans" className={`${textLink} hidden sm:inline-flex`}>
              Plans
            </a>
            <Button variant="outline" asChild className="h-11 px-3 sm:px-4">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="h-11 px-3 sm:px-4">
              <Link href="/saas/apply">Apply now</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero: Stage. Text on four tracks, the booking site on six, bleeding off the right edge on desktop. */}
        <section className="overflow-x-clip">
          <div className="mx-auto grid max-w-[90rem] items-center gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] lg:gap-16 lg:py-12 lg:pr-0 lg:pl-16">
            <div className="max-w-xl">
              <h1 className="saas-display">Run your turf from one admin panel.</h1>
              <p className="saas-lead mt-6 max-w-[34ch]">
                Venue, grounds, slots and staff sign-ins, on a monthly or yearly plan.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="h-12 px-6 text-base">
                  <Link href="/saas/apply">Apply for owner access</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-6 text-base">
                  <a href="#plans">See plans and pricing</a>
                </Button>
              </div>
            </div>

            <figure className="min-w-0">
              <div
                className="saas-shot aspect-[2000/1083] lg:rounded-r-none"
                data-slot="hero"
                data-kind="product"
                data-alt="The turf's customer booking website on desktop: header, hero search and venue facts"
              >
                <Image
                  src="/saas/booking-site-desktop.jpg"
                  alt="A turf's customer booking website on desktop, with a date, sport and format search"
                  width={2000}
                  height={1083}
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  priority
                />
              </div>
              <figcaption className="text-muted-foreground mt-3 text-sm">
                The booking website your customers see.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* What each plan includes: an index of rows, the head beside them. */}
        <section id="features" className="scroll-mt-20 py-24 sm:py-32 lg:py-36">
          <div className="mx-auto grid max-w-[90rem] gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-16">
            <h2 className="saas-section lg:col-span-4">Included in each plan today</h2>
            <ul className="border-border divide-border divide-y border-y lg:col-span-8">
              {available.map(({ title, description, icon: Icon }) => (
                <li
                  key={title}
                  className="grid gap-2 py-6 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-8 sm:py-7"
                >
                  <h3 className="saas-title flex items-center gap-3">
                    <Icon aria-hidden className="text-primary size-5 shrink-0" />
                    {title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed sm:pt-1">{description}</p>
                </li>
              ))}
              <li className="grid gap-2 py-6 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-8 sm:py-7">
                <h3 className="saas-title text-muted-foreground flex items-center gap-3">
                  <Clock aria-hidden className="size-5 shrink-0" />
                  Not available for turf accounts yet
                </h3>
                <div className="text-muted-foreground leading-relaxed sm:pt-1">
                  <ul className="space-y-1">
                    {upcoming.map((item) => (
                      <li key={item} className="text-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm">
                    Website, payment and email preferences can be saved during setup.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* The booking website, shown on the phone most customers book from. */}
        <section className="bg-muted py-24 sm:py-28">
          <div className="mx-auto grid max-w-[90rem] items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-16">
            <div className="lg:col-span-5">
              <h2 className="saas-section">{bookingWebsite.title}</h2>
              <p className="saas-lead mt-6 max-w-[40ch]">{bookingWebsite.description}</p>
            </div>
            <figure className="flex justify-center lg:col-span-6 lg:col-start-7">
              <div
                className="saas-shot aspect-[780/1480] w-full max-w-[22rem] rounded-[28px]"
                data-slot="phone"
                data-kind="product"
                data-alt="The turf's customer booking website on a phone, the search card in view"
              >
                <Image
                  src="/saas/booking-site-phone.jpg"
                  alt="The same booking website on a phone, with the find slots search"
                  width={780}
                  height={1480}
                  sizes="22rem"
                />
              </div>
            </figure>
          </div>
        </section>

        {/* The real process, on the ink band. */}
        <section className="saas-band py-24 sm:py-32">
          <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-16">
            <h2 className="saas-section max-w-[16ch]">From application to setup</h2>
            <ol className="mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
              {steps.map(({ title, description }, index) => (
                <li key={title} className="border-t border-current/20 pt-6">
                  <span aria-hidden className="saas-numeral block text-6xl leading-none">
                    {index + 1}
                  </span>
                  <h3 className="saas-title mt-6">{title}</h3>
                  <p className="saas-band-muted mt-3 max-w-[36ch] leading-relaxed">{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <SaasPricing />

        {/* The close: the hero's action again, with the one term that matters at activation. */}
        <section className="border-border border-t py-20 sm:py-24">
          <div className="mx-auto flex max-w-[90rem] flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-16">
            <div>
              <h2 className="saas-section">Ready to set up your turf?</h2>
              <p className="saas-lead mt-4">Activation starts your first paid billing period.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-6 text-base">
                <Link href="/saas/apply">Apply now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
                <Link href="/login">Sign in to Turf Admin</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
