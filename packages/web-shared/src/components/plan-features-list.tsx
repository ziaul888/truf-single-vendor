import { Check } from "lucide-react";
import {
  CORE_PLAN_FEATURES,
  PLAN_FEATURE_DETAILS,
  PLAN_FEATURES,
  hasPlanFeature,
  type PlanFeature,
} from "../lib/plan-features";
import { cn } from "../lib/utils";

export function PlanFeaturesList({
  features,
  className,
}: {
  features?: readonly PlanFeature[];
  className?: string;
}) {
  const labels = [
    ...CORE_PLAN_FEATURES,
    ...PLAN_FEATURES.filter((key) => hasPlanFeature(features, key)).map(
      (key) => PLAN_FEATURE_DETAILS[key].label
    ),
  ];
  return (
    <ul aria-label="Included features" className={cn("space-y-2.5 text-sm", className)}>
      {labels.map((label) => (
        <li key={label} className="flex items-start gap-2">
          <Check aria-hidden className="text-primary mt-0.5 size-4 shrink-0" />
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}
