import type { Permissions } from "@/types/settings";

// Turns turf-api's generated route list ("PUT /admin/settings/venue") into a
// per-area summary of what each role can do. GET = view; anything else = change.

export type Access = "view" | "change";

export interface PermissionItem {
  access: Access;
  /** The path after /admin, e.g. "settings/venue/logo". */
  path: string;
}

export interface RoleAccess {
  view: boolean;
  /** "all" when the role can make every change in the area. */
  change: "all" | "some" | "none";
}

export interface PermissionArea {
  area: string;
  admin: RoleAccess;
  manager: RoleAccess;
  /** Routes only admins can use, view routes first. */
  adminOnly: PermissionItem[];
}

const AREA_BY_SEGMENT: Record<string, string> = {
  dashboard: "Dashboard",
  bookings: "Bookings",
  "booking-events": "Bookings",
  slots: "Slots",
  "slot-events": "Slots",
  closures: "Slots",
  grounds: "Grounds",
  customers: "Customers",
  reports: "Reports",
  settings: "Settings",
  users: "Staff",
  system: "System",
  auth: "Your account",
};

const AREA_ORDER = Object.values(AREA_BY_SEGMENT).filter((a, i, all) => all.indexOf(a) === i);

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");

function parseRoute(route: string): { area: string; item: PermissionItem } {
  const [method, fullPath = ""] = route.split(" ");
  const path = fullPath.replace(/^\/admin\/?/, "");
  const segment = path.split("/")[0] ?? "";
  return {
    area: AREA_BY_SEGMENT[segment] ?? titleCase(segment),
    item: { access: method === "GET" ? "view" : "change", path },
  };
}

function roleAccess(routes: Set<string>, areaRoutes: string[]): RoleAccess {
  const changes = areaRoutes.filter((r) => !r.startsWith("GET "));
  const allowed = changes.filter((r) => routes.has(r)).length;
  return {
    view: areaRoutes.some((r) => r.startsWith("GET ") && routes.has(r)),
    change: allowed === 0 ? "none" : allowed === changes.length ? "all" : "some",
  };
}

const areaRank = (area: string) => {
  const i = AREA_ORDER.indexOf(area);
  return i === -1 ? AREA_ORDER.length : i;
};

const accessRank = (access: Access) => (access === "view" ? 0 : 1);

/** Admin-only routes as view/change items; POST and PUT on one path collapse into one "change". */
function adminOnlyItems(routes: string[], adminSet: Set<string>, managerSet: Set<string>): PermissionItem[] {
  const items = new Map<string, PermissionItem>();
  for (const r of routes) {
    if (!adminSet.has(r) || managerSet.has(r)) continue;
    const { item } = parseRoute(r);
    items.set(`${item.access} ${item.path}`, item);
  }
  return [...items.values()].sort((a, b) => accessRank(a.access) - accessRank(b.access) || a.path.localeCompare(b.path));
}

/** One row per area, in a fixed order (unknown areas last). */
export function groupPermissions({ admin, manager }: Permissions): PermissionArea[] {
  const adminSet = new Set(admin);
  const managerSet = new Set(manager);
  const byArea = new Map<string, string[]>();
  for (const route of new Set([...admin, ...manager])) {
    const { area } = parseRoute(route);
    byArea.set(area, [...(byArea.get(area) ?? []), route]);
  }

  return [...byArea.entries()]
    .sort(([a], [b]) => areaRank(a) - areaRank(b) || a.localeCompare(b))
    .map(([area, routes]) => ({
      area,
      admin: roleAccess(adminSet, routes),
      manager: roleAccess(managerSet, routes),
      adminOnly: adminOnlyItems(routes, adminSet, managerSet),
    }));
}

/** "View and change", "View, some changes", "View only", "No access". */
export function describeAccess({ view, change }: RoleAccess): string {
  if (!view && change === "none") return "No access";
  if (change === "none") return "View only";
  const changeText = change === "all" ? "change" : "some changes";
  return view ? `View, ${changeText}` : titleCase(changeText);
}
