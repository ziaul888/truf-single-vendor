import { PageTransition } from "@/components/page-transition";

/** Each portal page fades in on navigation while the header and footer stay put. */
export default function PortalTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
