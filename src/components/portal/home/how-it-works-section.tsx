import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { WebsiteSections } from "@/validations/website-settings";

export function HowItWorksSection({ content }: { content: WebsiteSections["howItWorks"] }) {
  return (
    <section id="how" className="bg-sidebar py-16 text-sidebar-foreground">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        {content.badge && (
          <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold tracking-wider text-accent-foreground">
            {content.badge}
          </span>
        )}
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{content.title}</h2>
        <div className="mt-12 grid grid-cols-1 gap-8 text-left sm:grid-cols-3">
          {content.steps.map(({ title, body }, i) => (
            <div key={i}>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent text-base font-extrabold text-accent-foreground">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-1 text-sm opacity-70">{body}</p>
            </div>
          ))}
        </div>
        <div className="mt-12">
          <Link
            href="/grounds"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-accent-foreground hover:opacity-90"
          >
            {content.buttonLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
