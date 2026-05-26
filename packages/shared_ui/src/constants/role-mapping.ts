export const roleId = {
  ORG_ADMIN: 2,
  ADMIN: 3,
  MANAGER: 4,
  USER: 5,
};
export const roleName = {
  ORG_ADMIN: "org_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  USER: "user",
};
export const roleMapping = {
  [roleName.USER]: roleId.USER,
  [roleName.MANAGER]: roleId.MANAGER,
};
