import { ImageResponse } from "next/og";
import { getPublicVenue } from "@/services/website-settings";

// The home-screen icon for the installed app: the venue's logo (Settings → General) on white,
// or its initial on the pitch green until one is uploaded. `?size=192|512|180`, `&maskable=1`
// for Android's masked icons (more padding, so the circle crop never cuts the logo).

const API_TARGET = process.env.API_PROXY_TARGET ?? "http://localhost:4000";
const SIZES = new Set([180, 192, 512]);
const PITCH = "#0b2612";
const GOLD = "#f2c12e";

/** The uploaded logo as a data URL, or null when there is none or it can't be fetched. */
async function logoDataUrl(logoUrl: string | null): Promise<string | null> {
  if (!logoUrl) return null;
  try {
    const res = await fetch(logoUrl.startsWith("/") ? `${API_TARGET}${logoUrl}` : logoUrl);
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "image/png";
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const asked = Number(params.get("size"));
  const size = SIZES.has(asked) ? asked : 512;
  const pad = Math.round(size * (params.get("maskable") ? 0.2 : 0.12));
  const venue = await getPublicVenue();
  const logo = await logoDataUrl(venue.logoUrl);

  const icon = logo ? (
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#ffffff", padding: pad }}>
      <div style={{
        display: "flex", width: "100%", height: "100%",
        backgroundImage: `url(${logo})`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center",
      }} />
    </div>
  ) : (
    <div style={{
      display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center",
      background: PITCH, color: GOLD, fontSize: size * 0.5, fontWeight: 800,
    }}>
      {venue.name.charAt(0).toUpperCase() || "T"}
    </div>
  );
  return new ImageResponse(icon, {
    width: size, height: size, headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
  });
}
