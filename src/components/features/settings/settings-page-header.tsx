import type { Audited } from "@/types/settings";
import { LastChanged } from "./last-changed";

interface SettingsPageHeaderProps {
  title: string;
  description: string;
  /** Pass the section's audit fields to show "Last changed by …"; leave out for read-only pages. */
  audit?: Partial<Audited>;
  /** Save / discard buttons. */
  children?: React.ReactNode;
}

/** Title, one-line description, "Last changed by …" and the page's actions, shared by every settings page. */
export function SettingsPageHeader({ title, description, audit, children }: SettingsPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-0.5">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
        {audit && <LastChanged updatedAt={audit.updatedAt} updatedBy={audit.updatedBy} />}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
