import { P, type PermissionCode } from "./permission-codes";

/**
 * Fallback IAM codenames when a lab role exists in the DB but has no RolePermission rows yet.
 * Keeps student/manager navigation usable until org roles are fully provisioned.
 */
/** Students (Lab Member): view-only lab operations — no scan, cart, or orders. */
export const LAB_MEMBER_PERMISSIONS: PermissionCode[] = [
  P.LABS_READ,
  P.PROJECTS_READ,
  P.MACHINES_READ,
  P.INVENTORY_READ,
  P.ATTENDANCE_READ,
];

export const ROLE_DEFAULT_PERMISSIONS: Record<string, PermissionCode[]> = {
  "lab member": LAB_MEMBER_PERMISSIONS,
  researcher: [
    P.LABS_READ,
    P.PROJECTS_READ,
    P.PROJECTS_WRITE,
    P.PROJECTS_ORDER,
    P.MACHINES_READ,
    P.MACHINES_RESERVE,
    P.INVENTORY_READ,
    P.ATTENDANCE_READ,
  ],
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

export function defaultPermissionsForRole(roleName: string): string[] {
  const key = roleName.trim().toLowerCase();
  return ROLE_DEFAULT_PERMISSIONS[key] ?? [];
}

export function mergeRolePermissions(apiPermissions: string[], roleName: string): string[] {
  const key = roleName.trim().toLowerCase();
  const base =
    apiPermissions.length > 0 ? apiPermissions : defaultPermissionsForRole(roleName);
  if (key === "lab member") {
    const allowed = new Set<string>(LAB_MEMBER_PERMISSIONS);
    return base.filter((codename) => allowed.has(codename));
  }
  return base;
}
