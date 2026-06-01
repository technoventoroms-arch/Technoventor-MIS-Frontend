export type LabNavPersona = "org-admin" | "lab-manager" | "researcher" | "other";

export function resolveLabNavPersona(
  isOrgAdmin: boolean,
  roleName: string
): LabNavPersona {
  if (isOrgAdmin) return "org-admin";
  const key = roleName.trim().toLowerCase();
  if (key === "lab manager") return "lab-manager";
  if (key === "researcher" || key === "lab member") return "researcher";
  return "other";
}
