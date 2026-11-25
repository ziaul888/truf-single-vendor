import { ConfirmationSkeleton } from "@/components/portal/loading/confirmation-skeleton";

// Mirrors the confirmation page's first render (the dark band while the booking loads).
export default function ConfirmationLoading() {
  return <ConfirmationSkeleton />;
}
