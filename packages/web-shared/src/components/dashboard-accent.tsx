"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useAppearance, type AppearanceEndpoint } from "../hooks/useAppearance";
import { dashboardAccentStyles, normalizeAccentColor } from "../lib/appearance";

export function DashboardAccent({ endpoint, id }: { endpoint: AppearanceEndpoint; id?: string }) {
  const { data } = useAppearance(endpoint, id);
  const { resolvedTheme } = useTheme();
  const color = normalizeAccentColor(data?.accentColor ?? "");

  useEffect(() => {
    if (!color) return;
    // Radix dialogs and menus render outside the dashboard shell.
    const style = document.documentElement.style;
    const properties = Object.entries(dashboardAccentStyles(color, resolvedTheme));
    const previous = properties.map(([key]) => [key, style.getPropertyValue(key)] as const);
    for (const [key, value] of properties) style.setProperty(key, value);
    return () => {
      for (const [key, value] of previous) {
        if (value) style.setProperty(key, value);
        else style.removeProperty(key);
      }
    };
  }, [color, resolvedTheme]);

  return null;
}
