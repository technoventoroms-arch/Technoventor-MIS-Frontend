export type LabNavPersona = "org-admin" | "lab-manager" | "lab-member" | "other";

export function resolveLabNavPersona(
  isOrgAdmin: boolean,
  roleName: string
): LabNavPersona {
  if (isOrgAdmin) return "org-admin";
  const key = roleName.trim().toLowerCase();
  if (key === "lab manager") return "lab-manager";
  if (key === "lab member") return "lab-member";
  return "other";
}
