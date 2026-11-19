import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CalendarRange,
  Check,
  ChevronDown,
  CircleCheck,
  ClipboardCheck,
  Layers3,
  MapPin,
  MonitorSmartphone,
  ShieldCheck,
  Smartphone,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaasPricing } from "./saas-pricing";

const features = [
  {
    title: "Your venue, your rules",
    description: "Make it yours. Set up your turf profile, booking rules and business preferences.",
    icon: ShieldCheck,
  },
  {
    title: "Grounds and pricing",
    description: "Keep every ground organised with operating hours, slot lengths and peak rates.",
    icon: MapPin,
  },
  {
    title: "A schedule that makes sense",
    description: "Generate slots manually or automatically, and manage closures from one place.",
    icon: CalendarDays,
  },
  {
    title: "A home for your team",
    description: "Give admins and managers their own sign-ins to help run your turf together.",
    icon: UsersRound,
  },
  {
    title: "Bookings, without the juggling",
    description:
      "Bring your booking calendar, customer records, manual payments and refunds together.",
    icon: CalendarRange,
  },
  {
    title: "See how business is going",
    description:
      "Review sales, booking activity and ground performance, with reports you can export.",
    icon: BarChart3,
  },
];

const benefits = [
  {
    icon: MonitorSmartphone,
    title: "Your own booking website",
    detail: "Built for the way your customers book.",
  },
  {
    icon: UsersRound,
    title: "One place for your team",
    detail: "Your grounds, calendar and staff, together.",
  },
  {
    icon: WalletCards,
    title: "A plan that fits your business",
    detail: "Monthly or yearly. Priced in BDT.",
  },
];

const steps = [
  {
    title: "Find your fit",
    description: "Choose a monthly or yearly plan and see the full amount due before you apply.",
    icon: ClipboardCheck,
  },
  {
    title: "Submit your application",
    description:
      "Enter your business and owner details. You can arrange your first payment after applying.",
    icon: WalletCards,
  },
  {
    title: "Make it your turf",
    description:
      "Once the platform admin verifies payment, your account is activated and you can start setup.",
    icon: CircleCheck,
  },
];

const questions = [
  {
    question: "What does a subscription cover?",
    answer:
      "Each subscription covers one turf business, including its grounds, booking calendar, customer records, staff accounts, sales reports and customer booking website.",
  },
  {
    question: "Can customers book from their phones?",
    answer:
      "Yes. Your customer booking website works on phones, tablets and desktops. Customers can check live availability and book using the payment options enabled for your turf.",
  },
  {
    question: "How is my account activated?",
    answer:
      "Choose a plan and submit your application. You can pay afterward. The platform admin verifies the first payment before activating your turf account and starting your billing period.",
  },
  {
    question: "Can I pay monthly or yearly?",
    answer:
      "Both billing cycles are available. Switch between monthly and yearly pricing below to see the full charge for each plan in BDT before applying.",
  },
  {
    question: "Are card payments and booking emails available?",
    answer:
      "Online card payments and booking emails are not available for turf accounts yet. Your booking website supports cash, bKash and Nagad options when enabled. Payment and email preferences can be saved during setup.",
  },
];

const navigation = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#plans", label: "Pricing" },
  { href: "#faq", label: "FAQs" },
];

function Brand({ homeHref }: { homeHref: string }) {
  return (
    <Link href={homeHref} className="saas-brand" aria-label="TurfOrg home">
      <span className="saas-brand-mark">
        <Layers3 aria-hidden className="size-5" />
      </span>
      <span>
        Turf<span className="text-primary">Org</span>
        <span className="text-primary">.</span>
      </span>
    </Link>
  );
}

