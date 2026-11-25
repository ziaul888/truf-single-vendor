import { PageTransition } from "@/components/page-transition";

/** Each dashboard page fades in on navigation while the sidebar and top bar stay put. */
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
