"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Trees } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {THEMES.map(({ id, label, Icon }) => (
          <DropdownMenuItem
            key={id}
            onClick={() => setTheme(id)}
            className="gap-2"
          >
            <Icon className="h-4 w-4" />
            {label}
            {theme === id && (
              <span className="ml-auto text-xs text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
