/** A ground's rules as the admin wrote them, line breaks kept. Renders nothing when there are none. */
export function GroundRules({ rules, className, heading: Heading = "h2" }: { rules?: string | null; className?: string; heading?: "h2" | "h3" }) {
  if (!rules?.trim()) return null;
  return (
    <section className={className}>
      <Heading className="mb-2 font-bold">Ground rules</Heading>
      <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{rules}</p>
    </section>
  );
}
