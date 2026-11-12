import Link from "next/link";
import { cn } from "@/lib/utils";

/** The page rhythm shared by every home section: one centred column, tight on phones. */
export function HomeSection({
  id, className, children,
}: {
  id?: string; className?: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8", className)}>
      {children}
    </section>
  );
}

/** Title (and optional subtitle, hidden on phones) with an optional "see all" link on the right. */
export function SectionHeading({
  title, subtitle, href, linkLabel,
}: {
  title: string; subtitle?: string; href?: string; linkLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 sm:mb-6">
      <div className="min-w-0">
        <h2 className="text-xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 hidden text-sm text-muted-foreground sm:block">{subtitle}</p>}
      </div>
      {href && linkLabel && (
        <Link href={href} className="shrink-0 text-sm font-semibold text-primary hover:underline">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
