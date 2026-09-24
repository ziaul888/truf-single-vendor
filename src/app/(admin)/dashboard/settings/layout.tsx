export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your platform configuration</p>
      </div>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
