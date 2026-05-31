/** Backend IAM codenames (`module:action`) from seed_lrp / role assignments. */
export const P = {
  INVENTORY_READ: "inventory:read",
  INVENTORY_WRITE: "inventory:write",
  MACHINES_READ: "machines:read",
  MACHINES_WRITE: "machines:write",
  MACHINES_RESERVE: "machines:reserve",
  MACHINES_STATUS: "machines:status_log",
  PROJECTS_READ: "projects:read",
  PROJECTS_WRITE: "projects:write",
  PROJECTS_ORDER: "projects:order",
  LABS_READ: "labs:read",
  LABS_WRITE: "labs:write",
  LABS_RFID: "labs:rfid",
  USERS_READ: "users:read",
  USERS_WRITE: "users:write",
  ATTENDANCE_READ: "attendance:read",
  ATTENDANCE_WRITE: "attendance:write",
  BILLING_READ: "billing:read",
  BILLING_WRITE: "billing:write",
  REPORTS_READ: "reports:read",
  SETTINGS_READ: "settings:read",
  SETTINGS_WRITE: "settings:write",
} as const;

export type PermissionCode = (typeof P)[keyof typeof P];
