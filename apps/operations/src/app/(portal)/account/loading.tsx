import { AccountSkeleton } from "@/components/portal/loading/account-skeletons";

// The same skeleton AccountView shows while the session loads, so the hand-over doesn't move.
export default function AccountLoading() {
  return <AccountSkeleton className="page-loading" />;
}
