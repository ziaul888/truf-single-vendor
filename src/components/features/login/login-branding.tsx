import Image from "next/image";
import type { PublicVenue } from "@/types/settings";
import { LOGIN_COLORS as C, ROLE_CAPABILITIES } from "./login-theme";

type Brand = Pick<PublicVenue, "name" | "logoUrl">;
/** The venue's name, or "Turf" while it loads or if turf-api can't be reached. */
const nameOf = (venue?: Brand) => venue?.name || "Turf";

/** The venue's logo from Settings → General (the one the portal shows), or the default mark until one is uploaded. */
function LogoMark({ size, venue }: { size: number; venue?: Brand }) {
  if (venue?.logoUrl) {
    return (
      <span style={{ position: "relative", display: "block", width: size, height: size, borderRadius: size / 4, overflow: "hidden", background: "#fff" }}>
        {/* Served by turf-api through the same-origin proxy; a new file name on every upload. */}
        <Image src={venue.logoUrl} alt={`${venue.name} logo`} fill unoptimized sizes={`${size}px`} style={{ objectFit: "contain" }} />
      </span>
    );
  }
  return (
    <div
      style={{
        width: size, height: size, borderRadius: size / 4,
        background: `linear-gradient(135deg, ${C.accentDark}, ${C.accent})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size / 2, boxShadow: "0 8px 32px rgba(37,164,98,0.3)",
      }}
    >
      ⬡
    </div>
  );
}

const subtitle = { color: C.muted, letterSpacing: 3, textTransform: "uppercase" as const };

/** Compact logo row shown above the form on phones (hidden from `md` up). */
export function LoginMobileHeader({ venue }: { venue?: Brand }) {
  return (
    <div className="md:hidden" style={{ padding: "28px 24px 0", position: "relative", zIndex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <LogoMark size={40} venue={venue} />
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 3, lineHeight: 1 }}>
            {nameOf(venue).toUpperCase()} <span style={{ color: C.accent }}>ADMIN</span>
          </div>
          <div style={{ ...subtitle, fontSize: 10, letterSpacing: 2 }}>Code Cohen · v1.0</div>
        </div>
      </div>
    </div>
  );
}

/** Left-hand branding panel on tablet and desktop (hidden on phones); tablet sizes, roomier from `lg`. */
export function LoginBrandPanel({ venue }: { venue?: Brand }) {
  return (
    <div
      className="hidden px-10 py-12 md:flex lg:px-16 lg:py-[60px]"
      style={{ flex: 1, flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 1 }}
    >
      <div className="mb-9 lg:mb-12">
        <div style={{ marginBottom: 32 }}>
          <LogoMark size={56} venue={venue} />
        </div>
        <div
          className="text-[44px] lg:text-[56px]"
          style={{ fontFamily: "'Bebas Neue', sans-serif", lineHeight: 1, letterSpacing: 3, color: C.text }}
        >
          {nameOf(venue).toUpperCase()}<br />
          <span style={{ color: C.accent }}>ADMIN</span>
        </div>
        <div style={{ ...subtitle, fontSize: 13, marginTop: 8 }}>Code Cohen · v1.0</div>
      </div>

      <RoleCapabilities />

      <div
        className="mt-9 lg:mt-12"
        style={{ borderTop: "1px solid rgba(37,164,98,0.12)", paddingTop: 24, fontSize: 12, color: C.faint, lineHeight: 1.8 }}
      >
        Secure access with JWT authentication<br />
        Your role is set by your account
      </div>
    </div>
  );
}

export function RoleCapabilities({ small = false }: { small?: boolean }) {
  return (
    <div>
      <div style={{ ...subtitle, fontSize: small ? 10 : 11, marginBottom: small ? 12 : 20 }}>
        Role Capabilities
      </div>
      {ROLE_CAPABILITIES.map((r) => (
        <div key={r.role} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: small ? 8 : 16 }}>
          <div
            style={{
              width: small ? 6 : 8, height: small ? 6 : 8, borderRadius: "50%",
              background: r.color, marginTop: 5, flexShrink: 0,
            }}
          />
          <div>
            <div style={{ fontSize: small ? 11 : 13, fontWeight: 600, color: r.color, marginBottom: 3 }}>
              {r.role}
            </div>
            <div style={{ fontSize: small ? 10 : 11, color: C.muted }}>{r.perms.join(" · ")}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
