import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { WebsiteSections } from "@/validations/website-settings";
import { bookingHref } from "@/services/portal-grounds";

export async function HowItWorksSection({ content }: { content: WebsiteSections["howItWorks"] }) {
  return (
    <section id="how" className="bg-sidebar py-8 sm:py-16 text-sidebar-foreground">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        {content.badge && (
          <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold tracking-wider text-accent-foreground">
            {content.badge}
          </span>
        )}
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:mt-4 sm:text-4xl">{content.title}</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 text-left sm:mt-12 sm:gap-8 sm:grid-cols-3">
          {content.steps.map(({ title, body }, i) => (
            <div key={i} className="flex items-start gap-3 sm:block">
              <span className="inline-flex h-8 w-8 shrink-0 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-accent text-base font-extrabold text-accent-foreground">
                {i + 1}
              </span>
              <div>
                <h3 className="text-base font-bold sm:mt-4 sm:text-lg">{title}</h3>
                <p className="mt-0.5 text-sm opacity-70 sm:mt-1">{body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 sm:mt-12">
          <Link
            href={await bookingHref()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 sm:w-auto py-3 text-sm font-bold text-accent-foreground hover:opacity-90"
          >
            {content.buttonLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
