import { Card } from "@/components/ui/card";

export function SectionCard({
  n,
  title,
  desc,
  children,
}: {
  n: string;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-4 border-b px-4 py-4 sm:px-6">
        <div className="bg-primary text-primary-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold">
          {n}
        </div>
        <div>
          <p className="text-muted-foreground text-[11px] font-bold tracking-widest uppercase">
            {title}
          </p>
          <p className="text-muted-foreground text-xs">{desc}</p>
        </div>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </Card>
  );
}
