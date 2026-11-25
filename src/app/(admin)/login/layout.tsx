import type { Metadata } from "next";

export const metadata: Metadata = { title: { absolute: "Owner sign in" } };

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
