import * as React from "react";
import { cn } from "../../lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "border-input/60 bg-muted/40 dark:bg-muted/30 flex h-11 w-full min-w-0 rounded-xl border px-4 py-2 text-base shadow-xs transition-all duration-200 md:text-sm",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground/60",
          "hover:bg-muted/70 hover:border-input dark:hover:bg-muted/50",
          "focus-visible:bg-background focus-visible:border-ring focus-visible:ring-ring/15 focus-visible:ring-4 focus-visible:outline-none",
          "disabled:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-60",
          "aria-invalid:border-destructive aria-invalid:bg-destructive/5 aria-invalid:focus-visible:ring-destructive/20",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
