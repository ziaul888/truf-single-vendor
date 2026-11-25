import { PlatformShell } from "@/components/features/platform/platform-shell";
export default function PlatformConsoleLayout({ children }: { children: React.ReactNode }) {
  return <PlatformShell>{children}</PlatformShell>;
}
