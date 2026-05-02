export type Role   = "manager" | "attendant";
export type Ground = "Ground A" | "Ground B" | "Ground C";

export interface StaffMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
  ground: Ground | "";
  active: boolean;
}

export const GROUNDS: Ground[] = ["Ground A", "Ground B", "Ground C"];

export const ROLE_META: Record<Role, {
  label: string; icon: string; colorClass: string;
  badgeClass: string; dotColor: string;
  permissions: { label: string; allowed: boolean }[];
}> = {
  manager: {
    label: "Manager",
    icon: "◈",
    colorClass: "text-blue-700 dark:text-blue-400",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
    dotColor: "#3b82f6",
    permissions: [
      { label: "View Dashboard",            allowed: true  },
      { label: "Manage Bookings & Refunds", allowed: true  },
      { label: "Block Time Slots",          allowed: true  },
      { label: "View Reports & Export",     allowed: true  },
      { label: "Manage Staff",              allowed: true  },
      { label: "Manage Grounds & Pricing",  allowed: false },
      { label: "Add / Remove Admin Users",  allowed: false },
    ],
  },
  attendant: {
    label: "Attendant",
    icon: "◇",
    colorClass: "text-emerald-700 dark:text-emerald-400",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
    dotColor: "#10b981",
    permissions: [
      { label: "Block Time Slots",          allowed: true  },
      { label: "View Dashboard",            allowed: false },
      { label: "Manage Bookings & Refunds", allowed: false },
      { label: "View Reports & Export",     allowed: false },
      { label: "Manage Staff",              allowed: false },
      { label: "Manage Grounds & Pricing",  allowed: false },
      { label: "Add / Remove Admin Users",  allowed: false },
    ],
  },
};

export const MOCK_STAFF: StaffMember[] = [
  { id: 1,  name: "Tanvir Ahmed",   email: "tanvir@turf.com",    phone: "+880 1711-000001", role: "manager",   ground: "Ground A", active: true  },
  { id: 2,  name: "Sabbir Hossain", email: "sabbir@turf.com",    phone: "+880 1711-000002", role: "attendant", ground: "Ground A", active: true  },
  { id: 3,  name: "Rasel Mia",      email: "rasel@turf.com",     phone: "+880 1711-000003", role: "attendant", ground: "Ground B", active: true  },
  { id: 4,  name: "Nusrat Jahan",   email: "nusrat@turf.com",    phone: "+880 1711-000004", role: "manager",   ground: "Ground B", active: true  },
  { id: 5,  name: "Karim Uddin",    email: "karim@turf.com",     phone: "+880 1711-000005", role: "attendant", ground: "Ground C", active: false },
  { id: 6,  name: "Farhana Begum",  email: "farhana@turf.com",   phone: "+880 1711-000006", role: "attendant", ground: "Ground C", active: true  },
  { id: 7,  name: "Mosharraf Ali",  email: "mosharraf@turf.com", phone: "+880 1711-000007", role: "manager",   ground: "Ground A", active: true  },
  { id: 8,  name: "Liton Das",      email: "liton@turf.com",     phone: "+880 1711-000008", role: "attendant", ground: "Ground B", active: true  },
  { id: 9,  name: "Shirin Akter",   email: "shirin@turf.com",    phone: "+880 1711-000009", role: "attendant", ground: "Ground C", active: false },
  { id: 10, name: "Jahirul Islam",  email: "jahirul@turf.com",   phone: "+880 1711-000010", role: "manager",   ground: "Ground B", active: true  },
  { id: 11, name: "Mitu Khatun",    email: "mitu@turf.com",      phone: "+880 1711-000011", role: "attendant", ground: "Ground A", active: true  },
  { id: 12, name: "Rubel Hossain",  email: "rubel@turf.com",     phone: "+880 1711-000012", role: "attendant", ground: "Ground C", active: true  },
];

export const AVATAR_PALETTE = [
  "var(--primary)", "var(--chart-3)", "var(--chart-2)", "var(--chart-4)", "var(--chart-5)",
];

export function avatarColor(name: string) {
  return AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];
}

export function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}
