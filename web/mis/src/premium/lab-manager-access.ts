import type { Entity } from "@mono/api_client";

export function entityLabel(row: Partial<Entity> | undefined): string {
  if (!row) return "Unknown";
  const name = row.name ?? row.title;
  if (typeof name === "string" && name.trim()) return name;
  const user = row.user as Entity | undefined;
  if (user) {
    const full = [user.first_name, user.last_name].filter(Boolean).join(" ");
    if (full) return full;
    if (user.email) return String(user.email);
  }
  return String(row.id ?? "Unknown");
}

export function normalizeRoleKey(roleName: string): string {
  const key = roleName.trim().toLowerCase();
  if (key === "lab member") return "researcher";
  return key;
}

export function isLabManagerRoleName(roleName: string): boolean {
  const key = normalizeRoleKey(roleName);
  return key === "lab manager";
}

export function isLabManagerRoleId(roleId: string, roles: Entity[]): boolean {
  if (!roleId) return false;
  const role = roles.find((row) => String(row.id) === String(roleId));
  return role ? isLabManagerRoleName(entityLabel(role)) : false;
}

export function inventoryAccessHelperText(labName?: string): string {
  return labName
    ? `Can create, edit, adjust stock, and manage categories/units for ${labName}.`
    : "Can create, edit, adjust stock, and manage categories/units for this lab.";
}
