import { Check } from "lucide-react";

export function CheckoutStepper() {
  return (
    <ol className="mt-6 mb-2 flex items-center gap-3 text-sm">
      <Step n="✓" label="Slot" done />
      <span className="h-px flex-1 bg-primary" />
      <Step n={2} label="Details" active />
      <span className="h-px flex-1 bg-border" />
      <Step n={3} label="Done" />
    </ol>
  );
}

function Step({ n, label, active, done }: { n: string | number; label: string; active?: boolean; done?: boolean }) {
  return (
    <li className={`flex items-center gap-2 ${active || done ? "font-semibold" : "text-muted-foreground"}`}>
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
          done
            ? "bg-primary text-primary-foreground"
            : active
            ? "bg-accent text-accent-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {done ? <Check className="h-3.5 w-3.5" /> : n}
      </span>
      {label}
    </li>
  );
}
