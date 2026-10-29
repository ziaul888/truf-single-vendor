import { LOGIN_COLORS as C, ROLE_CAPABILITIES } from "./login-theme";

function LogoMark({ size }: { size: number }) {
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

/** Compact logo row shown above the form on phones. */
export function LoginMobileHeader() {
  return (
    <div style={{ padding: "28px 24px 0", position: "relative", zIndex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <LogoMark size={40} />
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 3, lineHeight: 1 }}>
            TURF <span style={{ color: C.accent }}>ADMIN</span>
          </div>
          <div style={{ ...subtitle, fontSize: 10, letterSpacing: 2 }}>Code Cohen · v1.0</div>
        </div>
      </div>
    </div>
  );
}

/** Left-hand branding panel on tablet and desktop. */
export function LoginBrandPanel({ compact }: { compact: boolean }) {
  return (
    <div
      style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
        padding: compact ? "48px 40px" : "60px 64px", position: "relative", zIndex: 1,
      }}
    >
      <div style={{ marginBottom: compact ? 36 : 48 }}>
        <div style={{ marginBottom: 32 }}>
          <LogoMark size={56} />
        </div>
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: compact ? 44 : 56,
            lineHeight: 1, letterSpacing: 3, color: C.text,
          }}
        >
          TURF<br />
          <span style={{ color: C.accent }}>ADMIN</span>
        </div>
        <div style={{ ...subtitle, fontSize: 13, marginTop: 8 }}>Code Cohen · v1.0</div>
      </div>

      <RoleCapabilities />

      <div
        style={{
          borderTop: "1px solid rgba(37,164,98,0.12)", marginTop: compact ? 36 : 48,
          paddingTop: 24, fontSize: 12, color: C.faint, lineHeight: 1.8,
        }}
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
