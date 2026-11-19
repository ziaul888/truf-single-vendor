import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./saas.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-saas-display",
});

export const metadata: Metadata = {
  title: { absolute: "Turf SaaS · Plans and pricing" },
  description:
    "Compare monthly and yearly plans for turf settings, grounds, slot generation and staff management.",
};

export default function SaasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${display.variable} bg-background text-foreground min-h-dvh`}>{children}</div>
  );
}
