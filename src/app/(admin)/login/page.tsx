"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const roles = [
  { label: "Super Admin", value: "super_admin", color: "#f0c040", icon: "⬡" },
  { label: "Manager", value: "manager", color: "#4db8ff", icon: "◈" },
  { label: "Attendant", value: "attendant", color: "#7dde9a", icon: "◇" },
] as const;

type RoleValue = (typeof roles)[number]["value"];

const DEMO_CREDENTIALS: Record<RoleValue, { email: string; password: string }> = {
  super_admin: { email: "admin@turf.com", password: "admin123" },
  manager: { email: "manager@turf.com", password: "manager123" },
  attendant: { email: "staff@turf.com", password: "staff123" },
};

const ROLE_CAPABILITIES: { role: string; color: string; perms: string[] }[] = [
  { role: "Super Admin", color: "#f0c040", perms: ["Full Dashboard", "Manage Pricing", "Add Admins", "All Reports"] },
  { role: "Manager", color: "#4db8ff", perms: ["Bookings & Refunds", "Block Slots", "Staff View"] },
  { role: "Attendant", color: "#7dde9a", perms: ["View Bookings", "Block Slots"] },
];

function useWindowWidth() {
  const [width, setWidth] = useState(1200);
  useEffect(() => {
    setWidth(window.innerWidth);
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

export default function LoginPage() {
  const router = useRouter();
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const [selectedRole, setSelectedRole] = useState<RoleValue>("super_admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const role = roles.find((r) => r.value === selectedRole)!;

  function handleLogin() {
    if (locked) return;
    setError("");
    const creds = DEMO_CREDENTIALS[selectedRole];
    if (email === creds.email && password === creds.password) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        router.push("/dashboard");
      }, 1800);
    } else {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= 5) {
        setLocked(true);
        setError("Account locked after 5 failed attempts. Contact Super Admin.");
      } else {
        setError(`Invalid credentials. ${5 - next} attempt(s) remaining.`);
      }
    }
  }

  function handleRoleChange(value: RoleValue) {
    setSelectedRole(value);
    setError("");
    setAttempts(0);
    setLocked(false);
  }

  const formPanelWidth = isMobile ? "100%" : "30%";
  const formPadding = isMobile ? "40px 24px" : isTablet ? "48px 36px" : "60px 48px";
  const leftPadding = isTablet ? "48px 40px" : "60px 64px";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060d09",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        fontFamily: "'DM Sans', sans-serif",
        color: "#e8f5ee",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes drift {
          0%,100% { transform: translate(0,0) rotate(0deg); }
          33%      { transform: translate(20px,-15px) rotate(1deg); }
          66%      { transform: translate(-10px,10px) rotate(-0.5deg); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp {
          from { opacity:0; transform: translateY(10px); }
          to   { opacity:1; transform: translateY(0); }
        }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px #111a15 inset !important;
          -webkit-text-fill-color: #e8f5ee !important;
        }
        input:focus { outline: none; }
        button:focus { outline: none; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Field stripes */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 0,
          background: `repeating-linear-gradient(180deg,
            rgba(26,122,74,0.06) 0px, rgba(26,122,74,0.06) 80px,
            transparent 80px, transparent 160px)`,
        }}
      />

      {/* Floating orbs */}
      {[
        { size: isMobile ? 250 : 400, top: "-10%", left: "-8%", color: "rgba(26,122,74,0.12)", delay: "0s" },
        { size: isMobile ? 200 : 300, bottom: "-5%", right: "-5%", color: "rgba(37,164,98,0.08)", delay: "3s" },
        { size: isMobile ? 150 : 200, top: "40%", right: "10%", color: "rgba(46,204,113,0.06)", delay: "1.5s" },
      ].map((o, i) => (
        <div
          key={i}
          style={{
            position: "fixed", borderRadius: "50%",
            width: o.size, height: o.size,
            top: o.top,
            bottom: (o as { bottom?: string }).bottom,
            left: (o as { left?: string }).left,
            right: (o as { right?: string }).right,
            background: `radial-gradient(circle, ${o.color}, transparent 70%)`,
            animation: `drift 8s ease-in-out infinite`,
            animationDelay: o.delay,
            zIndex: 0,
          }}
        />
      ))}

      {/* ── Mobile top bar ── */}
      {isMobile && (
        <div
          style={{
            padding: "28px 24px 0",
            position: "relative",
            zIndex: 1,
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.6s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 4 }}>
            <div
              style={{
                width: 40, height: 40, borderRadius: 10,
                background: "linear-gradient(135deg, #1a7a4a, #25a462)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, boxShadow: "0 4px 16px rgba(37,164,98,0.3)",
              }}
            >
              ⬡
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 28, letterSpacing: 3, lineHeight: 1,
                }}
              >
                TURF <span style={{ color: "#25a462" }}>ADMIN</span>
              </div>
              <div style={{ fontSize: 10, color: "#6b8f78", letterSpacing: 2, textTransform: "uppercase" }}>
                Code Cohen · v1.0
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Left panel – branding (tablet + desktop) ── */}
      {!isMobile && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: leftPadding,
            position: "relative",
            zIndex: 1,
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.8s ease 0.1s",
          }}
        >
          {/* Logo */}
          <div style={{ marginBottom: isTablet ? 36 : 48 }}>
            <div
              style={{
                width: 56, height: 56, borderRadius: 14,
                background: "linear-gradient(135deg, #1a7a4a, #25a462)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26, marginBottom: 32,
                boxShadow: "0 8px 32px rgba(37,164,98,0.3)",
              }}
            >
              ⬡
            </div>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: isTablet ? 44 : 56,
                lineHeight: 1,
                letterSpacing: 3,
                color: "#e8f5ee",
              }}
            >
              TURF<br />
              <span style={{ color: "#25a462" }}>ADMIN</span>
            </div>
            <div style={{ color: "#6b8f78", fontSize: 13, letterSpacing: 3, marginTop: 8, textTransform: "uppercase" }}>
              Code Cohen · v1.0
            </div>
          </div>

          {/* Role capabilities */}
          <div style={{ marginBottom: isTablet ? 36 : 48 }}>
            <div
              style={{
                fontSize: 11, letterSpacing: 3, color: "#6b8f78",
                textTransform: "uppercase", marginBottom: 20,
              }}
            >
              Role Capabilities
            </div>
            {ROLE_CAPABILITIES.map((r) => (
              <div
                key={r.role}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16,
                  opacity: selectedRole === r.role.toLowerCase().replace(" ", "_") ? 1 : 0.4,
                  transition: "opacity 0.3s ease",
                }}
              >
                <div
                  style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: r.color, marginTop: 5, flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: r.color, marginBottom: 3 }}>
                    {r.role}
                  </div>
                  <div style={{ fontSize: 11, color: "#6b8f78" }}>
                    {r.perms.join(" · ")}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(37,164,98,0.12)",
              paddingTop: 24, fontSize: 12, color: "#3d6b52", lineHeight: 1.8,
            }}
          >
            Secure access with JWT authentication<br />
            Auto-lock after 5 failed attempts
          </div>
        </div>
      )}

      {/* ── Right panel – form ── */}
      <div
        style={{
          width: formPanelWidth,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: isMobile ? "flex-start" : "center",
          padding: formPadding,
          background: isMobile ? "transparent" : "rgba(17,26,21,0.8)",
          backdropFilter: isMobile ? "none" : "blur(20px)",
          borderLeft: isMobile ? "none" : "1px solid rgba(37,164,98,0.12)",
          borderTop: isMobile ? "none" : "none",
          position: "relative",
          zIndex: 1,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s",
          overflowY: isMobile ? "auto" : "visible",
        }}
      >
        {/* Form header — hidden on mobile since top bar covers it */}
        {!isMobile && (
          <div style={{ marginBottom: 40 }}>
            <div
              style={{
                fontSize: 11, letterSpacing: 3, color: "#6b8f78",
                textTransform: "uppercase", marginBottom: 8,
              }}
            >
              Secure Login
            </div>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 32, letterSpacing: 2,
              }}
            >
              ADMIN PANEL
            </div>
          </div>
        )}

        {/* Mobile form header */}
        {isMobile && (
          <div style={{ marginBottom: 28, marginTop: 32 }}>
            <div
              style={{
                fontSize: 11, letterSpacing: 3, color: "#6b8f78",
                textTransform: "uppercase", marginBottom: 6,
              }}
            >
              Secure Login
            </div>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 28, letterSpacing: 2,
              }}
            >
              ADMIN PANEL
            </div>
          </div>
        )}

        {/* Role selector */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 11, letterSpacing: 2, color: "#6b8f78",
              textTransform: "uppercase", marginBottom: 12,
            }}
          >
            Select Role
          </div>
          <div style={{ display: "flex", gap: isMobile ? 6 : 8 }}>
            {roles.map((r) => (
              <button
                key={r.value}
                onClick={() => handleRoleChange(r.value)}
                style={{
                  flex: 1,
                  padding: isMobile ? "8px 0" : "10px 0",
                  borderRadius: 8,
                  cursor: "pointer",
                  border: selectedRole === r.value
                    ? `1.5px solid ${r.color}`
                    : "1.5px solid rgba(37,164,98,0.15)",
                  background: selectedRole === r.value ? `${r.color}15` : "transparent",
                  color: selectedRole === r.value ? r.color : "#6b8f78",
                  fontSize: isMobile ? 10 : 11,
                  fontWeight: 600,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  transition: "all 0.25s ease",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <div style={{ fontSize: isMobile ? 16 : 18, marginBottom: 3 }}>{r.icon}</div>
                <div>{r.label.split(" ")[0]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Demo hint */}
        <div
          style={{
            background: `${role.color}10`,
            border: `1px solid ${role.color}30`,
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 20,
            fontSize: 11,
            color: role.color,
            lineHeight: 1.7,
          }}
        >
          <strong>Demo:</strong> {DEMO_CREDENTIALS[selectedRole].email}<br />
          <strong>Pass:</strong> {DEMO_CREDENTIALS[selectedRole].password}
        </div>

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              fontSize: 11, letterSpacing: 2, color: "#6b8f78",
              textTransform: "uppercase", display: "block", marginBottom: 8,
            }}
          >
            Email Address
          </label>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute", left: 14, top: "50%",
                transform: "translateY(-50%)", color: "#3d6b52", fontSize: 15,
              }}
            >
              ✉
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="your@email.com"
              disabled={locked}
              style={{
                width: "100%",
                padding: "12px 14px 12px 38px",
                background: "#0a0f0d",
                border: "1.5px solid rgba(37,164,98,0.2)",
                borderRadius: 8,
                color: "#e8f5ee",
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                transition: "border-color 0.2s ease",
                opacity: locked ? 0.5 : 1,
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = role.color)}
              onBlur={(e) => (e.target.style.borderColor = "rgba(37,164,98,0.2)")}
            />
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              fontSize: 11, letterSpacing: 2, color: "#6b8f78",
              textTransform: "uppercase", display: "block", marginBottom: 8,
            }}
          >
            Password
          </label>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute", left: 14, top: "50%",
                transform: "translateY(-50%)", color: "#3d6b52", fontSize: 15,
              }}
            >
              🔒
            </span>
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="••••••••"
              disabled={locked}
              style={{
                width: "100%",
                padding: "12px 44px 12px 38px",
                background: "#0a0f0d",
                border: "1.5px solid rgba(37,164,98,0.2)",
                borderRadius: 8,
                color: "#e8f5ee",
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                transition: "border-color 0.2s ease",
                opacity: locked ? 0.5 : 1,
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = role.color)}
              onBlur={(e) => (e.target.style.borderColor = "rgba(37,164,98,0.2)")}
            />
            <button
              onClick={() => setShowPass(!showPass)}
              style={{
                position: "absolute", right: 14, top: "50%",
                transform: "translateY(-50%)",
                background: "none", border: "none",
                cursor: "pointer", color: "#3d6b52", fontSize: 14,
              }}
            >
              {showPass ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "rgba(224,82,82,0.1)",
              border: "1px solid rgba(224,82,82,0.3)",
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 16,
              fontSize: 12,
              color: "#e05252",
              animation: "slideUp 0.3s ease",
            }}
          >
            ⚠ {error}
          </div>
        )}

        {/* Attempt indicator */}
        {attempts > 0 && !locked && (
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1, height: 3, borderRadius: 2,
                  background: i < attempts ? "#e05252" : "rgba(37,164,98,0.2)",
                  transition: "background 0.3s ease",
                }}
              />
            ))}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleLogin}
          disabled={loading || locked || !email || !password}
          style={{
            width: "100%",
            padding: "14px",
            background: loading
              ? "transparent"
              : `linear-gradient(135deg, ${role.color}, ${role.color}cc)`,
            border: loading ? `1.5px solid ${role.color}` : "none",
            borderRadius: 8,
            color: loading ? role.color : "#060d09",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            cursor: locked || !email || !password ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
            opacity: !email || !password ? 0.5 : 1,
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {loading ? (
            <>
              <div
                style={{
                  width: 16, height: 16, borderRadius: "50%",
                  border: `2px solid ${role.color}`,
                  borderTopColor: "transparent",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              Authenticating...
            </>
          ) : locked ? "🔒 Account Locked" : `Sign In as ${role.label}`}
        </button>

        {/* Mobile capabilities strip */}
        {isMobile && (
          <div
            style={{
              marginTop: 28,
              padding: "16px",
              background: "rgba(17,26,21,0.6)",
              borderRadius: 10,
              border: "1px solid rgba(37,164,98,0.1)",
            }}
          >
            <div
              style={{
                fontSize: 10, letterSpacing: 2, color: "#6b8f78",
                textTransform: "uppercase", marginBottom: 12,
              }}
            >
              Role Capabilities
            </div>
            {ROLE_CAPABILITIES.map((r) => (
              <div
                key={r.role}
                style={{
                  display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
                  opacity: selectedRole === r.role.toLowerCase().replace(" ", "_") ? 1 : 0.35,
                  transition: "opacity 0.3s ease",
                }}
              >
                <div
                  style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: r.color, flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 11, color: r.color, fontWeight: 600, marginRight: 4 }}>
                  {r.role}
                </span>
                <span style={{ fontSize: 10, color: "#6b8f78" }}>
                  {r.perms.join(" · ")}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop: "1px solid rgba(37,164,98,0.1)",
            textAlign: "center",
            fontSize: 11,
            color: "#3d6b52",
            lineHeight: 2,
          }}
        >
          Turf Management System · Initial Release v1.0<br />
          Secured with SSL + JWT · Session: 8hrs
        </div>
      </div>
    </div>
  );
}