export function SaasLanding({ homeHref }: { homeHref: string }) {
  return (
    <div className="saas-page">
      <a href="#main-content" className="saas-skip-link">
        Skip to content
      </a>
      <header className="saas-header">
        <nav aria-label="Main navigation" className="saas-container saas-nav">
          <Brand homeHref={homeHref} />
          <div className="saas-nav-links">
            {navigation.map(({ href, label }) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <Link href="/admin" className="saas-login hidden sm:inline-flex">
              Log in <ArrowUpRight aria-hidden className="size-4" />
            </Link>
            <Button asChild className="saas-button h-11 px-4 sm:px-5">
              <Link href="/saas/apply">
                Get started <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section className="saas-hero" aria-labelledby="hero-heading">
          <div className="saas-container">
            <div className="saas-hero-copy">
              <p className="saas-hero-label">
                <span aria-hidden /> Built for the business behind the game
              </p>
              <h1 id="hero-heading" className="saas-display">
                Less admin.
                <br />
                <span className="text-primary">More game time.</span>
              </h1>
              <p className="saas-lead mx-auto mt-6 max-w-[48ch]">
                Your booking website, grounds, customers and team. Everything you need to run your
                turf, in one place.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="saas-button h-12 px-6 text-base">
                  <Link href="/saas/apply">
                    Get started with TurfOrg <ArrowRight aria-hidden />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="saas-button h-12 px-6 text-base"
                >
                  <a href="#plans">
                    Explore the plans <ArrowUpRight aria-hidden />
                  </a>
                </Button>
              </div>
              <p className="saas-hero-note">
                <ShieldCheck aria-hidden className="size-4 shrink-0" /> One turf. Your own website.
                Your own team.
              </p>
            </div>

            <figure className="saas-product-preview">
              <div className="saas-browser">
                <div className="saas-browser-bar" aria-hidden>
                  <span className="saas-browser-dots">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="saas-browser-address">
                    <ShieldCheck className="size-3.5" /> Your turf’s booking website
                  </span>
                  <span className="saas-browser-device">
                    <MonitorSmartphone className="size-4" />
                  </span>
                </div>
                <div className="saas-shot aspect-[2000/1083]">
                  <Image
                    src="/saas/booking-site-desktop.jpg"
                    alt="Example turf booking website showing a date, sport and format search, ground information and live availability."
                    width={2000}
                    height={1083}
                    sizes="(min-width: 1280px) 1120px, (min-width: 640px) 90vw, 100vw"
                    priority
                  />
                </div>
              </div>
              <figcaption className="saas-preview-caption">
                <span>
                  <span className="saas-caption-line" aria-hidden /> Your business. Ready for the
                  next booking.
                </span>
                <span className="hidden items-center gap-2 sm:inline-flex">
                  <Smartphone aria-hidden className="size-4" /> Made for every screen
                </span>
              </figcaption>
            </figure>
          </div>
        </section>

        <div className="saas-benefits">
          <ul className="saas-container grid gap-6 md:grid-cols-3 md:gap-8">
            {benefits.map(({ icon: Icon, title, detail }) => (
              <li key={title} className="flex items-start gap-3.5">
                <span className="saas-benefit-icon">
                  <Icon aria-hidden className="size-5" />
                </span>
                <div>
                  <p className="font-semibold tracking-tight">{title}</p>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <section id="features" className="saas-section-space" aria-labelledby="features-heading">
          <div className="saas-container">
            <div className="saas-section-heading">
              <div>
                <p className="saas-eyebrow">A little less chaos</p>
                <h2 id="features-heading" className="saas-section mt-4">
                  Your whole operation.
                  <br />
                  Working together.
                </h2>
              </div>
              <p className="saas-lead max-w-[37ch]">
                Give the everyday work a home, so you can focus on the people who come to play.
              </p>
            </div>
            <ul className="saas-feature-grid">
              {features.map(({ title, description, icon: Icon }, index) => (
                <li key={title} className="saas-feature-card">
                  <div className="flex items-center justify-between">
                    <span className="saas-feature-icon">
                      <Icon aria-hidden className="size-5" />
                    </span>
                    <span className="saas-feature-number" aria-hidden>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="saas-title mt-7">{title}</h3>
                  <p className="text-muted-foreground mt-3 leading-relaxed">{description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="saas-booking-section" aria-labelledby="booking-heading">
          <div className="saas-container">
            <div className="saas-booking-panel">
              <figure className="saas-phone-stage">
                <div className="saas-pitch-lines" aria-hidden>
                  <span />
                </div>
                <div className="saas-phone-frame">
                  <div className="saas-shot aspect-[780/1480]">
                    <Image
                      src="/saas/booking-site-phone.jpg"
                      alt="Mobile version of the customer booking website, with a simple search for available turf slots."
                      width={780}
                      height={1480}
                      sizes="(min-width: 640px) 260px, 220px"
                    />
                  </div>
                </div>
                <figcaption className="saas-phone-caption">
                  <CircleCheck aria-hidden className="size-4" /> Your turf. In their pocket.
                </figcaption>
              </figure>
              <div className="saas-booking-copy">
                <p className="saas-eyebrow">Open for your next booking</p>
                <h2 id="booking-heading" className="saas-section mt-4">
                  Give your customers
                  <br />a home for their game.
                </h2>
                <p className="saas-lead mt-5">
                  A booking website for your turf that makes it easy to find a ground, pick a slot
                  and plan the next game.
                </p>
                <ul className="saas-check-list mt-7">
                  {[
                    "Live availability for your grounds",
                    "A smooth booking experience on every screen",
                    "Cash, bKash and Nagad options when enabled",
                  ].map((item) => (
                    <li key={item}>
                      <Check aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
                <a href="#plans" className="saas-inline-link mt-8">
                  Find the right plan <ArrowUpRight aria-hidden className="size-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="saas-section-space" aria-labelledby="steps-heading">
          <div className="saas-container">
            <div className="mx-auto max-w-2xl text-center">
              <p className="saas-eyebrow">Three steps to your new workspace</p>
              <h2 id="steps-heading" className="saas-section mt-4">
                Getting started is straightforward.
              </h2>
              <p className="saas-lead mt-5">Choose a plan and apply for turf owner access.</p>
            </div>
            <ol className="saas-steps">
              {steps.map(({ title, description, icon: Icon }, index) => (
                <li key={title} className="saas-step">
                  <div className="saas-step-top">
                    <span className="saas-step-icon">
                      <Icon aria-hidden className="size-6" />
                    </span>
                    <span className="saas-step-count">
                      Step {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="saas-title mt-6">{title}</h3>
                  <p className="text-muted-foreground mt-3 max-w-[37ch] leading-relaxed">
                    {description}
                  </p>
                </li>
              ))}
            </ol>
            <p className="saas-activation-note">
              <ShieldCheck aria-hidden className="size-4 shrink-0" /> Your first paid billing period
              begins when your account is activated.
            </p>
          </div>
        </section>

        <SaasPricing />

        <section id="faq" className="saas-section-space" aria-labelledby="faq-heading">
          <div className="saas-container saas-faq-layout">
            <div>
              <p className="saas-eyebrow">Good questions. Clear answers.</p>
              <h2 id="faq-heading" className="saas-section mt-4">
                A few things
                <br />
                worth knowing.
              </h2>
              <p className="text-muted-foreground mt-5 max-w-[30ch] leading-relaxed">
                The details, before you take the next step.
              </p>
              <Link href="/saas/apply" className="saas-inline-link mt-6">
                Ready to get started? <ArrowUpRight aria-hidden className="size-4" />
              </Link>
            </div>
            <div className="saas-faq-list">
              {questions.map(({ question, answer }) => (
                <details key={question} className="saas-faq">
                  <summary>
                    {question}
                    <ChevronDown aria-hidden className="size-5 shrink-0" />
                  </summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="saas-close-section" aria-labelledby="close-heading">
          <div className="saas-container">
            <div className="saas-band saas-close">
              <div className="saas-close-pitch" aria-hidden>
                <span />
              </div>
              <div className="relative">
                <p className="saas-eyebrow">Make room for the game</p>
                <h2 id="close-heading" className="saas-section mt-5">
                  Your turf deserves
                  <br />a better way to run.
                </h2>
                <p className="saas-band-muted mt-5 max-w-[40ch] leading-relaxed">
                  Bring your bookings, business and team together. Let’s get your turf set up.
                </p>
                <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
                  <Button asChild size="lg" className="saas-button h-12 px-6 text-base">
                    <Link href="/saas/apply">
                      Get started with TurfOrg <ArrowRight aria-hidden />
                    </Link>
                  </Button>
                  <Link href="/admin" className="saas-band-link">
                    Already a member? Log in <ArrowUpRight aria-hidden className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="saas-footer">
        <div className="saas-container flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Brand homeHref={homeHref} />
            <p className="text-muted-foreground mt-3 text-sm">For the business behind the game.</p>
          </div>
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center gap-x-6 gap-y-1"
          >
            <a href="#features">Features</a>
            <a href="#plans">Pricing</a>
            <Link href="/admin">
              Owner login <ArrowUpRight aria-hidden className="size-3.5" />
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
