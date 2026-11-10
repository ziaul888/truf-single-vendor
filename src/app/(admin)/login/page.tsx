"use client";

import { Suspense } from "react";
import { LoginForm } from "@/components/features/login/login-form";
import {
  LoginBrandPanel,
  LoginMobileHeader,
  RoleCapabilities,
} from "@/components/features/login/login-branding";
import { LOGIN_COLORS as C } from "@/components/features/login/login-theme";
import { usePublicVenue } from "@/hooks/useSettings";

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

// Phone, tablet and desktop layouts are picked by CSS breakpoints (md 768px, lg 1024px), so the
// server-rendered first paint already matches the screen. Inline styles hold only what never changes.
const ORBS = [
  { sizeCls: "h-[250px] w-[250px] md:h-[400px] md:w-[400px]", pos: { top: "-10%", left: "-8%" }, color: "rgba(26,122,74,0.12)", delay: "0s" },
  { sizeCls: "h-[200px] w-[200px] md:h-[300px] md:w-[300px]", pos: { bottom: "-5%", right: "-5%" }, color: "rgba(37,164,98,0.08)", delay: "3s" },
  { sizeCls: "h-[150px] w-[150px] md:h-[200px] md:w-[200px]", pos: { top: "40%", right: "10%" }, color: "rgba(46,204,113,0.06)", delay: "1.5s" },
];

function Backdrop() {
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
      {ORBS.map(({ sizeCls, pos, color, delay }, i) => (
        <div
          key={i}
          className={sizeCls}
          style={{
            position: "fixed", borderRadius: "50%", ...pos,
            background: `radial-gradient(circle, ${color}, transparent 70%)`,
            animation: "drift 8s ease-in-out infinite", animationDelay: delay, zIndex: 0,
          }}
        />
      ))}
    </>
  );
}

function FormHeader() {
  return (
    <div className="mt-8 mb-7 md:mt-0 md:mb-10">
      <div style={{ fontSize: 11, letterSpacing: 3, color: C.muted, textTransform: "uppercase", marginBottom: 8 }}>
        Secure Login
      </div>
      <div className="text-[28px] md:text-[32px]" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2 }}>
        ADMIN PANEL
      </div>
    </div>
  );
}

/** The form column: full width on phones, a 30% glass panel beside the branding from tablet up. */
function FormColumn() {
  return (
    <div
      className={
        "flex w-full shrink-0 flex-col justify-start px-6 py-10 md:w-[30%] md:justify-center md:border-l md:border-l-[rgba(37,164,98,0.12)] " +
        "md:bg-[rgba(17,26,21,0.8)] md:px-9 md:py-12 md:backdrop-blur-[20px] lg:px-12 lg:py-[60px]"
      }
      style={{ position: "relative", zIndex: 1, animation: "slideUp 0.6s ease" }}
    >
      <FormHeader />

      {/* useSearchParams in LoginForm needs a Suspense boundary */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <div
        className="md:hidden"
        style={{
          marginTop: 28, padding: 16, background: "rgba(17,26,21,0.6)",
          borderRadius: 10, border: "1px solid rgba(37,164,98,0.1)",
        }}
      >
        <RoleCapabilities small />
      </div>

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
  );
}

export default function LoginPage() {
  const { data: venue } = usePublicVenue();

  return (
    <div
      className="flex flex-col md:flex-row"
      style={{
        minHeight: "100vh", background: "#060d09", fontFamily: "'DM Sans', sans-serif",
        color: C.text, position: "relative", overflow: "hidden",
      }}
    >
      <style>{GLOBAL_STYLES}</style>
      <Backdrop />
      <LoginMobileHeader venue={venue} />
      <LoginBrandPanel venue={venue} />
      <FormColumn />
    </div>
  );
}
