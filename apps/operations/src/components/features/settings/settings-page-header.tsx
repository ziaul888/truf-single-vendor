import type { Audited } from "@/types/settings";
import { DashboardPageHeader } from "@/components/features/dashboard/page-header";
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
    <DashboardPageHeader
      title={title}
      description={description}
      details={audit && <LastChanged updatedAt={audit.updatedAt} updatedBy={audit.updatedBy} />}
    >
      {children}
    </DashboardPageHeader>
  );
}
