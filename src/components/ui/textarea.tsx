import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-22 w-full rounded-xl border border-input/60 bg-muted/40 dark:bg-muted/30 px-4 py-3 text-sm shadow-xs transition-all duration-200",
          "placeholder:text-muted-foreground/60",
          "hover:bg-muted/70 hover:border-input dark:hover:bg-muted/50",
          "focus-visible:bg-background focus-visible:border-ring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15",
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted/30",
          "aria-invalid:border-destructive aria-invalid:bg-destructive/5 aria-invalid:focus-visible:ring-destructive/20",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
