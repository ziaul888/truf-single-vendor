"use client";

import { useTheme } from "next-themes";
import { useId } from "react";
import { Sun, Moon, Monitor, Trees } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const THEMES = [
  { id: "light", label: "Manchester", Icon: Sun },
  { id: "dark", label: "Dark", Icon: Moon },
  { id: "pitch", label: "Pitch", Icon: Trees },
  { id: "system", label: "System", Icon: Monitor },
] as const;

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={theme ?? ""} onValueChange={setTheme}>
          {THEMES.map(({ id, label, Icon }) => (
            <DropdownMenuRadioItem key={id} value={id} className="gap-2">
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ThemeRadioGroup() {
  const { setTheme, theme } = useTheme();
  const name = useId();

  return (
    <fieldset className="min-w-0">
      <legend className="px-3 text-sm font-semibold">Theme</legend>
      {THEMES.map(({ id, label }) => (
        <label
          key={id}
          className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm hover:bg-sidebar-foreground/5 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent"
        >
          <input
            type="radio"
            name={name}
            value={id}
            checked={theme === id}
            onChange={() => setTheme(id)}
            className="size-4 shrink-0 accent-accent"
          />
          {label}
        </label>
      ))}
    </fieldset>
  );
}
