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
      <div className="flex items-center gap-4 border-b px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-sm">
          {n}
        </div>
        <div>
          <p className="font-semibold text-[15px] leading-snug">{title}</p>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </Card>
  );
}
