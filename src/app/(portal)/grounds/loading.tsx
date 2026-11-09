import { GroundsListSkeleton } from "@/components/portal/loading/grounds-list-skeleton";

// Mirrors the grounds list layout (filters, date bar, results header, cards) so nothing jumps when it loads.
export default function GroundsLoading() {
  return <GroundsListSkeleton />;
}
