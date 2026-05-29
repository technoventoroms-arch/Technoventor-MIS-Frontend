import { lazy, Suspense, type ComponentType } from "react";
import { RouteObject } from "react-router-dom";
import { AuthenticatedRoute, PublicOnlyRoute } from "@/premium/auth";

function lazyElement<T extends Record<string, unknown>>(
  loader: () => Promise<T>,
  exportName: keyof T
) {
  const Component = lazy(async () => {
    const module = await loader();
    return { default: module[exportName] as ComponentType };
  });

  return (
    <Suspense fallback={<RouteFallback />}>
      <Component />
    </Suspense>
  );
}

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500 dark:text-slate-400">
      Loading workspace…
    </div>
  );
}

const page = (exportName: keyof typeof import("@/premium/pages")) =>
  lazyElement(() => import("@/premium/pages"), exportName);

const workflowPage = (exportName: keyof typeof import("@/premium/workflow-pages")) =>
  lazyElement(() => import("@/premium/workflow-pages"), exportName);

const accountPage = (exportName: keyof typeof import("@/premium/account-pages")) =>
  lazyElement(() => import("@/premium/account-pages"), exportName);

const routes: RouteObject[] = [
  {
    path: "login",
    element: <PublicOnlyRoute />,
    children: [{ index: true, element: page("LoginPage") }],
  },
  {
    path: "register",
    element: <PublicOnlyRoute />,
    children: [{ index: true, element: page("RegisterPage") }],
  },
  {
    path: "",
    element: <AuthenticatedRoute />,
    children: [
      {
        path: "",
        element: page("MisShell"),
        children: [
          { index: true, element: page("OrganisationSwitcherPage") },
          { path: "profile", element: accountPage("ProfilePage") },
          { path: "request_lab", element: workflowPage("RequestLabPage") },
          {
            path: "create-organization",
            element: workflowPage("CreateOrganisationPage"),
          },
          {
            path: "create-organizations",
            element: workflowPage("CreateOrganisationPage"),
          },
          { path: ":orgId", element: page("RedirectToOrgDashboard") },
          { path: ":orgId/dashboard", element: page("OrgDashboardPage") },
          { path: ":orgId/settings", element: accountPage("OrganisationSettingsPage") },
          { path: ":orgId/organization", element: accountPage("OrganisationSettingsPage") },
          { path: ":orgId/organization/transactions", element: workflowPage("BillingPage") },
          { path: ":orgId/reports", element: accountPage("ReportsPage") },
          { path: ":orgId/labs", element: workflowPage("LabsPage") },
          {
            path: ":orgId/labs/new",
            element: workflowPage("LabsPage"),
          },
          { path: ":orgId/users", element: workflowPage("OrgUsersPage") },
          { path: ":orgId/billing", element: workflowPage("BillingPage") },
          { path: ":orgId/billing/plans", element: workflowPage("BillingPage") },
          { path: ":orgId/subscription", element: workflowPage("BillingPage") },
          { path: ":orgId/transactions", element: workflowPage("BillingPage") },
          {
            path: ":orgId/lab/:labId",
            element: page("LabDashboardPage"),
          },
          { path: ":orgId/lab/:labId/dashboard", element: page("LabDashboardPage") },
          { path: ":orgId/lab/:labId/users", element: workflowPage("LabMembersPage") },
          { path: ":orgId/lab/:labId/users/:userId/attendance", element: workflowPage("AttendancePage") },
          { path: ":orgId/lab/:labId/inventory", element: workflowPage("InventoryPage") },
          { path: ":orgId/lab/:labId/inventory/:itemId", element: workflowPage("InventoryPage") },
          { path: ":orgId/lab/:labId/machines", element: workflowPage("MachinesPage") },
          { path: ":orgId/lab/:labId/machine", element: workflowPage("MachinesPage") },
          { path: ":orgId/lab/:labId/machine/:machineId", element: workflowPage("MachineSchedulePage") },
          { path: ":orgId/lab/:labId/machine/:machineId/details", element: workflowPage("MachineDetailsPage") },
          { path: ":orgId/lab/:labId/machine/:machineId/logs", element: workflowPage("MachineLogsPage") },
          { path: ":orgId/lab/:labId/projects", element: workflowPage("ProjectsPage") },
          { path: ":orgId/lab/:labId/projects/:projectId", element: workflowPage("ProjectDetailsPage") },
          { path: ":orgId/lab/:labId/attendance", element: workflowPage("AttendancePage") },
          { path: ":orgId/lab/:labId/approvals", element: workflowPage("ApprovalsPage") },
          { path: ":orgId/lab/:labId/approval", element: workflowPage("ApprovalsPage") },
          { path: ":orgId/lab/:labId/cart", element: workflowPage("CartPage") },
          { path: ":orgId/lab/:labId/orders", element: workflowPage("MyOrdersPage") },
          { path: ":orgId/lab/:labId/notifications", element: workflowPage("NotificationsPage") },
          { path: ":orgId/lab/:labId/scan-machine", element: workflowPage("ScanMachinePage") },
          { path: ":orgId/lab/:labId/settings", element: accountPage("LabSettingsPage") },
          { path: ":orgId/lab/:labId/edit-lab", element: accountPage("LabSettingsPage") },
          { path: ":orgId/lab/:labId/reports", element: accountPage("ReportsPage") },
          { path: "not-found", element: page("NotFoundPage") },
        ],
      },
    ],
  },
  {
    path: "*",
    element: page("NotFoundPage"),
  },
];

export default routes;
