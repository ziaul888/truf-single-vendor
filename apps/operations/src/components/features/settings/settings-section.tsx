import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SettingsSectionProps {
  title: string;
  icon: React.ElementType;
  description?: string;
  children: React.ReactNode;
}

/** One card of related settings. */
export function SettingsSection({ title, icon: Icon, description, children }: SettingsSectionProps) {
  return (
    <Card>
      <CardHeader className="p-4 pb-4 sm:p-6 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-muted-foreground" /> {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">{children}</CardContent>
    </Card>
  );
}
