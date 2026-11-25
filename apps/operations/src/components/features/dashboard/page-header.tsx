import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export function DashboardPageHeader({ title, description, back, details, children }: {
  title: ReactNode;
  description?: ReactNode;
  back?: ReactNode;
  details?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="min-w-0 space-y-2 [overflow-wrap:anywhere]">
      {back}
      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:flex-wrap md:items-start md:justify-between">
        <div className="min-w-0 space-y-1 md:flex-1">
          <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          {details}
        </div>
        {children && (
          <div className="flex min-w-0 flex-wrap items-center gap-2 max-md:[&>[data-slot=button]]:h-auto max-md:[&>[data-slot=button]]:flex-1 max-md:[&>[data-slot=button]]:px-2 max-md:[&>[data-slot=button]]:whitespace-normal md:justify-end">
            {children}
          </div>
        )}
      </div>
    </header>
  );
}

export function DashboardBackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex min-h-11 max-w-full items-center gap-1 rounded-md text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:min-h-8">
      <ChevronLeft className="size-4 shrink-0" aria-hidden />
      {children}
    </Link>
  );
}
