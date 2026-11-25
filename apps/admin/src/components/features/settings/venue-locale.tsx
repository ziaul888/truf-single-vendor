import type { VenueProfile } from "@/types/settings";

const WEEKDAYS: Record<string, string> = {
  sat: "Saturday", sun: "Sunday", mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday",
};

/** Currency, timezone and week start: fixed in v1, shown for reference. */
export function VenueLocale({ locale }: { locale: VenueProfile["locale"] }) {
  const rows = [
    { label: "Currency", value: locale.currency === "BDT" ? "BDT — Bangladeshi Taka (৳)" : locale.currency },
    { label: "Timezone", value: locale.timezone },
    { label: "Week starts on", value: WEEKDAYS[locale.weekStartsOn] ?? locale.weekStartsOn },
  ];
  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {rows.map((r) => (
        <div key={r.label} className="rounded-lg border bg-muted/30 px-3 py-2">
          <dt className="text-[11px] text-muted-foreground">{r.label}</dt>
          <dd className="text-sm font-medium">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
