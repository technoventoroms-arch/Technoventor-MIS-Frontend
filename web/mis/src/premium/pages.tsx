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
  Bell,
  UserCircle,
  Users,
  Wrench,
} from "lucide-react";
import {
  EmptyState,
  KpiCard,
  PremiumDataTable,
  PremiumShell,
  PremiumSurface,
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

type Metric = {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
};

type VisualTile = {
  title: string;
  subtitle: string;
  accent: string;
  icon: ReactNode;
};

const ERP_LRP_VISUALS: VisualTile[] = [
  {
    title: "Organisation Control",
    subtitle: "Users, billing, compliance",
    accent: "from-indigo-600 to-blue-500",
    icon: <Building2 className="size-5" />,
  },
  {
    title: "Lab Operations",
    subtitle: "Machines, scheduling, uptime",
    accent: "from-cyan-600 to-teal-500",
    icon: <Wrench className="size-5" />,
  },
  {
    title: "Inventory & Projects",
    subtitle: "Stock, orders, execution",
    accent: "from-amber-600 to-orange-500",
    icon: <Boxes className="size-5" />,
  },
];

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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.35),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(13,148,136,0.24),transparent_30%)]" />
        <div className="relative">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-teal-100">
            <img src="/technoventor-logo.svg" alt="Technoventor logo" className="h-8 w-auto rounded bg-white px-1 py-1" />
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
              <BadgeCheck className="mb-4 size-6 text-teal-200" />
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
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-600">
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
          <div className="text-center mt-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-teal-600 hover:text-teal-500">
                Sign up
              </Link>
            </p>
          </div>
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
  const notifications = usePagedResource<Entity>(orgId ? endpoints.users.notifications : null, orgId);

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

  const isOrgAdmin = useIsOrgAdmin(orgId);
  const navItems = useMemo(
    () => buildMisNav(orgId, labId, isOrgAdmin),
    [isOrgAdmin, labId, orgId]
  );
  const contexts = [
    orgId ? { label: "Organisation", value: orgLabel ?? "Loading…" } : null,
    labId ? { label: "Lab", value: labLabel ?? "Loading…" } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <PremiumShell
      appName="Technoventor MIS"
      appSubtitle="Laboratory operations"
      logoSrc="/technoventor-logo.svg"
      navItems={navItems}
      contexts={contexts}
      notifications={notifications.rows.slice(0, 20).map((row) => ({
        id: row.id,
        title: String(row.title ?? "Update"),
        message: String(row.message ?? ""),
        createdAt: typeof row.created_at === "string" ? row.created_at : undefined,
        isRead: Boolean(row.is_read),
        to: orgId && labId ? `/${orgId}/lab/${labId}/notifications` : undefined,
      }))}
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
      <VisualShowcase
        title="Technoventor ERP + LRP Experience"
        description="A unified operating layer for business workflows and lab execution."
        tiles={ERP_LRP_VISUALS}
      />
      <PriorityRail
        items={[
          {
            title: "Pick your workspace",
            detail: "Open the active organisation to continue operations.",
            tone: "bg-blue-50 text-blue-700 dark:bg-blue-400/15 dark:text-blue-200",
          },
          {
            title: "Action next",
            detail: "Create organisation or join lab to onboard new teams quickly.",
            tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200",
          },
        ]}
      />
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
                <Link to={`/${row.id}/labs`}>Open workspace</Link>
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
      <VisualShowcase
        title="Executive Snapshot"
        description="Track operations, teams, and commercial health in one view."
        tiles={ERP_LRP_VISUALS}
      />
      <OpsPulsePanel
        title="Organisation pulse"
        lines={[
          { label: "Operational capacity", value: scoreLabel(labs.rows.length + members.rows.length) },
          { label: "People readiness", value: scoreLabel(members.rows.length) },
          { label: "Commercial status", value: subscriptions.rows.length ? "Configured" : "Needs setup" },
        ]}
      />
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
      <VisualShowcase
        title="Production Floor View"
        description="Live visibility for planning, execution, and approvals."
        tiles={ERP_LRP_VISUALS.slice(1)}
      />
      <OpsPulsePanel
        title="Lab pulse"
        lines={[
          { label: "Machine availability", value: scoreLabel(machines.rows.length) },
          { label: "Inventory readiness", value: scoreLabel(inventory.rows.length) },
          { label: "Project throughput", value: scoreLabel(projects.rows.length) },
        ]}
      />
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

function VisualShowcase({
  title,
  description,
  tiles,
}: {
  title: string;
  description: string;
  tiles: VisualTile[];
}) {
  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-slate-950/70">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-950 dark:text-white">{title}</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tiles.map((tile) => (
          <article
            key={tile.title}
            className={`relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br ${tile.accent} p-4 text-white`}
          >
            <div className="absolute -right-6 -top-8 size-24 rounded-full bg-white/15 blur-xl" />
            <div className="absolute -bottom-10 left-10 size-24 rounded-full bg-white/10 blur-xl" />
            <div className="relative">
              <div className="mb-8 inline-flex rounded-xl bg-white/20 p-2">{tile.icon}</div>
              <p className="text-sm font-semibold">{tile.title}</p>
              <p className="text-xs text-white/85">{tile.subtitle}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function OpsPulsePanel({
  title,
  lines,
}: {
  title: string;
  lines: { label: string; value: string }[];
}) {
  return (
    <PremiumSurface className="p-5">
      <h3 className="text-base font-semibold text-slate-950 dark:text-white">{title}</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {lines.map((line) => (
          <div
            key={line.label}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {line.label}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{line.value}</p>
          </div>
        ))}
      </div>
    </PremiumSurface>
  );
}

function PriorityRail({
  items,
}: {
  items: { title: string; detail: string; tone: string }[];
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <div key={item.title} className={`rounded-2xl border p-4 text-sm ${item.tone}`}>
          <p className="font-semibold">{item.title}</p>
          <p className="mt-1 opacity-90">{item.detail}</p>
        </div>
      ))}
    </div>
  );
}

function scoreLabel(total: number): string {
  if (total >= 8) return "High";
  if (total >= 4) return "Good";
  if (total >= 1) return "Growing";
  return "Starting";
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

type OrgMember = Entity & {
  user?: { id?: number | string };
  is_admin?: boolean;
};

function useIsOrgAdmin(orgId?: string): boolean {
  const { user } = useAuth();
  const members = usePagedResource<OrgMember>(
    orgId ? endpoints.organisations.members(orgId) : null,
    orgId
  );

  return useMemo(() => {
    const member = members.rows.find((row) => Number(row.user?.id ?? row.id) === user?.id);
    return Boolean(member?.is_admin);
  }, [members.rows, user?.id]);
}

function buildMisNav(orgId?: string, labId?: string, isOrgAdmin = false): ShellNavItem[] {
  const profileItem: ShellNavItem = { label: "Profile", to: "/profile", icon: UserCircle };

  if (!orgId) {
    return [
      { label: "My Organization", to: "/", icon: Building2, end: true },
      { label: "Create New Organization", to: "/create-organization", icon: Plus },
      profileItem,
    ];
  }

  const orgBase = `/${orgId}`;

  if (labId) {
    const labBase = `${orgBase}/lab/${labId}`;
    return [
      { label: "Back to Labs", to: `${orgBase}/labs`, icon: ArrowLeft },
      { label: "Dashboard", to: labBase, icon: Gauge, end: true },
      { label: "Projects", to: `${labBase}/projects`, icon: ListChecks },
      { label: "Machines", to: `${labBase}/machine`, icon: Wrench },
      { label: "Inventory", to: `${labBase}/inventory`, icon: Boxes },
      { label: "Lab Members", to: `${labBase}/users`, icon: Users },
      { label: "Cart", to: `${labBase}/cart`, icon: ShoppingCart },
      { label: "My Orders", to: `${labBase}/orders`, icon: FileText },
      { label: "Notifications", to: `${labBase}/notifications`, icon: Bell },
      { label: "My Attendance", to: `${labBase}/attendance`, icon: CalendarCheck },
      { label: "Scan Machine", to: `${labBase}/scan-machine`, icon: ScanBarcode },
      { label: "Approvals", to: `${labBase}/approval`, icon: Activity },
      { label: "Lab Settings", to: `${labBase}/edit-lab`, icon: QrCode },
      { label: "Reports", to: `${orgBase}/reports`, icon: BarChart3 },
      profileItem,
    ];
  }

  return [
    ...(isOrgAdmin
      ? [{ label: "Dashboard", to: `${orgBase}/dashboard`, icon: LayoutDashboard }]
      : []),
    { label: "Labs", to: `${orgBase}/labs`, icon: FlaskConical, end: !isOrgAdmin },
    ...(isOrgAdmin
      ? [
          { label: "Users", to: `${orgBase}/users`, icon: Users },
          { label: "Organization", to: `${orgBase}/organization`, icon: Settings },
          {
            label: "Subscriptions",
            to: `${orgBase}/organization/transactions`,
            icon: CreditCard,
          },
        ]
      : []),
    { label: "Reports", to: `${orgBase}/reports`, icon: BarChart3 },
    profileItem,
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
  const isOrgAdmin = useIsOrgAdmin(orgId);
  if (!orgId) return <Navigate to="/" replace />;
  return <Navigate to={isOrgAdmin ? `/${orgId}/dashboard` : `/${orgId}/labs`} replace />;
}

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await apiClient.create("users/register/", {
        email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        password,
      });

      await login(email, password);
      navigate("/create-organization", { replace: true });
    } catch (regError) {
      setError(
        regError instanceof Error
          ? regError.message
          : normalizeApiError(regError).message || "Unable to register account"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-slate-950 text-white lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.35),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(13,148,136,0.24),transparent_30%)]" />
        <div className="relative">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-teal-100">
            <img src="/technoventor-logo.svg" alt="Technoventor logo" className="h-8 w-auto rounded bg-white px-1 py-1" />
            Technoventor MIS
          </div>
          <h1 className="max-w-2xl text-6xl font-semibold tracking-tight">
            Create your multi-tenant laboratory workspace today.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Get started in seconds. Register an account, create your organization, and invite your team.
          </p>
        </div>
        <div className="relative grid max-w-3xl grid-cols-3 gap-4">
          {["Full Self-Service", "SaaS Enabled", "Unlimited Labs"].map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur"
            >
              <BadgeCheck className="mb-4 size-6 text-teal-200" />
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
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-600">
            SaaS Registration
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Enter your details to register as a new organization administrator.
          </p>
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
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
              <Label htmlFor="phoneNumber">Phone number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
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
            {isSubmitting ? "Creating account..." : "Register & Continue"}
          </Button>
          <div className="text-center mt-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-500">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </section>
    </div>
  );
}

export { Outlet };
