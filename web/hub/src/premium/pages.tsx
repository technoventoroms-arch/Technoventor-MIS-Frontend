import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Navigate, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  Boxes,
  Building2,
  CreditCard,
  FlaskConical,
  LayoutDashboard,
  ListChecks,
  Plus,
  Server,
  Settings,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import {
  EmptyState,
  KpiCard,
  PremiumDataTable,
  PremiumShell,
  SectionHeader,
  StatusBadge,
  type PremiumColumn,
  type ShellNavItem,
} from "@mono/shared_ui/components/premium";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Input } from "@mono/shared_ui/components/ui/input";
import { Label } from "@mono/shared_ui/components/ui/label";
import { apiClient, endpoints, normalizeApiError, type Entity } from "@mono/api_client";

import { useAuth } from "./auth";
import { usePagedResource } from "./api-hooks";

type HealthState = {
  status: string;
  checks: Record<string, boolean>;
};

type Metric = {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
};

const adminColumns: PremiumColumn<Entity>[] = [
  {
    key: "name",
    header: "Record",
    render: (row) => (
      <div>
        <p className="font-semibold text-slate-950 dark:text-white">
          {displayName(row)}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          ID {String(row.id)}
        </p>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (row) =>
      typeof row.status === "string" ? (
        <StatusBadge>{row.status}</StatusBadge>
      ) : (
        <StatusBadge tone="info">tracked</StatusBadge>
      ),
  },
  {
    key: "updated",
    header: "Updated",
    render: (row) => (
      <span className="text-slate-500 dark:text-slate-400">
        {formatDate(row.updated_at ?? row.created_at)}
      </span>
    ),
  },
];

export function HubLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      const from = (location.state as { from?: { pathname?: string } } | null)?.from
        ?.pathname;
      navigate(from ?? "/dashboard", { replace: true });
    } catch (loginError) {
      const normalized = normalizeApiError(loginError);
      setError(normalized.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-slate-950 text-white lg:grid-cols-[0.95fr_1.05fr]">
      <section className="flex items-center justify-center bg-white px-6 py-12 text-slate-950 dark:bg-slate-950 dark:text-white">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-950/10 dark:border-white/10 dark:bg-white/[0.03]"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-600">
            Admin Hub
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Operator sign in
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Access the platform control plane with your Technoventor account.
          </p>
          <div className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
          </div>
          {error ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
          <Button className="mt-7 w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </section>
      <section className="relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(20,184,166,0.35),transparent_32%),radial-gradient(circle_at_10%_90%,rgba(13,148,136,0.2),transparent_30%)]" />
        <div className="relative">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-teal-100">
            <img src="/technoventor-logo.svg" alt="Technoventor logo" className="h-8 w-auto rounded bg-white px-1 py-1" />
            Platform operations console
          </div>
          <h2 className="max-w-2xl text-6xl font-semibold tracking-tight">
            Govern every organisation, lab, plan, and system signal.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            A premium admin surface aligned with real MIS API resources and
            deployment health.
          </p>
        </div>
        <div className="relative grid max-w-3xl grid-cols-3 gap-4">
          {["Tenants", "Billing", "Health"].map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur"
            >
              <ShieldCheck className="mb-4 size-6 text-teal-200" />
              <p className="font-semibold">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function HubShell() {
  const { user, logout } = useAuth();
  const params = useParams();
  const orgId = params.orgId;
  const labId = params.labId;
  const navItems = useMemo(() => buildHubNav(orgId, labId), [labId, orgId]);
  const contexts = [
    orgId ? { label: "Organisation", value: `Org #${orgId}` } : null,
    labId ? { label: "Lab", value: `Lab #${labId}` } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <PremiumShell
      appName="Technoventor Hub"
      appSubtitle="Admin Hub"
      logoSrc="/technoventor-logo.svg"
      navItems={navItems}
      contexts={contexts}
      userName={fullName(user)}
      userEmail={user?.email}
      onSignOut={logout}
    />
  );
}

export function PlatformDashboardPage() {
  const organisations = usePagedResource<Entity>(endpoints.organisations.list);
  const [health, setHealth] = useState<HealthState | null>(null);

  useEffect(() => {
    apiClient.health().then(setHealth).catch(() => setHealth(null));
  }, []);

  return (
    <PageFrame
      eyebrow="Platform"
      title="Admin command center"
      description="A premium operating console for platform-wide organizations, billing, and API readiness."
      metrics={[
        {
          label: "Organizations",
          value: String(organisations.rows.length),
          helper: "Current page",
          icon: <Building2 className="size-5" />,
        },
        {
          label: "API health",
          value: health?.status ?? "Checking",
          helper: "DB + cache checks",
          icon: <Server className="size-5" />,
        },
        {
          label: "Auth",
          value: "Secure",
          helper: "Role-based sign-in",
          icon: <ShieldCheck className="size-5" />,
        },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ResourceTable title="Organizations" resource={organisations} />
        <HealthPanel health={health} />
      </div>
    </PageFrame>
  );
}

export function OrganisationsPage() {
  const resource = usePagedResource<Entity>(endpoints.organisations.list);
  return (
    <DomainPage
      eyebrow="Tenants"
      title="Organizations"
      description="Review tenant workspaces and open their operational context."
      icon={<Building2 className="size-5" />}
      resource={resource}
      actionLabel="Create organization"
    />
  );
}

export function PlansPage() {
  const [plans, setPlans] = useState<Entity[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .listUnpaginated<Entity>(endpoints.billing.plans)
      .then(setPlans)
      .catch((planError) => setError(normalizeApiError(planError).message));
  }, []);

  return (
    <PageFrame
      eyebrow="Billing"
      title="Plans"
      description="Public SaaS plans from /api/v1/billing/plans/ with entitlement-ready presentation."
      metrics={[
        {
          label: "Plans",
          value: String(plans.length),
          helper: "Public catalogue",
          icon: <CreditCard className="size-5" />,
        },
      ]}
    >
      <PremiumDataTable
        title="Plans"
        description={error ?? "Plan rows are loaded from the billing API."}
        columns={adminColumns}
        rows={plans}
        getRowKey={(row, index) => `${row.id}-${index}`}
        actions={
          <Button>
            <Plus className="size-4" />
            New plan
          </Button>
        }
      />
    </PageFrame>
  );
}

export function OrganisationDetailPage() {
  const { orgId } = useParams();
  const labs = usePagedResource<Entity>(orgId ? endpoints.labs.list(orgId) : null, orgId);
  const members = usePagedResource<Entity>(
    orgId ? endpoints.organisations.members(orgId) : null,
    orgId
  );
  const subscriptions = usePagedResource<Entity>(
    orgId ? endpoints.billing.subscriptions(orgId) : null,
    orgId
  );

  return (
    <PageFrame
      eyebrow="Organization"
      title={`Organization #${orgId}`}
      description="Support view for labs, users, subscription state, and tenant operations."
      metrics={[
        {
          label: "Labs",
          value: String(labs.rows.length),
          helper: "Facilities",
          icon: <FlaskConical className="size-5" />,
        },
        {
          label: "Users",
          value: String(members.rows.length),
          helper: "Members",
          icon: <Users className="size-5" />,
        },
        {
          label: "Billing",
          value: String(subscriptions.rows.length),
          helper: "Subscriptions",
          icon: <CreditCard className="size-5" />,
        },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-3">
        <ResourceTable title="Labs" resource={labs} compact />
        <ResourceTable title="Members" resource={members} compact />
        <ResourceTable title="Subscriptions" resource={subscriptions} compact />
      </div>
    </PageFrame>
  );
}

export function LabOperationsPage() {
  const { orgId, labId } = useParams();
  const machines = usePagedResource<Entity>(labId ? endpoints.machines.list(labId) : null, orgId);
  const inventory = usePagedResource<Entity>(labId ? endpoints.inventory.items(labId) : null, orgId);
  const projects = usePagedResource<Entity>(labId ? endpoints.projects.list(labId) : null, orgId);

  return (
    <PageFrame
      eyebrow="Lab Operations"
      title={`Lab #${labId}`}
      description="Read-heavy operator view for machines, inventory, projects, and IoT readiness."
      metrics={[
        {
          label: "Machines",
          value: String(machines.rows.length),
          helper: "Equipment",
          icon: <Wrench className="size-5" />,
        },
        {
          label: "Inventory",
          value: String(inventory.rows.length),
          helper: "Stock",
          icon: <Boxes className="size-5" />,
        },
        {
          label: "Projects",
          value: String(projects.rows.length),
          helper: "Research",
          icon: <ListChecks className="size-5" />,
        },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-3">
        <ResourceTable title="Machines" resource={machines} compact />
        <ResourceTable title="Inventory" resource={inventory} compact />
        <ResourceTable title="Projects" resource={projects} compact />
      </div>
    </PageFrame>
  );
}

export function SystemHealthPage() {
  const [health, setHealth] = useState<HealthState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .health()
      .then(setHealth)
      .catch((healthError) => setError(normalizeApiError(healthError).message));
  }, []);

  return (
    <PageFrame
      eyebrow="Operations"
      title="System health"
      description="Render-ready health surface backed by /api/v1/health/."
      metrics={[
        {
          label: "Status",
          value: health?.status ?? "Unknown",
          helper: error ?? "Live API check",
          icon: <Server className="size-5" />,
        },
      ]}
    >
      <HealthPanel health={health} error={error} />
    </PageFrame>
  );
}

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <EmptyState
        title="Page not found"
        description="The route you requested does not exist in the premium Admin Hub."
      />
    </div>
  );
}

export function RedirectToDashboard() {
  return <Navigate to="/dashboard" replace />;
}

function DomainPage({
  eyebrow,
  title,
  description,
  icon,
  resource,
  actionLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  resource: ReturnType<typeof usePagedResource<Entity>>;
  actionLabel: string;
}) {
  return (
    <PageFrame
      eyebrow={eyebrow}
      title={title}
      description={description}
      metrics={[
        {
          label: "Records",
          value: String(resource.rows.length),
          helper: "Current page",
          icon,
        },
        {
          label: "Access",
          value: "Admin",
          helper: "Operator view",
          icon: <Settings className="size-5" />,
        },
      ]}
    >
      <ResourceTable
        title={title}
        resource={resource}
        actions={
          <Button>
            <Plus className="size-4" />
            {actionLabel}
          </Button>
        }
      />
    </PageFrame>
  );
}

function PageFrame({
  eyebrow,
  title,
  description,
  metrics = [],
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  metrics?: Metric[];
  children: ReactNode;
}) {
  return (
    <div className="space-y-8">
      <SectionHeader eyebrow={eyebrow} title={title} description={description} />
      {metrics.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => (
            <KpiCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              helper={metric.helper}
              icon={metric.icon}
              trend="Admin"
              direction="flat"
            />
          ))}
        </div>
      ) : null}
      {children}
    </div>
  );
}

function ResourceTable({
  title,
  resource,
  actions,
  compact = false,
}: {
  title: string;
  resource: ReturnType<typeof usePagedResource<Entity>>;
  actions?: ReactNode;
  compact?: boolean;
}) {
  return (
    <PremiumDataTable
      title={title}
      description={
        resource.error?.message ??
        (resource.isLoading ? "Loading records from the MIS API..." : "Backend-compatible live list.")
      }
      columns={compact ? adminColumns.slice(0, 2) : adminColumns}
      rows={resource.rows}
      getRowKey={(row, index) => `${row.id}-${index}`}
      next={resource.next}
      previous={resource.previous}
      onNext={resource.loadNext}
      onPrevious={resource.loadPrevious}
      actions={actions}
      emptyTitle={`No ${title.toLowerCase()} yet`}
      emptyDescription="This operator surface will populate as backend records are available."
    />
  );
}

function HealthPanel({
  health,
  error,
}: {
  health: HealthState | null;
  error?: string | null;
}) {
  if (error) {
    return (
      <EmptyState
        title="Health check unavailable"
        description={error}
        icon={<Server className="size-7" />}
      />
    );
  }

  const checks = Object.entries(health?.checks ?? {});

  return (
    <PremiumDataTable
      title="API health"
      description="Database and cache checks from Django."
      columns={[
        {
          key: "check",
          header: "Check",
          render: (row) => <span className="font-semibold">{displayName(row)}</span>,
        },
        {
          key: "state",
          header: "State",
          render: (row) => (
            <StatusBadge tone={row.status === "ok" ? "success" : "danger"}>
              {String(row.status)}
            </StatusBadge>
          ),
        },
      ]}
      rows={checks.map(([name, ok]) => ({
        id: name,
        name,
        status: ok ? "ok" : "failed",
      }))}
      getRowKey={(row) => String(row.id)}
      emptyTitle="Waiting for health check"
      emptyDescription="The API health response has not loaded yet."
    />
  );
}

function buildHubNav(orgId?: string, labId?: string): ShellNavItem[] {
  const nav: ShellNavItem[] = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { label: "Organizations", to: "/organizations", icon: Building2 },
    { label: "Plans", to: "/plans", icon: CreditCard },
    { label: "System health", to: "/system/health", icon: Server },
  ];

  if (orgId) {
    nav.push({
      label: "Organization",
      to: `/organizations/${orgId}`,
      icon: Users,
    });
  }
  if (orgId && labId) {
    nav.push({
      label: "Lab Operations",
      to: `/organizations/${orgId}/labs/${labId}`,
      icon: Activity,
    });
  }

  return nav;
}

function displayName(row: Entity): string {
  return String(row.name ?? row.title ?? row.email ?? row.number ?? `Record ${row.id}`);
}

function formatDate(value: unknown): string {
  if (typeof value !== "string") return "Not updated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not updated";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function fullName(user: { first_name?: string; last_name?: string; email?: string } | null): string {
  if (!user) return "Admin user";
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return name || user.email || "Admin user";
}

export { Outlet };
