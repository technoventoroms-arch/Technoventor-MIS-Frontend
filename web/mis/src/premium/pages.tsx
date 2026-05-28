import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, Navigate, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  Boxes,
  Building2,
  CalendarCheck,
  CreditCard,
  FileText,
  FlaskConical,
  Gauge,
  LayoutDashboard,
  ListChecks,
  PackagePlus,
  Plus,
  QrCode,
  ScanBarcode,
  Settings,
  ShoppingCart,
  UserCircle,
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
import { apiClient, endpoints, type Entity } from "@mono/api_client";

import { useAuth } from "./auth";
import { usePagedResource } from "./api-hooks";

type Metric = {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
};

const baseColumns: PremiumColumn<Entity>[] = [
  {
    key: "name",
    header: "Name",
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
        <StatusBadge tone="neutral">available</StatusBadge>
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

export function LoginPage() {
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
      navigate(from ?? "/", { replace: true });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-slate-950 text-white lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.35),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.24),transparent_30%)]" />
        <div className="relative">
          <div className="mb-16 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-blue-100">
            Technoventor MIS
          </div>
          <h1 className="max-w-2xl text-6xl font-semibold tracking-tight">
            Run every lab, machine, inventory item, and project from one cockpit.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Manage organisations, labs, machines, inventory, and projects in one
            unified workspace for your teams.
          </p>
        </div>
        <div className="relative grid max-w-3xl grid-cols-3 gap-4">
          {["Organisations", "Labs & machines", "Billing ready"].map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur"
            >
              <BadgeCheck className="mb-4 size-6 text-blue-200" />
              <p className="font-semibold">{item}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="flex items-center justify-center bg-white px-6 py-12 text-slate-950 dark:bg-slate-950 dark:text-white">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-950/10 dark:border-white/10 dark:bg-white/[0.03]"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
            MIS Access
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Sign in with your Technoventor MIS account.
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
    </div>
  );
}

export function MisShell() {
  const { user, logout } = useAuth();
  const params = useParams();
  const orgId = params.orgId;
  const labId = params.labId;
  const [orgLabel, setOrgLabel] = useState<string | null>(null);
  const [labLabel, setLabLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) {
      setOrgLabel(null);
      return;
    }
    let cancelled = false;
    setOrgLabel(null);
    void apiClient
      .get<Entity>(endpoints.organisations.detail(orgId), { orgId })
      .then((org) => {
        if (!cancelled) {
          setOrgLabel(String(org.name ?? `Organisation ${orgId}`));
        }
      })
      .catch(() => {
        if (!cancelled) setOrgLabel(`Organisation ${orgId}`);
      });
    return () => {
      cancelled = true;
    };
  }, [orgId]);

  useEffect(() => {
    if (!orgId || !labId) {
      setLabLabel(null);
      return;
    }
    let cancelled = false;
    setLabLabel(null);
    void apiClient
      .get<Entity>(endpoints.labs.detail(orgId, labId), { orgId })
      .then((lab) => {
        if (!cancelled) {
          setLabLabel(String(lab.name ?? `Lab ${labId}`));
        }
      })
      .catch(() => {
        if (!cancelled) setLabLabel(`Lab ${labId}`);
      });
    return () => {
      cancelled = true;
    };
  }, [orgId, labId]);

  const navItems = useMemo(() => buildMisNav(orgId, labId), [labId, orgId]);
  const contexts = [
    orgId ? { label: "Organisation", value: orgLabel ?? "Loading…" } : null,
    labId ? { label: "Lab", value: labLabel ?? "Loading…" } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <PremiumShell
      appName="Technoventor MIS"
      appSubtitle="Laboratory operations"
      navItems={navItems}
      contexts={contexts}
      userName={fullName(user)}
      userEmail={user?.email}
      onSignOut={logout}
    />
  );
}

