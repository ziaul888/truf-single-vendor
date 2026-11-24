import { PortalLink as Link } from "@/components/portal/turf-portal-scope";
import { ArrowRight } from "lucide-react";
import type { WebsiteSections } from "@/validations/website-settings";
import { bookingHref } from "@/services/portal-grounds";
import { HomeSection } from "./home-section";

export async function HowItWorksSection({ content, slug }: { content: WebsiteSections["howItWorks"]; slug?: string }) {
  return (
    <HomeSection id="how">
      {/* A dark rounded panel inside the page, not a full-width band */}
      <div className="rounded-3xl bg-sidebar p-5 text-sidebar-foreground sm:p-10">
        {content.badge && (
          <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold tracking-wider text-accent-foreground">
            {content.badge}
          </span>
        )}
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl">{content.title}</h2>
        <ol className="mt-5 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4">
          {content.steps.map(({ title, body }, i) => (
            <li key={i} className="flex items-start gap-4 rounded-2xl bg-sidebar-foreground/10 p-4 sm:block sm:p-5">
              <span className="text-4xl font-black leading-none text-accent sm:text-5xl">{i + 1}</span>
              <div>
                <h3 className="text-base font-bold sm:mt-4 sm:text-lg">{title}</h3>
                <p className="mt-0.5 text-sm opacity-70 sm:mt-1">{body}</p>
              </div>
            </li>
          ))}
        </ol>
        <Link
          href={await bookingHref(slug)}
          data-football-kick
          className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-bold text-accent-foreground hover:opacity-90 sm:mt-8 sm:w-auto"
        >
          {content.buttonLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </HomeSection>
  );
}
