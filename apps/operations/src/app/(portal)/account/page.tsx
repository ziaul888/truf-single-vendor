import type { Metadata } from "next";
import { AccountView } from "@/components/portal/account/account-view";

export const metadata: Metadata = { title: "My profile" };

export default function AccountPage() {
  return <AccountView />;
}
