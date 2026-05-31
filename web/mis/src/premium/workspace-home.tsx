import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  FlaskConical,
  Plus,
  Sparkles,
  UserCircle,
} from "lucide-react";

import { KpiCard, PremiumSurface } from "@mono/shared_ui/components/premium";
import { Button } from "@mono/shared_ui/components/ui/button";

type WorkspaceHomeHeroProps = {
  userName: string;
  organisationCount: number;
  canCreateOrganisation: boolean;
  isLoading?: boolean;
};

export function WorkspaceHomeHero({
  userName,
  organisationCount,
  canCreateOrganisation,
  isLoading,
}: WorkspaceHomeHeroProps) {
  const firstName = userName.split(" ")[0] || "there";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-teal-200/60 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 p-8 text-white shadow-[0_24px_80px_-40px_rgba(13,148,136,0.45)] dark:border-teal-800/40">
      <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-teal-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/4 size-72 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-teal-100">
            <Sparkles className="size-3.5" />
            Technoventor MIS workspace
          </div>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Welcome back, {firstName}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300 md:text-base">
            {canCreateOrganisation && organisationCount === 0
              ? "Set up your organisation to run labs, machines, inventory, and member workflows in one place."
              : canCreateOrganisation
                ? "Open an existing organisation or create another tenant if you run multiple labs or ventures."
                : organisationCount > 0
                  ? "Open your organisation below to reach labs, bookings, and tools assigned to your role."
                  : "Join a lab to get access, or accept an invite from your administrator."}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-200/90">
              Your access
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {isLoading ? "…" : organisationCount}
            </p>
            <p className="text-sm text-slate-300">
              organisation{organisationCount === 1 ? "" : "s"} linked to this account
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-200/90">
              Navigation
            </p>
            <p className="mt-2 text-sm text-slate-200">
              Menu items match your lab role — managers see approvals and settings; members see
              day-to-day tools only.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

type WorkspaceActionCardProps = {
  title: string;
  description: string;
  to: string;
  icon: ReactNode;
  variant?: "primary" | "secondary";
  label: string;
};

function WorkspaceActionCard({
  title,
  description,
  to,
  icon,
  variant = "secondary",
  label,
}: WorkspaceActionCardProps) {
  const isPrimary = variant === "primary";
  return (
    <PremiumSurface
      className={`group flex h-full flex-col justify-between p-6 transition hover:-translate-y-0.5 hover:shadow-lg ${
        isPrimary
          ? "border-teal-200 bg-gradient-to-br from-teal-50 to-white dark:border-teal-800/50 dark:from-teal-950/40 dark:to-slate-950"
          : ""
      }`}
    >
      <div>
        <div
          className={`mb-4 inline-flex rounded-xl p-3 ${
            isPrimary
              ? "bg-teal-600 text-white"
              : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"
          }`}
        >
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>
      <Button
        asChild
        className={`mt-6 w-full ${isPrimary ? "bg-teal-600 hover:bg-teal-700" : ""}`}
        variant={isPrimary ? "default" : "outline"}
      >
        <Link to={to}>
          {label}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </PremiumSurface>
  );
}

export function WorkspaceQuickActions({
  canCreateOrganisation,
}: {
  canCreateOrganisation: boolean;
}) {
  return (
    <div
      className={`grid gap-4 ${canCreateOrganisation ? "md:grid-cols-3" : "md:grid-cols-2"}`}
    >
      {canCreateOrganisation ? (
        <WorkspaceActionCard
          variant="primary"
          title="Create organisation"
          description="For new accounts or organisation admins starting another tenant. You become admin and can add labs and invite members."
          to="/create-organization"
          icon={<Plus className="size-5" />}
          label="Create organisation"
        />
      ) : null}
      <WorkspaceActionCard
        title="Join a laboratory"
        description="Browse active labs and send a join request. A lab manager will approve your membership."
        to="/request_lab"
        icon={<FlaskConical className="size-5" />}
        label="Browse labs"
      />
      <WorkspaceActionCard
        title="Invitations & profile"
        description="Accept pending invites or paste an invite token to join an existing team."
        to="/profile"
        icon={<UserCircle className="size-5" />}
        label="Open profile"
      />
    </div>
  );
}

export function WorkspaceHomeMetrics({
  organisationCount,
  isLoading,
}: {
  organisationCount: number;
  isLoading?: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <KpiCard
        label="Organisations"
        value={isLoading ? "…" : String(organisationCount)}
        helper="Workspaces you can open"
        icon={<Building2 className="size-5" />}
        trend="Live"
        direction="flat"
      />
      <KpiCard
        label="Access model"
        value="Role-based"
        helper="Sidebar matches your lab permissions"
        icon={<Sparkles className="size-5" />}
        trend="IAM"
        direction="flat"
      />
      <KpiCard
        label="Next step"
        value={organisationCount > 0 ? "Open lab" : "Get access"}
        helper={
          organisationCount > 0
            ? "Choose an organisation, then a lab"
            : "Join a lab or wait for an invite"
        }
        icon={<FlaskConical className="size-5" />}
        trend="Guide"
        direction="flat"
      />
    </div>
  );
}
