"use client";

import { Suspense, useEffect, useState } from "react";
import { LoginForm } from "@/components/features/login/login-form";
import {
  LoginBrandPanel,
  LoginMobileHeader,
  RoleCapabilities,
} from "@/components/features/login/login-branding";
import { LOGIN_COLORS as C } from "@/components/features/login/login-theme";

const GLOBAL_STYLES = `
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
  input:focus, button:focus { outline: none; }
  .login-input:focus { border-color: ${C.accent} !important; }
  ::-webkit-scrollbar { display: none; }
`;

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

function Backdrop({ isMobile }: { isMobile: boolean }) {
  const orbs = [
    { size: isMobile ? 250 : 400, top: "-10%", left: "-8%", color: "rgba(26,122,74,0.12)", delay: "0s" },
    { size: isMobile ? 200 : 300, bottom: "-5%", right: "-5%", color: "rgba(37,164,98,0.08)", delay: "3s" },
    { size: isMobile ? 150 : 200, top: "40%", right: "10%", color: "rgba(46,204,113,0.06)", delay: "1.5s" },
  ];
  return (
    <>
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 0,
          background: `repeating-linear-gradient(180deg,
            rgba(26,122,74,0.06) 0px, rgba(26,122,74,0.06) 80px,
            transparent 80px, transparent 160px)`,
        }}
      />
      {orbs.map(({ size, color, delay, ...pos }, i) => (
        <div
          key={i}
          style={{
            position: "fixed", borderRadius: "50%", width: size, height: size, ...pos,
            background: `radial-gradient(circle, ${color}, transparent 70%)`,
            animation: "drift 8s ease-in-out infinite", animationDelay: delay, zIndex: 0,
          }}
        />
      ))}
    </>
  );
}

function FormHeader({ isMobile }: { isMobile: boolean }) {
  return (
    <div style={{ marginBottom: isMobile ? 28 : 40, marginTop: isMobile ? 32 : 0 }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: C.muted, textTransform: "uppercase", marginBottom: 8 }}>
        Secure Login
      </div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? 28 : 32, letterSpacing: 2 }}>
        ADMIN PANEL
      </div>
    </div>
  );
}

export default function LoginPage() {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  return (
    <div
      style={{
        minHeight: "100vh", background: "#060d09", display: "flex",
        flexDirection: isMobile ? "column" : "row", fontFamily: "'DM Sans', sans-serif",
        color: C.text, position: "relative", overflow: "hidden",
      }}
    >
      <style>{GLOBAL_STYLES}</style>
      <Backdrop isMobile={isMobile} />

      {isMobile ? <LoginMobileHeader /> : <LoginBrandPanel compact={isTablet} />}

      <div
        style={{
          width: isMobile ? "100%" : "30%",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: isMobile ? "flex-start" : "center",
          padding: isMobile ? "40px 24px" : isTablet ? "48px 36px" : "60px 48px",
          background: isMobile ? "transparent" : "rgba(17,26,21,0.8)",
          backdropFilter: isMobile ? "none" : "blur(20px)",
          borderLeft: isMobile ? "none" : "1px solid rgba(37,164,98,0.12)",
          position: "relative",
          zIndex: 1,
          animation: "slideUp 0.6s ease",
        }}
      >
        <FormHeader isMobile={isMobile} />

        {/* useSearchParams in LoginForm needs a Suspense boundary */}
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

        {isMobile && (
          <div
            style={{
              marginTop: 28, padding: 16, background: "rgba(17,26,21,0.6)",
              borderRadius: 10, border: "1px solid rgba(37,164,98,0.1)",
            }}
          >
            <RoleCapabilities small />
          </div>
        )}

        <div
          style={{
            marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(37,164,98,0.1)",
            textAlign: "center", fontSize: 11, color: C.faint, lineHeight: 2,
          }}
        >
          Turf Management System · Initial Release v1.0<br />
          Secured with SSL + JWT · Session: 8hrs
        </div>
      </div>
    </div>
  );
}
