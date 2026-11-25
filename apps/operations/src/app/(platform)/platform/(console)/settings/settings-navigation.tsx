"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Images, Palette, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  { href: "/platform/settings", label: "Appearance", Icon: Palette },
  { href: "/platform/settings/landing", label: "Landing page", Icon: Images },
  { href: "/platform/settings/payments", label: "Payments", Icon: Wallet },
];

export function PlatformSettingsNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Settings sections"
      className="flex flex-wrap gap-x-4 gap-y-1 border-b sm:gap-x-6"
    >
      {sections.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "focus-visible:ring-ring -mb-px flex min-h-11 items-center gap-2 border-b-2 px-1 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset motion-reduce:transition-none",
              active
                ? "border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground border-transparent"
            )}
          >
            <Icon aria-hidden className={cn("size-4 shrink-0", active && "text-primary")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
