import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Turf management platform" },
  description: "Apply for a turf-owner account and manage your venue from one clear dashboard.",
};

export default function SaasLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-background text-foreground min-h-dvh">{children}</div>;
}
