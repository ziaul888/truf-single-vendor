export interface Appearance {
  accentColor: string | null;
}

export function normalizeAccentColor(value: string): string | null {
  return /^#[0-9a-f]{6}$/i.test(value) ? value.toUpperCase() : null;
}

type RGB = [number, number, number];

function channels(hex: string): RGB {
  return [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16)) as RGB;
}

function luminance([red, green, blue]: RGB) {
  const linear = (channel: number) => {
    const srgb = channel / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
}

function readableAccent(hex: string, background: string, lighten: boolean) {
  const base = channels(hex);
  const surface = luminance(channels(background));
  const end = lighten ? 255 : 0;
  for (let percent = 0; percent <= 100; percent += 2) {
    const rgb = base.map((channel) =>
      Math.round(channel + ((end - channel) * percent) / 100)
    ) as RGB;
    const color = luminance(rgb);
    const contrast = (Math.max(color, surface) + 0.05) / (Math.min(color, surface) + 0.05);
    if (contrast >= 4.5)
      return `#${rgb.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
  }
  return lighten ? "#ffffff" : "#000000";
}

function foreground(hex: string) {
  // At this luminance, white and black have the same contrast ratio.
  return luminance(channels(hex)) >= 0.179 ? "#000000" : "#ffffff";
}

export function dashboardAccentStyles(hex: string, theme?: string) {
  const surface = theme === "pitch" ? "#35483A" : theme === "dark" ? "#302523" : "#EAE2DF";
  const primary = readableAccent(hex, surface, theme === "pitch" || theme === "dark");
  const sidebar = readableAccent(hex, "#304238", true);
  return {
    "--primary": primary,
    "--primary-foreground": foreground(primary),
    "--ring": primary,
    "--sidebar-primary": sidebar,
    "--sidebar-primary-foreground": foreground(sidebar),
    "--sidebar-ring": sidebar,
  };
}
