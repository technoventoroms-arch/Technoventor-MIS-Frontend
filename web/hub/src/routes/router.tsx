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
      Loading admin workspace...
    </div>
  );
}

const page = (exportName: keyof typeof import("@/premium/pages")) =>
  lazyElement(() => import("@/premium/pages"), exportName);

const routes: RouteObject[] = [
  {
    path: "login",
    element: <PublicOnlyRoute />,
    children: [{ index: true, element: page("HubLoginPage") }],
  },
  {
    path: "",
    element: <AuthenticatedRoute />,
    children: [
      {
        path: "",
        element: page("HubShell"),
        children: [
          { index: true, element: page("RedirectToDashboard") },
          { path: "dashboard", element: page("PlatformDashboardPage") },
          { path: "organisations", element: page("OrganisationsPage") },
          { path: "organizations", element: page("OrganisationsPage") },
          { path: "organisations/:orgId", element: page("OrganisationDetailPage") },
          { path: "organizations/:orgId", element: page("OrganisationDetailPage") },
          {
            path: "organisations/:orgId/labs/:labId",
            element: page("LabOperationsPage"),
          },
          {
            path: "organizations/:orgId/labs/:labId",
            element: page("LabOperationsPage"),
          },
          {
            path: ":orgId/lab/:labId",
            element: page("LabOperationsPage"),
          },
          { path: "plans", element: page("PlansPage") },
          { path: "system/health", element: page("SystemHealthPage") },
          { path: "unauthorized", element: page("NotFoundPage") },
        ],
      },
    ],
  },
  {
    path: "/not-found",
    element: page("NotFoundPage"),
  },
  {
    path: "*",
    element: page("NotFoundPage"),
  },
];

export default routes;
