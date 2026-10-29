// Shared colours for the login screen (it uses its own dark pitch look, not the app theme).
export const LOGIN_COLORS = {
  accent: "#25a462",
  accentDark: "#1a7a4a",
  text: "#e8f5ee",
  muted: "#6b8f78",
  faint: "#3d6b52",
  inputBg: "#0a0f0d",
  border: "rgba(37,164,98,0.2)",
  danger: "#e05252",
};

export const ROLE_CAPABILITIES = [
  { role: "Admin", color: "#f0c040", perms: ["Full dashboard", "Grounds & pricing", "Managers", "Reports"] },
  { role: "Manager", color: "#4db8ff", perms: ["Bookings & refunds", "Block slots"] },
];
