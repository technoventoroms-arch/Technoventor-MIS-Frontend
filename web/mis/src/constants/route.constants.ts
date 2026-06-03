export const routeConstants = {
  DASHBOARD: "dashboard",
  USERS: "users",
  LABS: "labs",
  LAB: "lab",
  PROJECTS: "projects",
  INVENTORY: "inventory",
  MACHINES: "machine",
  LOGIN: "login",
  SIGN_UP: "sign-up",
  APPROVALS: "approval",
  EDIT_LAB: "edit-lab",
  PROFILE: "profile",
  ORDERS: "orders",
  ATTENDANCE: "attendance",
  SCAN_MACHINE: "scan-machine",
  LOGS: "logs",
  UNAUTHORIZED: "unauthorized",
  DETAILS: "details",
  NOT_FOUND: "not-found",
  SUBSCRIPTION: "subscription",
  REGISTER: "register",

  PRIVACY_POLICY: "privacy-policy",
  REFUND_POLICY: "refund-policy",
  TERMS_OF_SERVICE: "terms-of-service",

  PAYMENT_SUCCESSFUL: "payment-successful",
  CHANGE_PLAN: "change-plan",

  ORGANIZATIONS: "organizations",
  ORGANIZATION: "organization",
  CREATE_ORGANIZATIONS: "create-organizations",
  TRANSACTIONS: "transactions",

  REQUEST_LAB: "request_lab",
} as const;

export const routeParams = {
  LAB_ID: "labId",
  TAB_ID: "tabId",
  APPROVAL_TAB: "approvalTab",
  INVENTORY_TAB: "inventory-request",
  ATTENDANCE_TAB: "attendance-request",
  LAB_JOIN_TAB: "lab-join-request",
};