export function OrganisationSwitcherPage() {
  const resource = usePagedResource<Entity>(endpoints.organisations.list);
  const metrics: Metric[] = [
    {
      label: "Organisations",
      value: String(resource.rows.length),
      helper: "Your organisations",
      icon: <Building2 className="size-5" />,
    },
    {
      label: "Access",
      value: "Secure",
      helper: "Account protected",
      icon: <BadgeCheck className="size-5" />,
    },
    {
      label: "Workspace",
      value: "Active",
      helper: "Live data sync",
      icon: <Gauge className="size-5" />,
    },
  ];

  return (
    <PageFrame
      eyebrow="Workspace"
      title="Choose your organisation"
      description="Choose the organisation that contains your labs, people, billing, and day-to-day operations."
      metrics={metrics}
    >
      <PremiumDataTable
        title="Organisations"
        description={resource.error?.message ?? "Your organisations and available workspaces."}
        columns={[
          ...baseColumns,
          {
            key: "action",
            header: "Open",
            render: (row) => (
              <Button asChild size="sm">
                <Link to={`/${row.id}/dashboard`}>Open workspace</Link>
              </Button>
            ),
          },
        ]}
        rows={resource.rows}
        getRowKey={(row) => String(row.id)}
        next={resource.next}
        previous={resource.previous}
        onNext={resource.loadNext}
        onPrevious={resource.loadPrevious}
        emptyTitle="No organisations found"
        emptyDescription="Create or join an organisation to unlock the MIS workspace."
        actions={
          <Button asChild>
            <Link to="/create-organization">
              <Plus className="size-4" />
              New organisation
            </Link>
          </Button>
        }
      />
    </PageFrame>
  );
}

