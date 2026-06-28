import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, Navigate, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Boxes,
  CalendarCheck,
  FlaskConical,
  Gauge,
  ListChecks,
  PackagePlus,
  Plus,
  Settings,
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
  MakerSpaceOpsLogo,
} from "@mono/shared_ui/components/premium";
import { MAKERSPACE_OPS_LOGO_SRC } from "@mono/shared_ui/lib/brand";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Input } from "@mono/shared_ui/components/ui/input";
import { Label } from "@mono/shared_ui/components/ui/label";
import { apiClient, endpoints, type Entity } from "@mono/api_client";

import { useAuth } from "./auth";
import { useCurrentUserProfile } from "./use-current-user-profile";
import { usePagedResource } from "./api-hooks";
import { LabPermissionsProvider, useLabPermissions } from "./lab-permissions";
import { buildMisNav } from "./nav-policy";
import { useIsOrgAdmin } from "./use-org-admin";
import { useOrganisationAccess } from "./use-organisation-access";
import { useJoinLabVisibility } from "./use-join-lab-visibility";
import { formatLocalDateTime } from "@mono/shared_ui/lib/format-datetime";
import { entityNameCell } from "./entity-display";
import { ManagerLabDashboard } from "./manager-lab-dashboard";
import { resolveLabNavPersona } from "./lab-role";
import { SignupTypeSelector } from "./signup/signup-type-selector";
import { MemberSignupFields } from "./signup/member-signup-fields";
import { OrganisationSignupFields } from "./signup/organisation-signup-fields";
import { useSignupForm } from "./signup/use-signup-form";

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
    render: (row) => entityNameCell(row),
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
          <div className="mb-8 inline-block rounded-2xl bg-white px-5 py-4 shadow-lg shadow-black/20">
            <MakerSpaceOpsLogo variant="hero" />
          </div>
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-teal-200">
            MakerSpace
          </p>
          <h1 className="max-w-2xl text-6xl font-semibold tracking-tight">
            Run every lab, machine, inventory item, and project from one cockpit.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Manage organisations, labs, machines, inventory, and projects in one
            unified workspace for your teams.
          </p>
        </div>
        <div className="relative grid max-w-3xl grid-cols-3 gap-4">
          {["Organisations", "Labs & machines", "Projects & inventory"].map((item) => (
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
            MakerSpace
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Sign in with your MakerSpace account.
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
          <div className="mt-4 text-center">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400"
            >
              Forgot password?
            </Link>
          </div>
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

function MisShellInner() {
  const { user, logout, profile } = useAuth();
  const { uiContext } = useCurrentUserProfile();
  const canAccessDeployOps = Boolean(profile?.can_access_deploy_ops);
  const params = useParams();
  const orgId = params.orgId;
  const labId = params.labId;
  const [orgLabel, setOrgLabel] = useState<string | null>(null);
  const [orgLogoUrl, setOrgLogoUrl] = useState<string | null>(null);
  const [labLabel, setLabLabel] = useState<string | null>(null);
  const notifications = usePagedResource<Entity>(orgId ? endpoints.users.notifications : null, orgId);
  const isOrgAdmin = useIsOrgAdmin(orgId) || uiContext.primary_experience === "organisation_owner";
  const { can, canAny, roleName, canManageInventory, isLoading: permissionsLoading } =
    useLabPermissions();
  const { canCreateOrganisation } = useOrganisationAccess(!orgId);
  const { showJoinLab } = useJoinLabVisibility();
  const canCreateFromContext = uiContext.capabilities.can_create_organisation || canCreateOrganisation;

  useEffect(() => {
    if (!orgId) {
      setOrgLabel(null);
      setOrgLogoUrl(null);
      return;
    }
    let cancelled = false;
    setOrgLabel(null);
    setOrgLogoUrl(null);
    void apiClient
      .get<Entity>(endpoints.organisations.detail(orgId), { orgId })
      .then((org) => {
        if (!cancelled) {
          setOrgLabel(String(org.name ?? `Organisation ${orgId}`));
          setOrgLogoUrl(typeof org.logo_url === "string" ? org.logo_url : null);
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

  const navItems = useMemo(
    () =>
      buildMisNav({
        orgId,
        labId,
        isOrgAdmin,
        canAccessDeployOps,
        roleName,
        canCreateOrganisation: canCreateFromContext,
        showJoinLab,
        can,
        canAny,
        canManageInventory,
        navigationSections: uiContext.navigation_sections,
        capabilities: uiContext.capabilities,
      }),
    [
      can,
      canAny,
      canCreateFromContext,
      canManageInventory,
      uiContext.capabilities,
      uiContext.navigation_sections,
      isOrgAdmin,
      canAccessDeployOps,
      labId,
      orgId,
      roleName,
      showJoinLab,
    ]
  );
  const contexts = [
    orgId ? { label: "Organisation", value: orgLabel ?? "Loading…" } : null,
    labId ? { label: "Lab", value: labLabel ?? "Loading…" } : null,
    labId && roleName ? { label: "Role", value: roleName } : null,
    uiContext.badges.length ? { label: "Badges", value: uiContext.badges.join(", ") } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <PremiumShell
      appName="MakerSpace"
      appSubtitle={permissionsLoading && labId ? "Loading access…" : "Laboratory operations"}
      logoSrc={orgLogoUrl ?? MAKERSPACE_OPS_LOGO_SRC}
      navItems={navItems}
      contexts={contexts}
      notifications={notifications.rows.slice(0, 20).map((row) => ({
        id: row.id,
        title: String(row.title ?? "Update"),
        message: String(row.message ?? ""),
        createdAt: typeof row.created_at === "string" ? row.created_at : undefined,
        isRead: Boolean(row.is_read),
        isRed: Boolean(row.is_red),
        to: orgId && labId ? `/${orgId}/lab/${labId}/notifications` : undefined,
      }))}
      userName={fullName(user)}
      userEmail={user?.email}
      userAvatar={typeof user?.image_url === "string" ? user.image_url : undefined}
      onSignOut={logout}
    >
      <Outlet />
    </PremiumShell>
  );
}

export function MisShell() {
  return (
    <LabPermissionsProvider>
      <MisShellInner />
    </LabPermissionsProvider>
  );
}

export function OrganisationSwitcherPage() {
  const { user } = useAuth();
  const { uiContext } = useCurrentUserProfile();
  const { resource, organisationCount, canCreateOrganisation } = useOrganisationAccess(true);
  const { showJoinLab } = useJoinLabVisibility();
  const canCreate = uiContext.capabilities.can_create_organisation || canCreateOrganisation;
  const displayName = fullName(user);
  const firstName = displayName.split(" ")[0] || "there";

  const pageDescription =
    resource.error?.message ??
    (organisationCount > 0
      ? "Open an organisation to reach your labs. Tools in the sidebar depend on your role in each lab."
      : canCreate
        ? "Create your organisation, or join a lab if you were invited to an existing team."
        : "Request access to a lab or accept an invite from your administrator.");
  const onboardingMessage =
    uiContext.dashboard_variant === "owner_dashboard"
      ? `Organisation created: ${
          Boolean((uiContext.onboarding_state as { organisation_created?: boolean }).organisation_created)
            ? "yes"
            : "no"
        } • Labs: ${(uiContext.onboarding_state as { labs_count?: number }).labs_count ?? 0}`
      : `Joined organisations: ${
          (uiContext.onboarding_state as { joined_organisations_count?: number }).joined_organisations_count ?? 0
        } • Pending invites: ${
          (uiContext.onboarding_state as { pending_invites_count?: number }).pending_invites_count ?? 0
        }`;

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Workspace"
        title={organisationCount > 0 ? `Welcome back, ${firstName}` : "Your organisations"}
        description={`${pageDescription} ${onboardingMessage}`}
        actions={
          <div className="flex flex-wrap gap-2">
            {showJoinLab ? (
              <Button asChild variant="outline">
                <Link to="/request_lab">Join a lab</Link>
              </Button>
            ) : null}
            {canCreate ? (
              <Button asChild className="bg-teal-600 hover:bg-teal-700">
                <Link to="/create-organization">
                  <Plus className="size-4" />
                  Create organisation
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />
      <PremiumDataTable
        title="Organisations"
        description={
          organisationCount > 0
            ? `${organisationCount} workspace${organisationCount === 1 ? "" : "s"} available to you.`
            : "No organisations linked to this account yet."
        }
        columns={[
          ...baseColumns,
          {
            key: "action",
            header: "Open",
            render: (row) => (
              <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-700">
                <Link to={`/${row.id}/labs`}>
                  Open
                  <ArrowRight className="size-4" />
                </Link>
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
        emptyTitle="No organisations yet"
        emptyDescription={
          canCreate
            ? "Create your first organisation, or join a lab if you were invited to an existing team."
            : "Ask your administrator for an invite, or browse labs to request membership."
        }
      />
    </div>
  );
}

export function DashboardHomePage() {
  const { uiContext, labRoles } = useCurrentUserProfile();

  if (uiContext.default_context.default_organisation_id && uiContext.default_context.default_lab_id) {
    return (
      <Navigate
        to={`/${uiContext.default_context.default_organisation_id}/lab/${uiContext.default_context.default_lab_id}/dashboard`}
        replace
      />
    );
  }

  if (uiContext.default_context.default_organisation_id) {
    const orgId = uiContext.default_context.default_organisation_id;
    return (
      <Navigate
        to={
          uiContext.dashboard_variant === "owner_dashboard"
            ? `/${orgId}/dashboard`
            : `/${orgId}/labs`
        }
        replace
      />
    );
  }

  const roleDefault = labRoles[0];
  if (roleDefault) {
    return <Navigate to={`/${roleDefault.organisation_id}/lab/${roleDefault.lab_id}/dashboard`} replace />;
  }

  return <OrganisationSwitcherPage />;
}

export function OrgDashboardPage() {
  const { orgId } = useParams();
  const labs = usePagedResource<Entity>(orgId ? endpoints.labs.list(orgId) : null, orgId);
  const members = usePagedResource<Entity>(
    orgId ? endpoints.organisations.members(orgId) : null,
    orgId
  );
  return (
    <PageFrame
      eyebrow="Organisation"
      title="Operational command center"
      description="Overview of labs, teams, and high-priority work for this organisation."
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
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <ResourceTable title="Labs" resource={labs} />
        <ResourceTable title="Members" resource={members} columns={orgMemberColumns} />
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

export function LabDashboardPage() {
  const { orgId, labId } = useParams();
  const isOrgAdmin = useIsOrgAdmin(orgId);
  const { roleName, isLoading: permissionsLoading } = useLabPermissions();
  const [labName, setLabName] = useState<string | undefined>();

  useEffect(() => {
    if (!orgId || !labId) {
      setLabName(undefined);
      return;
    }
    let cancelled = false;
    void apiClient
      .get<Entity>(endpoints.labs.detail(orgId, labId), { orgId })
      .then((lab) => {
        if (!cancelled) setLabName(String(lab.name ?? ""));
      })
      .catch(() => {
        if (!cancelled) setLabName(undefined);
      });
    return () => {
      cancelled = true;
    };
  }, [orgId, labId]);

  if (permissionsLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        Loading lab workspace…
      </div>
    );
  }

  const persona = resolveLabNavPersona(isOrgAdmin, roleName);

  if (persona === "lab-manager") {
    return <ManagerLabDashboard labName={labName} />;
  }

  if (persona === "org-admin") {
    return <AdminLabDashboard labName={labName} />;
  }

  return <StudentLabDashboard labName={labName} />;
}

function StudentLabDashboard({ labName }: { labName?: string }) {
  const { orgId, labId } = useParams();
  const { can, canAny, roleName, canManageInventory, isLoading: permissionsLoading } =
    useLabPermissions();
  const isOrgAdmin = useIsOrgAdmin(orgId);
  const machines = usePagedResource<Entity>(labId ? endpoints.machines.list(labId) : null, orgId);
  const inventory = usePagedResource<Entity>(labId ? endpoints.inventory.items(labId) : null, orgId);
  const projects = usePagedResource<Entity>(labId ? endpoints.projects.list(labId) : null, orgId);

  const labShortcuts = useMemo(() => {
    if (!orgId || !labId) return [];
    return buildMisNav({ orgId, labId, isOrgAdmin, roleName, can, canAny, canManageInventory }).filter(
      (item) => !["Back to labs", "Profile", "Notifications"].includes(item.label)
    );
  }, [can, canAny, canManageInventory, isOrgAdmin, labId, orgId, roleName]);

  return (
    <PageFrame
      eyebrow="Lab"
      title={labName ? `${labName}` : "Lab workspace"}
      description="Your projects, machines, inventory orders, and attendance for this lab."
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
      {!permissionsLoading && labShortcuts.length > 0 ? (
        <LabShortcutGrid items={labShortcuts} />
      ) : null}
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

function AdminLabDashboard({ labName }: { labName?: string }) {
  const { orgId, labId } = useParams();
  const { can, canAny } = useLabPermissions();
  const machines = usePagedResource<Entity>(labId ? endpoints.machines.list(labId) : null, orgId);
  const inventory = usePagedResource<Entity>(labId ? endpoints.inventory.items(labId) : null, orgId);
  const projects = usePagedResource<Entity>(labId ? endpoints.projects.list(labId) : null, orgId);
  const members = usePagedResource<Entity>(
    orgId && labId ? endpoints.labs.members(orgId, labId) : null,
    orgId
  );

  const labShortcuts = useMemo(() => {
    if (!orgId || !labId) return [];
    return buildMisNav({
      orgId,
      labId,
      isOrgAdmin: true,
      roleName: "",
      can,
      canAny,
      canManageInventory: true,
    }).filter(
      (item) => !["Back to labs", "Profile", "Notifications"].includes(item.label)
    );
  }, [can, canAny, labId, orgId]);

  return (
    <PageFrame
      eyebrow="Organisation admin"
      title={labName ? `${labName} — full control` : "Lab operations cockpit"}
      description="Full lab access: operations, commerce, approvals, people, and settings."
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
          label: "Members",
          value: String(members.rows.length),
          helper: "Lab memberships",
          icon: <Users className="size-5" />,
        },
        {
          label: "Projects",
          value: String(projects.rows.length),
          helper: "Research work",
          icon: <ListChecks className="size-5" />,
        },
      ]}
    >
      {labShortcuts.length > 0 ? <LabShortcutGrid items={labShortcuts} /> : null}
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
        description="The route you requested does not exist in MakerSpace."
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

function LabShortcutGrid({ items }: { items: ShellNavItem[] }) {
  return (
    <PremiumSurface className="p-5">
      <h3 className="text-base font-semibold text-slate-950 dark:text-white">Your lab tools</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Quick access based on your role — same items as the sidebar.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-800 transition hover:border-teal-200 hover:bg-teal-50/80 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-100 dark:hover:border-teal-800/50 dark:hover:bg-teal-950/30"
            >
              <span className="inline-flex rounded-xl bg-teal-600/10 p-2 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
                <Icon className="size-4" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </PremiumSurface>
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

function scoreLabel(total: number): string {
  if (total >= 8) return "High";
  if (total >= 4) return "Good";
  if (total >= 1) return "Growing";
  return "Starting";
}

const orgMemberColumns: PremiumColumn<Entity>[] = [
  {
    key: "member",
    header: "Member",
    render: (row) => entityNameCell(row),
  },
  {
    key: "access",
    header: "Access",
    render: (row) => (
      <StatusBadge tone={row.is_admin ? "success" : "neutral"}>
        {row.is_admin ? "Admin" : "Member"}
      </StatusBadge>
    ),
  },
  {
    key: "updated",
    header: "Joined",
    render: (row) => (
      <span className="text-slate-500 dark:text-slate-400">
        {formatDate(row.created_at ?? row.updated_at)}
      </span>
    ),
  },
];

function ResourceTable({
  title,
  resource,
  actions,
  columns,
  compact = false,
}: {
  title: string;
  resource: ReturnType<typeof usePagedResource<Entity>>;
  actions?: ReactNode;
  columns?: PremiumColumn<Entity>[];
  compact?: boolean;
}) {
  const tableColumns = columns ?? (compact ? baseColumns.slice(0, 2) : baseColumns);

  return (
    <PremiumDataTable
      title={title}
      description={
        resource.error?.message ??
        (resource.isLoading
          ? "Refreshing records..."
          : `Live workspace list${resource.lastUpdatedAt ? ` • Updated ${formatRelativeTime(resource.lastUpdatedAt)}` : ""}.`)
      }
      columns={tableColumns}
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

function formatDate(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "Not updated";
  }
  const text = formatLocalDateTime(value);
  return text === "—" ? "Not updated" : text;
}

function fullName(user: { first_name?: string; last_name?: string; email?: string } | null): string {
  if (!user) return "MakerSpace User";
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return name || user.email || "MakerSpace User";
}

export function RedirectToOrgDashboard() {
  const { orgId } = useParams();
  const { uiContext } = useCurrentUserProfile();
  const isOrgAdmin = useIsOrgAdmin(orgId) || uiContext.dashboard_variant === "owner_dashboard";
  if (!orgId) return <Navigate to="/" replace />;
  return <Navigate to={isOrgAdmin ? `/${orgId}/dashboard` : `/${orgId}/labs`} replace />;
}

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    values,
    payload,
    error,
    setError,
    setSignupType,
    setField,
    setAddressField,
    validate,
    consumeApiError,
  } = useSignupForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organisationStep, setOrganisationStep] = useState(1);

  const isOrganisationSignup = values.signupType === "organisation";
  const currentStep = isOrganisationSignup ? organisationStep : 1;
  const totalSteps = isOrganisationSignup ? 3 : 1;

  useEffect(() => {
    if (!isOrganisationSignup) {
      setOrganisationStep(1);
    }
  }, [isOrganisationSignup]);

  function validateCurrentStep(): string | null {
    if (currentStep === 1) {
      if (!values.firstName || !values.lastName || !values.email || !values.password) {
        return "Please complete your account details before continuing.";
      }
      return null;
    }
    if (currentStep === 2) {
      if (!values.organisationName || !values.organisationSlug) {
        return "Organisation name and slug are required.";
      }
      return null;
    }
    return null;
  }

  function handleStepNext() {
    const stepError = validateCurrentStep();
    if (stepError) {
      setError(stepError);
      return;
    }
    setError(null);
    setOrganisationStep((previous) => Math.min(previous + 1, 3));
  }

  function handleStepBack() {
    setError(null);
    setOrganisationStep((previous) => Math.max(previous - 1, 1));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await apiClient.create("users/register/", payload);
      await login(values.email, values.password);
      navigate("/", { replace: true });
    } catch (regError) {
      consumeApiError(regError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-slate-950 text-white lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.35),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(13,148,136,0.24),transparent_30%)]" />
        <div className="relative">
          <div className="mb-8 inline-block rounded-2xl bg-white px-5 py-4 shadow-lg shadow-black/20">
            <MakerSpaceOpsLogo variant="hero" />
          </div>
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-teal-200">
            MakerSpace
          </p>
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
            Create an account, then start a new organisation or join an existing lab.
          </p>
          {isOrganisationSignup ? (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>
                {currentStep === 1
                  ? "Account details"
                  : currentStep === 2
                    ? "Organisation profile"
                    : "Address details"}
              </span>
            </div>
          ) : null}
          <div className="mt-6 space-y-4">
            <SignupTypeSelector value={values.signupType} onChange={setSignupType} />
            {currentStep === 1 ? (
              <MemberSignupFields
                firstName={values.firstName}
                lastName={values.lastName}
                email={values.email}
                phoneNumber={values.phoneNumber}
                password={values.password}
                onChange={setField}
              />
            ) : null}
            {isOrganisationSignup && currentStep === 2 ? (
              <OrganisationSignupFields
                mode="profile"
                organisationName={values.organisationName}
                organisationSlug={values.organisationSlug}
                organisationDescription={values.organisationDescription}
                organisationPhone={values.organisationPhone}
                organisationWebsite={values.organisationWebsite}
                organisationLogoUrl={values.organisationLogoUrl}
                address={values.organisationAddress}
                onFieldChange={setField}
                onAddressFieldChange={setAddressField}
              />
            ) : null}
            {isOrganisationSignup && currentStep === 3 ? (
              <OrganisationSignupFields
                mode="address"
                organisationName={values.organisationName}
                organisationSlug={values.organisationSlug}
                organisationDescription={values.organisationDescription}
                organisationPhone={values.organisationPhone}
                organisationWebsite={values.organisationWebsite}
                organisationLogoUrl={values.organisationLogoUrl}
                address={values.organisationAddress}
                onFieldChange={setField}
                onAddressFieldChange={setAddressField}
              />
            ) : null}
          </div>
          {error ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
          {isOrganisationSignup ? (
            <div className="mt-7 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleStepBack}
                disabled={currentStep === 1 || isSubmitting}
              >
                Back
              </Button>
              {currentStep < totalSteps ? (
                <Button type="button" className="flex-1" onClick={handleStepNext}>
                  Continue
                </Button>
              ) : (
                <Button className="flex-1" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Creating account..." : "Register & Continue"}
                </Button>
              )}
            </div>
          ) : (
            <Button className="mt-7 w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Register & Continue"}
            </Button>
          )}
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
export { LandingPage } from "./landing-page";

