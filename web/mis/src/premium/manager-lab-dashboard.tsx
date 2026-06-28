import { Link, useParams } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Boxes,
  CalendarCheck,
  FlaskConical,
  ListChecks,
  Settings,
  Users,
  Wrench,
} from "lucide-react";

import { KpiCard, PremiumSurface } from "@mono/shared_ui/components/premium";
import { Button } from "@mono/shared_ui/components/ui/button";
import { endpoints, type Entity } from "@mono/api_client";

import { usePagedResource } from "./api-hooks";
type ManagerLabDashboardProps = {
  labName?: string;
};

export function ManagerLabDashboard({ labName }: ManagerLabDashboardProps) {
  const { orgId, labId } = useParams();
  const machines = usePagedResource<Entity>(labId ? endpoints.machines.list(labId) : null, orgId);
  const inventory = usePagedResource<Entity>(labId ? endpoints.inventory.items(labId) : null, orgId);
  const projects = usePagedResource<Entity>(labId ? endpoints.projects.list(labId) : null, orgId);
  const members = usePagedResource<Entity>(
    orgId && labId ? endpoints.labs.members(orgId, labId) : null,
    orgId
  );
  const attendance = usePagedResource<Entity>(
    labId ? `${endpoints.attendance.list(labId)}?status=PENDING` : null,
    orgId
  );
  const projectOrders = usePagedResource<Entity>(
    labId ? `${endpoints.projects.pendingOrders}?lab_id=${labId}` : endpoints.projects.pendingOrders,
    orgId
  );
  const machineReservations = usePagedResource<Entity>(
    labId
      ? `${endpoints.machines.pendingReservations}?lab_id=${labId}`
      : endpoints.machines.pendingReservations,
    orgId
  );
  const joinRequests = usePagedResource<Entity>(
    orgId ? `${endpoints.organisations.joinRequests(orgId)}?status=PENDING` : null,
    orgId
  );

  const pendingAttendance = attendance.rows.length;
  const pendingApprovals =
    joinRequests.rows.length +
    pendingAttendance +
    projectOrders.rows.length +
    machineReservations.rows.length;

  if (!orgId || !labId) return null;

  const labBase = `/${orgId}/lab/${labId}`;
  const orgBase = `/${orgId}`;

  const quickLinks = [
    {
      label: "Approvals",
      description: `${pendingApprovals} item(s) need your review`,
      to: `${labBase}/approval`,
      icon: Activity,
    },
    {
      label: "Lab members",
      description: `${members.rows.length} people in this lab`,
      to: `${labBase}/users`,
      icon: Users,
    },
    {
      label: "Lab settings",
      description: "Hours, booking policy, and lab profile",
      to: `${labBase}/edit-lab`,
      icon: Settings,
    },
    {
      label: "Reports",
      description: "Analytics and operational dashboards",
      to: `${orgBase}/reports`,
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 p-8 text-white shadow-lg dark:border-white/10">
        <div className="pointer-events-none absolute -right-12 -top-16 size-56 rounded-full bg-teal-400/20 blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-200/90">
          Lab manager
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          {labName ?? "Lab"} overview
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
          Your command view for approvals, people, settings, and lab health — without user
          ordering flows.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Pending approvals"
          value={String(pendingApprovals)}
          helper="Join, attendance, orders, bookings"
          icon={<Activity className="size-5" />}
          trend="Action"
          direction="flat"
        />
        <KpiCard
          label="Lab members"
          value={String(members.rows.length)}
          helper="Active memberships"
          icon={<Users className="size-5" />}
          trend="Team"
          direction="flat"
        />
        <KpiCard
          label="Machines"
          value={String(machines.rows.length)}
          helper="Equipment in this lab"
          icon={<Wrench className="size-5" />}
          trend="Ops"
          direction="flat"
        />
        <KpiCard
          label="Projects"
          value={String(projects.rows.length)}
          helper="Research workstreams"
          icon={<ListChecks className="size-5" />}
          trend="Ops"
          direction="flat"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <PremiumSurface
              key={link.to}
              className="flex h-full flex-col justify-between p-6 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div>
                <span className="inline-flex rounded-xl bg-teal-600/10 p-3 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
                  <Icon className="size-5" />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">
                  {link.label}
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{link.description}</p>
              </div>
              <Button asChild className="mt-6 w-full bg-teal-600 hover:bg-teal-700">
                <Link to={link.to}>Open</Link>
              </Button>
            </PremiumSurface>
          );
        })}
      </div>

      <PremiumSurface className="p-6">
        <h2 className="text-base font-semibold text-slate-950 dark:text-white">Lab pulse</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Snapshot for decisions — open Approvals for queues.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <PulseStat label="Inventory items" value={String(inventory.rows.length)} icon={Boxes} />
          <PulseStat
            label="Attendance pending"
            value={String(pendingAttendance)}
            icon={CalendarCheck}
          />
          <PulseStat
            label="Inventory orders"
            value={String(projectOrders.rows.length)}
            icon={FlaskConical}
          />
          <PulseStat
            label="Machine bookings"
            value={String(machineReservations.rows.length)}
            icon={Wrench}
          />
        </div>
      </PremiumSurface>
    </div>
  );
}

function PulseStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Boxes;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
