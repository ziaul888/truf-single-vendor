import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck2,
  CheckCircle2,
  Layers3,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: CalendarCheck2,
    title: "Bookings and slots",
    text: "Keep availability, bookings, payments, and refunds together in one daily workflow.",
  },
  {
    icon: UsersRound,
    title: "Staff operations",
    text: "Give your team a focused dashboard for the venue work they handle every day.",
  },
  {
    icon: BarChart3,
    title: "Clear business view",
    text: "Review revenue, booking activity, customer records, and operational attention items.",
  },
];

function Header() {
  return (
    <header className="border-border/70 bg-background/90 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex min-h-18 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/saas"
          className="focus-visible:ring-ring flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2"
        >
          <span className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-xl">
            <Layers3 className="h-5 w-5" />
          </span>
          <span className="font-semibold tracking-tight">Turf SaaS</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="h-11">
            <Link href="/login">Owner login</Link>
          </Button>
          <Button asChild className="hidden h-11 sm:inline-flex">
            <Link href="/saas/apply">Apply now</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function SaasLanding() {
  return (
    <>
      <Header />
      <main>
        <section className="relative overflow-hidden border-b">
          <div className="bg-primary/8 absolute -top-40 right-[-8rem] h-96 w-96 rounded-full blur-3xl" />
          <div className="bg-info/10 absolute bottom-[-10rem] left-[-8rem] h-80 w-80 rounded-full blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:py-32">
            <div>
              <p className="text-primary text-xs font-semibold tracking-[0.22em] uppercase">
                Built for turf owners
              </p>
              <h1 className="mt-5 max-w-3xl text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Run your turf from one clear dashboard.
              </h1>
              <p className="text-muted-foreground mt-6 max-w-2xl text-base leading-7 sm:text-lg">
                Apply for owner access, wait for SaaS admin approval, then sign in to manage your
                turf account. Your business begins in Setting up so you can complete onboarding
                safely.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 px-6">
                  <Link href="/saas/apply">
                    Apply for owner access <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-6">
                  <Link href="/login">Already approved? Log in</Link>
                </Button>
              </div>
            </div>
            <div className="bg-card relative rounded-3xl border p-5 shadow-xl sm:p-7">
              <div className="flex items-center justify-between gap-4 border-b pb-5">
                <div>
                  <p className="text-sm font-semibold">Owner onboarding</p>
                  <p className="text-muted-foreground mt-1 text-xs">A simple, controlled start</p>
                </div>
                <ShieldCheck className="text-primary h-7 w-7" />
              </div>
              <ol className="mt-6 space-y-5">
                {[
                  "Submit your turf and owner details",
                  "SaaS admin reviews and activates",
                  "Log in at /login with your chosen password",
                ].map((step, index) => (
                  <li key={step} className="flex gap-4">
                    <span className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{step}</p>
                      {index === 1 && (
                        <p className="text-muted-foreground mt-1 text-xs">
                          The turf remains Setting up after owner activation.
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-primary text-xs font-semibold tracking-widest uppercase">
              One operating view
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              The tools a turf team needs to stay organised.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <article key={title} className="bg-card rounded-2xl border p-6">
                <span className="bg-primary/10 text-primary flex h-11 w-11 items-center justify-center rounded-xl">
                  <Icon />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-6">{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="bg-muted/30 border-y">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-primary text-xs font-semibold tracking-widest uppercase">
                  Approval flow
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight">
                  No account opens without review.
                </h2>
                <p className="text-muted-foreground mt-4 text-sm leading-6">
                  Your application stays pending until the SaaS admin activates it. Before
                  activation, the selected email and password cannot be used to log in.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {["Application received", "Admin activation", "Owner login enabled"].map((item) => (
                  <div key={item} className="bg-card flex items-center gap-3 rounded-xl border p-4">
                    <CheckCircle2 className="text-primary h-5 w-5 shrink-0" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to set up your turf?
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-sm leading-6">
            Send your application now. After approval, use the regular owner login page to access
            your dashboard.
          </p>
          <Button asChild size="lg" className="mt-8 h-12 px-7">
            <Link href="/saas/apply">
              Start application <ArrowRight />
            </Link>
          </Button>
        </section>
      </main>
      <footer className="border-t">
        <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col gap-3 px-4 py-7 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>Turf SaaS owner platform</span>
          <div className="flex gap-5">
            <Link className="hover:text-foreground" href="/saas/apply">
              Apply
            </Link>
            <Link className="hover:text-foreground" href="/login">
              Owner login
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
