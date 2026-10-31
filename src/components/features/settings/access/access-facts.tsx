import { KeyRound } from "lucide-react";
import { SettingsSection } from "@/components/features/settings/settings-section";

// Fixed by turf-api; not configurable in v1.
const FACTS: { label: string; value: string }[] = [
  { label: "Roles", value: "Two only: admin and manager." },
  { label: "Sessions", value: "Last 8 hours, then staff sign in again." },
  { label: "Sign-in attempts", value: "5 per minute; more are refused for a while." },
  { label: "Signing out", value: "Ends every session for that account, on every device." },
  { label: "New staff", value: "No email invites: an admin creates the account with a password on the Staff page." },
];

export function AccessFacts() {
  return (
    <SettingsSection title="Sign-in rules" icon={KeyRound} description="Built into the system">
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FACTS.map((f) => (
          <div key={f.label} className="rounded-lg bg-muted/40 px-3 py-2">
            <dt className="text-xs font-medium text-muted-foreground">{f.label}</dt>
            <dd className="text-sm">{f.value}</dd>
          </div>
        ))}
      </dl>
    </SettingsSection>
  );
}