export function OrgDashboardPage() {
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
      eyebrow="Organisation"
      title="Operational command center"
      description="Overview of labs, teams, subscriptions, and high-priority work for this organisation."
      metrics={[
        {
          label: "Labs",
          value: String(labs.rows.length),
          helper: "Facilities online",
          icon: <FlaskConical className="size-5" />,
        },
        {
          label: "Members",
          value: String(members.rows.length),
          helper: "Organisation users",
          icon: <Users className="size-5" />,
        },
        {
          label: "Subscriptions",
          value: String(subscriptions.rows.length),
          helper: "Billing records",
          icon: <CreditCard className="size-5" />,
        },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <ResourceTable title="Labs" resource={labs} />
        <ResourceTable title="Members" resource={members} />
      </div>
    </PageFrame>
  );
}

export function LabsPage() {
  const { orgId } = useParams();
  const resource = usePagedResource<Entity>(orgId ? endpoints.labs.list(orgId) : null, orgId);
  return (
    <DomainPage
      eyebrow="Facilities"
      title="Labs"
      description="Manage physical laboratories, lab members, access cards, and lab access settings."
      icon={<FlaskConical className="size-5" />}
      resource={resource}
      actionLabel="Create lab"
      actionTo={orgId ? `/${orgId}/labs/new` : undefined}
    />
  );
}

export function OrgUsersPage() {
  const { orgId } = useParams();
  const resource = usePagedResource<Entity>(
    orgId ? endpoints.organisations.members(orgId) : null,
    orgId
  );
  return (
    <DomainPage
      eyebrow="People"
      title="Organisation users"
      description="Invite, review, and manage organisation-level memberships."
      icon={<Users className="size-5" />}
      resource={resource}
      actionLabel="Invite member"
    />
  );
}

export function BillingPage() {
  const { orgId } = useParams();
  const subscriptions = usePagedResource<Entity>(
    orgId ? endpoints.billing.subscriptions(orgId) : null,
    orgId
  );
  return (
    <DomainPage
      eyebrow="Commercial"
      title="Billing and subscriptions"
      description="Review SaaS plan status, invoices, and payment readiness."
      icon={<CreditCard className="size-5" />}
      resource={subscriptions}
      actionLabel="View plans"
      actionTo={orgId ? `/${orgId}/billing/plans` : undefined}
    />
  );
}

export function LabDashboardPage() {
  const { orgId, labId } = useParams();
  const machines = usePagedResource<Entity>(labId ? endpoints.machines.list(labId) : null, orgId);
  const inventory = usePagedResource<Entity>(labId ? endpoints.inventory.items(labId) : null, orgId);
  const projects = usePagedResource<Entity>(labId ? endpoints.projects.list(labId) : null, orgId);

  return (
    <PageFrame
      eyebrow="Lab"
      title="Lab operations cockpit"
      description="Monitor machines, inventory, projects, and attendance for this lab."
      metrics={[
        {
          label: "Machines",
          value: String(machines.rows.length),
          helper: "Equipment records",
          icon: <Wrench className="size-5" />,
        },
        {
          label: "Inventory",
          value: String(inventory.rows.length),
          helper: "Stock items",
          icon: <Boxes className="size-5" />,
        },
        {
          label: "Projects",
          value: String(projects.rows.length),
          helper: "Research work",
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

export function InventoryPage() {
  const { orgId, labId } = useParams();
  const resource = usePagedResource<Entity>(
    labId ? endpoints.inventory.items(labId) : null,
    orgId
  );
  return (
    <DomainPage
      eyebrow="Stock"
      title="Inventory"
      description="Track consumables, reusable assets, thresholds, and movement history."
      icon={<Boxes className="size-5" />}
      resource={resource}
      actionLabel="Add item"
    />
  );
}

export function MachinesPage() {
  const { orgId, labId } = useParams();
  const resource = usePagedResource<Entity>(
    labId ? endpoints.machines.list(labId) : null,
    orgId
  );
  return (
    <DomainPage
      eyebrow="Equipment"
      title="Machines"
      description="Manage equipment status, reservations, logs, and access setup."
      icon={<Wrench className="size-5" />}
      resource={resource}
      actionLabel="Register machine"
    />
  );
}

export function ProjectsPage() {
  const { orgId, labId } = useParams();
  const resource = usePagedResource<Entity>(
    labId ? endpoints.projects.list(labId) : null,
    orgId
  );
  return (
    <DomainPage
      eyebrow="Research"
      title="Projects"
      description="Coordinate project teams, procurement orders, line items, and material returns."
      icon={<ListChecks className="size-5" />}
      resource={resource}
      actionLabel="New project"
    />
  );
}

export function AttendancePage() {
  const { orgId, labId } = useParams();
  const resource = usePagedResource<Entity>(
    labId ? endpoints.attendance.list(labId) : null,
    orgId
  );
  return (
    <DomainPage
      eyebrow="Access"
      title="Attendance"
      description="Review check-ins, approvals, attendance status, and who is present."
      icon={<CalendarCheck className="size-5" />}
      resource={resource}
      actionLabel="Export"
    />
  );
}

export function ApprovalsPage() {
  return (
    <PageFrame
      eyebrow="Governance"
      title="Approvals"
      description="Review attendance, inventory orders, machine reservations, and join requests in one place."
      metrics={[
        {
          label: "Queues",
          value: "4",
          helper: "Join, attendance, inventory, machines",
          icon: <Activity className="size-5" />,
        },
        {
          label: "Access",
          value: "Controlled",
          helper: "Based on your role",
          icon: <Settings className="size-5" />,
        },
      ]}
    >
      <EmptyState
        title="Approval inbox ready"
        description="Use this space to review pending attendance, inventory, and machine actions."
      />
    </PageFrame>
  );
}

export function CreatePlaceholderPage({ title }: { title: string }) {
  return (
    <PageFrame
      eyebrow="Create"
      title={title}
      description="Use this page to complete the create workflow for this module."
    >
      <EmptyState
        title="Form workflow available"
        description="Create and update records here using the same workflow as the rest of the platform."
        icon={<PackagePlus className="size-7" />}
      />
    </PageFrame>
  );
}

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <EmptyState
        title="Page not found"
        description="The route you requested does not exist in Technoventor MIS."
      />
    </div>
  );
}

function DomainPage({
  eyebrow,
  title,
  description,
  icon,
  resource,
  actionLabel,
  actionTo,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  resource: ReturnType<typeof usePagedResource<Entity>>;
  actionLabel: string;
  actionTo?: string;
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
          label: "Pagination",
          value: resource.next ? "More" : "Done",
          helper: "Live updates",
          icon: <Gauge className="size-5" />,
        },
      ]}
    >
      <ResourceTable
        title={title}
        resource={resource}
        actions={
          actionTo ? (
            <Button asChild>
              <Link to={actionTo}>
                <Plus className="size-4" />
                {actionLabel}
              </Link>
            </Button>
          ) : (
            <Button>
              <Plus className="size-4" />
              {actionLabel}
            </Button>
          )
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
              trend="Live"
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
        (resource.isLoading
          ? "Refreshing records..."
          : `Live workspace list${resource.lastUpdatedAt ? ` • Updated ${formatRelativeTime(resource.lastUpdatedAt)}` : ""}.`)
      }
      columns={compact ? baseColumns.slice(0, 2) : baseColumns}
      rows={resource.rows}
      getRowKey={(row, index) => `${row.id}-${index}`}
      next={resource.next}
      previous={resource.previous}
      onNext={resource.loadNext}
      onPrevious={resource.loadPrevious}
      actions={actions}
      emptyTitle={`No ${title.toLowerCase()} yet`}
      emptyDescription="Records will appear here once data is added."
    />
  );
}

function formatRelativeTime(timestamp: number): string {
  const deltaSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (deltaSeconds < 5) return "just now";
  if (deltaSeconds < 60) return `${deltaSeconds}s ago`;
  const deltaMinutes = Math.floor(deltaSeconds / 60);
  if (deltaMinutes < 60) return `${deltaMinutes}m ago`;
  const deltaHours = Math.floor(deltaMinutes / 60);
  return `${deltaHours}h ago`;
}

function buildMisNav(orgId?: string, labId?: string): ShellNavItem[] {
  if (!orgId) {
    return [
      { label: "My Organization", to: "/", icon: Building2, end: true },
      { label: "Create New Organization", to: "/create-organizations", icon: Plus },
      { label: "Profile", to: "/profile", icon: UserCircle },
    ];
  }

  const orgBase = `/${orgId}`;
  const labBase = labId ? `/${orgId}/lab/${labId}` : null;

  return [
    { label: "Dashboard", to: `${orgBase}/dashboard`, icon: LayoutDashboard },
    { label: "Labs", to: `${orgBase}/labs`, icon: FlaskConical },
    { label: "Users", to: `${orgBase}/users`, icon: Users },
    { label: "Organization", to: `${orgBase}/organization`, icon: Settings },
    { label: "Subscriptions", to: `${orgBase}/organization/transactions`, icon: CreditCard },
    ...(labBase
      ? [
          { label: "Back to Labs", to: `${orgBase}/labs`, icon: ArrowLeft },
          { label: "Dashboard", to: `${labBase}`, icon: Gauge },
          { label: "Projects", to: `${labBase}/projects`, icon: ListChecks },
          { label: "Machines", to: `${labBase}/machine`, icon: Wrench },
          { label: "Inventory", to: `${labBase}/inventory`, icon: Boxes },
          { label: "Users", to: `${labBase}/users`, icon: Users },
          { label: "Cart", to: `${labBase}/cart`, icon: ShoppingCart },
          { label: "My Orders", to: `${labBase}/orders`, icon: FileText },
          { label: "My Attendance", to: `${labBase}/attendance`, icon: CalendarCheck },
          { label: "Scan Machine", to: `${labBase}/scan-machine`, icon: ScanBarcode },
          { label: "Approvals", to: `${labBase}/approval`, icon: Activity },
          { label: "Lab", to: `${labBase}/edit-lab`, icon: QrCode },
        ]
      : []),
    { label: "Reports", to: `${orgBase}/reports`, icon: BarChart3 },
    { label: "Profile", to: "/profile", icon: UserCircle },
  ];
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
  if (!user) return "MIS User";
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return name || user.email || "MIS User";
}

export function RedirectToOrgDashboard() {
  const { orgId } = useParams();
  return <Navigate to={orgId ? `/${orgId}/dashboard` : "/"} replace />;
}

export { Outlet };
