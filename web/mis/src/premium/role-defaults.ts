import { P, type PermissionCode } from "./permission-codes";

/**
 * Fallback IAM codenames when a lab role exists in the DB but has no RolePermission rows yet.
 * "Lab Member" is legacy; it is treated as Researcher everywhere in the app.
 */
export const RESEARCHER_PERMISSIONS: PermissionCode[] = [
  P.LABS_READ,
  P.PROJECTS_READ,
  P.PROJECTS_WRITE,
  P.PROJECTS_ORDER,
  P.MACHINES_READ,
  P.MACHINES_RESERVE,
  P.INVENTORY_READ,
  P.ATTENDANCE_READ,
];

export const ROLE_DEFAULT_PERMISSIONS: Record<string, PermissionCode[]> = {
  researcher: RESEARCHER_PERMISSIONS,
  "lab manager": [
    P.LABS_READ,
    P.LABS_WRITE,
    P.LABS_RFID,
    P.PROJECTS_READ,
    P.PROJECTS_WRITE,
    P.MACHINES_READ,
    P.MACHINES_WRITE,
    P.MACHINES_RESERVE,
    P.MACHINES_STATUS,
    P.INVENTORY_READ,
    P.INVENTORY_WRITE,
    P.USERS_READ,
    P.USERS_WRITE,
    P.ATTENDANCE_READ,
    P.ATTENDANCE_WRITE,
    P.SETTINGS_READ,
    P.SETTINGS_WRITE,
    P.REPORTS_READ,
  ],
};

export function normalizeRoleKey(roleName: string): string {
  const key = roleName.trim().toLowerCase();
  if (key === "lab member") return "researcher";
  return key;
}

export function defaultPermissionsForRole(roleName: string): string[] {
  const key = normalizeRoleKey(roleName);
  return ROLE_DEFAULT_PERMISSIONS[key] ?? [];
}

export function mergeRolePermissions(apiPermissions: string[], roleName: string): string[] {
  const key = normalizeRoleKey(roleName);
  const base =
    apiPermissions.length > 0 ? apiPermissions : defaultPermissionsForRole(roleName);
  if (key === "researcher") {
    const allowed = new Set<string>(RESEARCHER_PERMISSIONS);
    return [...new Set([...base, ...RESEARCHER_PERMISSIONS])].filter((codename) =>
      allowed.has(codename)
    );
  }
  return base;
}
