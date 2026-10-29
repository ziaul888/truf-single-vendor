"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { useCustomerSession, useCustomerSignOut } from "./use-customer-session";

/** Header account link: "Sign in", or the customer's name with Sign out. */
export function CustomerNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useCustomerSession();
  const signOut = useCustomerSignOut();

  if (isPending) return <span className="hidden w-16 sm:block" aria-hidden />;
  if (!session) {
    return (
      <Link href={`/sign-in?from=${encodeURIComponent(pathname)}`}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold hover:text-accent">
        <UserRound className="h-4 w-4" />
        <span className="hidden sm:inline">Sign in</span>
      </Link>
    );
  }

  const label = session.name?.split(" ")[0] ?? session.phone;
  return (
    <div className="flex items-center">
      <Link href="/my-bookings" title={session.phone}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold hover:text-accent">
        <UserRound className="h-4 w-4" />
        <span className="hidden max-w-28 truncate sm:inline">{label}</span>
      </Link>
      <button type="button" aria-label="Sign out" title="Sign out" disabled={signOut.isPending}
        onClick={() => signOut.mutate(undefined, { onSuccess: () => router.refresh() })}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg opacity-70 hover:text-accent hover:opacity-100">
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
