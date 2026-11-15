import type { Metadata } from "next";

// The login page is a client component, so its tab title is set here.
export const metadata: Metadata = { title: "Staff sign in" };

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
