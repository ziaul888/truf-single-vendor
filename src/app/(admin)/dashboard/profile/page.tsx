"use client";

import { useState } from "react";

const CURRENT_USER = {
  role: "manager" as RoleKey,
};

type RoleKey = "super_admin" | "manager" | "attendant";

interface Permission {
  label: string;
  allowed: boolean;
}

interface RoleConfig {
  label: string;
  badge: string;
  icon: string;
  colorVar: string;
  bgClass: string;
  badgeBgClass: string;
  permissions: Permission[];
  canEdit: string[];
}

const ROLE_CONFIG: Record<RoleKey, RoleConfig> = {
  super_admin: {
    label: "Super Admin",
    badge: "SUPER ADMIN",
    icon: "⬡",
    colorVar: "var(--warning-foreground)",
    bgClass: "bg-warning/10 border-warning/40",
    badgeBgClass: "bg-warning/15 border-warning/30 text-warning-foreground",
    permissions: [
      { label: "View Dashboard", allowed: true },
      { label: "Manage Grounds & Pricing", allowed: true },
      { label: "Manage Bookings & Refunds", allowed: true },
      { label: "Block Time Slots", allowed: true },
      { label: "View Reports & Export", allowed: true },
      { label: "Manage Staff", allowed: true },
      { label: "Add / Remove Admin Users", allowed: true },
      { label: "Process Refunds", allowed: true },
    ],
    canEdit: ["name", "email", "phone", "ground"],
  },
  manager: {
    label: "Manager",
    badge: "MANAGER",
    icon: "◈",
    colorVar: "var(--chart-3)",
    bgClass: "bg-[color-mix(in_oklch,var(--chart-3)_15%,transparent)] border-[color-mix(in_oklch,var(--chart-3)_30%,transparent)]",
    badgeBgClass: "bg-[color-mix(in_oklch,var(--chart-3)_12%,transparent)] border-[color-mix(in_oklch,var(--chart-3)_25%,transparent)]",
    permissions: [
      { label: "View Dashboard", allowed: true },
      { label: "Manage Grounds & Pricing", allowed: false },
      { label: "Manage Bookings & Refunds", allowed: true },
      { label: "Block Time Slots", allowed: true },
      { label: "View Reports & Export", allowed: true },
      { label: "Manage Staff", allowed: true },
      { label: "Add / Remove Admin Users", allowed: false },
      { label: "Process Refunds", allowed: true },
    ],
    canEdit: ["name", "phone"],
  },
  attendant: {
    label: "Attendant",
    badge: "ATTENDANT",
    icon: "◇",
    colorVar: "var(--primary)",
    bgClass: "bg-primary/10 border-primary/30",
    badgeBgClass: "bg-primary/10 border-primary/25 text-primary",
    permissions: [
      { label: "View Dashboard", allowed: false },
      { label: "Manage Grounds & Pricing", allowed: false },
      { label: "Manage Bookings & Refunds", allowed: false },
      { label: "Block Time Slots", allowed: true },
      { label: "View Reports & Export", allowed: false },
      { label: "Manage Staff", allowed: false },
      { label: "Add / Remove Admin Users", allowed: false },
      { label: "Process Refunds", allowed: false },
    ],
    canEdit: ["phone"],
  },
};

const USER_DATA: Record<RoleKey, {
  name: string; email: string; phone: string;
  joined: string; lastLogin: string; avatar: string; ground: string;
}> = {
  super_admin: { name: "Rafiul Islam", email: "admin@turf.com", phone: "+880 1711-000001", joined: "Jan 12, 2025", lastLogin: "Today, 9:41 AM", avatar: "RI", ground: "All Grounds" },
  manager: { name: "Tanvir Ahmed", email: "manager@turf.com", phone: "+880 1711-000002", joined: "Feb 3, 2025", lastLogin: "Today, 8:15 AM", avatar: "TA", ground: "Ground A & B" },
  attendant: { name: "Sabbir Hossain", email: "staff@turf.com", phone: "+880 1711-000003", joined: "Mar 20, 2025", lastLogin: "Yesterday, 6:30 PM", avatar: "SH", ground: "Ground C" },
};

interface EditableFieldProps {
  label: string;
  fieldKey: string;
  value: string;
  canEdit: string[];
  colorVar: string;
  onSave: (val: string) => void;
}

