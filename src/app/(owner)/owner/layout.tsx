import type { Metadata } from "next";
import { ThemeToggle } from "@/components/theme-toggle";
export const metadata: Metadata = {
  title: { default: "Turf owner", template: "%s · Turf owner" },
  description: "Activate and sign in to your turf owner account.",
  robots: { index: false, follow: false },
  icons: { icon: "/platform-icon.svg", apple: "/platform-icon.svg" },
  appleWebApp: { title: "Turf owner" },
  openGraph: {
    title: "Turf owner",
    siteName: "Turf owner",
    description: "Turf owner account",
    images: [],
  },
  twitter: { card: "summary", title: "Turf owner", description: "Turf owner account", images: [] },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-foreground min-h-dvh px-4 py-6 sm:py-10">
      <div className="mx-auto mb-6 flex max-w-md justify-end">
        <ThemeToggle />
      </div>
      <main className="bg-card mx-auto max-w-md rounded-2xl border p-5 shadow-sm sm:p-8">
        {children}
      </main>
    </div>
  );
}