function EditableField({ label, fieldKey, value, canEdit, colorVar, onSave }: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const editable = canEdit.includes(fieldKey);

  return (
    <div className="py-4 border-b border-border last:border-0">
      <div className="text-[10px] tracking-widest text-muted-foreground uppercase mb-1.5">{label}</div>
      {editing ? (
        <div className="flex gap-2 mt-1">
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            autoFocus
            className="flex-1 px-3 py-2 rounded-lg text-sm bg-background text-foreground outline-none border"
            style={{ borderColor: colorVar }}
          />
          <button
            onClick={() => { onSave(val); setEditing(false); }}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: colorVar }}
          >
            Save
          </button>
          <button
            onClick={() => { setVal(value); setEditing(false); }}
            className="px-3 py-2 rounded-lg bg-muted text-muted-foreground text-sm"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-sm font-medium text-foreground">{val}</span>
          {editable ? (
            <button
              onClick={() => setEditing(true)}
              className="text-[10px] tracking-wide uppercase px-2.5 py-1 rounded-md border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              Edit
            </button>
          ) : (
            <span className="text-[10px] tracking-widest text-muted/60 uppercase">Locked</span>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const roleKey = CURRENT_USER.role;
  const role = ROLE_CONFIG[roleKey];
  const [userData, setUserData] = useState(USER_DATA[roleKey]);
  const [photoHover, setPhotoHover] = useState(false);
  const [toast, setToast] = useState("");

  function handleSave(field: string) {
    return (val: string) => {
      setUserData((prev) => ({ ...prev, [field]: val }));
      setToast("Profile updated successfully");
      setTimeout(() => setToast(""), 2500);
    };
  }

  const grantedCount = role.permissions.filter((p) => p.allowed).length;

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toast-anim { 0%{opacity:0;transform:translate(-50%,10px)} 15%,80%{opacity:1;transform:translate(-50%,0)} 100%{opacity:0;transform:translate(-50%,-8px)} }
        @keyframes popIn { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
        .profile-animate { animation: fadeUp 0.4s ease; }
        .toast-animate { animation: toast-anim 2.5s ease forwards; }
        .pop-in { animation: popIn 0.15s ease; }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 py-8 profile-animate">

        {/* ── Hero card ── */}
        <div className="bg-card rounded-2xl border border-border shadow-sm mb-5 overflow-hidden">
          {/* Role accent bar */}
          <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${role.colorVar}, color-mix(in oklch, ${role.colorVar} 55%, transparent))` }} />

          <div className="p-7 flex items-start gap-6 flex-wrap">
            {/* Avatar */}
            <div
              className="relative shrink-0 cursor-pointer"
              onMouseEnter={() => setPhotoHover(true)}
              onMouseLeave={() => setPhotoHover(false)}
            >
              <div
                className={`w-20 h-20 rounded-full border-2 flex items-center justify-center text-2xl font-bold ${role.bgClass}`}
                style={{ color: role.colorVar, borderColor: role.colorVar }}
              >
                {userData.avatar}
              </div>
              {photoHover && (
                <div className="pop-in absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <span className="text-[10px] text-white font-bold text-center leading-relaxed">📷<br />Change</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-foreground">{userData.name}</h1>
                <span
                  className={`px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest border ${role.badgeBgClass}`}
                  style={{ color: role.colorVar }}
                >
                  {role.badge}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-0.5">{userData.email}</p>
              <p className="text-sm text-muted-foreground">
                Ground: <strong className="text-foreground">{userData.ground}</strong>
              </p>

              <div className="flex gap-3 mt-5 flex-wrap">
                {[
                  { label: "Joined", val: userData.joined, icon: "📅" },
                  { label: "Last Login", val: userData.lastLogin, icon: "🕐" },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="bg-muted/50 border border-border rounded-xl px-3.5 py-2.5 flex items-center gap-2.5"
                  >
                    <span className="text-base">{m.icon}</span>
                    <div>
                      <div className="text-[10px] tracking-widest text-muted-foreground uppercase">{m.label}</div>
                      <div className="text-[13px] font-semibold text-foreground">{m.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-column grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Personal Info */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <div className="mb-5">
              <h2 className="text-[17px] font-bold tracking-wide text-foreground uppercase">Personal Info</h2>
              <p className="text-[11px] text-muted-foreground mt-1">
                {role.canEdit.length > 0 ? "Click Edit to update a field" : "All fields are read-only for this role"}
              </p>
            </div>

            {[
              { label: "Full Name", key: "name" },
              { label: "Email Address", key: "email" },
              { label: "Phone Number", key: "phone" },
              { label: "Assigned Ground", key: "ground" },
              { label: "Account Created", key: "joined" },
              { label: "Last Login", key: "lastLogin" },
            ].map((f) => (
              <EditableField
                key={f.key}
                label={f.label}
                fieldKey={f.key}
                value={userData[f.key as keyof typeof userData]}
                canEdit={role.canEdit}
                colorVar={role.colorVar}
                onSave={handleSave(f.key)}
              />
            ))}
          </div>

          {/* Access / Permissions */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <div className="mb-5">
              <h2 className="text-[17px] font-bold tracking-wide text-foreground uppercase">My Access</h2>
              <p className="text-[11px] text-muted-foreground mt-1">Managed by Super Admin only</p>
            </div>

            {role.permissions.map((p) => (
              <div
                key={p.label}
                className="flex items-center justify-between py-2.5 border-b border-border/60 last:border-0"
              >
                <span className={`text-sm ${p.allowed ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {p.label}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide shrink-0 ${
                    p.allowed
                      ? "bg-success/10 text-success"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {p.allowed ? "✓ YES" : "✕ NO"}
                </span>
              </div>
            ))}

            {/* Summary bar */}
            <div className="mt-5 p-4 bg-muted/40 rounded-xl border border-border/60">
              <div className="text-[10px] tracking-widest text-muted-foreground uppercase mb-2.5">Summary</div>
              <div className="flex gap-1.5">
                {role.permissions.map((p, i) => (
                  <div
                    key={i}
                    className="flex-1 h-1.5 rounded-full"
                    style={{ background: p.allowed ? role.colorVar : "var(--muted)" }}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                <strong style={{ color: role.colorVar }}>{grantedCount}</strong> of {role.permissions.length} permissions granted
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast-animate fixed bottom-7 left-1/2 bg-foreground text-background px-5 py-3 rounded-xl text-sm font-semibold shadow-xl flex items-center gap-2 whitespace-nowrap z-50">
          <span className="text-success">✓</span> {toast}
        </div>
      )}
    </div>
  );
}
