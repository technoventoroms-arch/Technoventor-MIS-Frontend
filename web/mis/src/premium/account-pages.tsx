import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import {
  BarChart3,
  Building2,
  FlaskConical,
  Settings,
  UserCircle,
} from "lucide-react";

import { apiClient, endpoints, type Entity } from "@mono/api_client";
import {
  EmptyState,
  KpiCard,
  PremiumSurface,
  SectionHeader,
} from "@mono/shared_ui/components/premium";
import { Button } from "@mono/shared_ui/components/ui/button";

import { useAuth } from "./auth";
import { ResourceForm, type ResourceField } from "./resource-forms";

const profileFields: ResourceField[] = [
  { name: "first_name", label: "First name" },
  { name: "last_name", label: "Last name" },
  { name: "email", label: "Email", type: "email", required: true },
];

const organisationFields: ResourceField[] = [
  { name: "name", label: "Organisation name", required: true },
  { name: "slug", label: "Unique slug", required: true },
  { name: "phone", label: "Phone" },
  { name: "website", label: "Website" },
  { name: "logo_url", label: "Logo URL" },
  { name: "address", label: "Address", type: "textarea" },
  { name: "description", label: "Description", type: "textarea" },
];

const labFields: ResourceField[] = [
  { name: "name", label: "Lab name", required: true },
  { name: "phone", label: "Phone" },
  { name: "image_url", label: "Image URL" },
  { name: "address", label: "Address", type: "textarea" },
  { name: "description", label: "Description", type: "textarea" },
];

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [invites, setInvites] = useState<any[]>([]);

  useEffect(() => {
    apiClient
      .get<{ error?: boolean; data?: any[] }>("users/me/invitations")
      .then((res) => {
        if (!res.error && Array.isArray(res.data)) {
          setInvites(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleAcceptInvite = async (inviteId: number, state: "ACCEPTED" | "REJECTED") => {
    try {
      const res = await apiClient.update<any>(`users/me/invitations/${inviteId}/`, {
        status: state,
      });
      if (!res.error) {
        setInvites((prev) => prev.filter((i) => i.id !== inviteId));
        await refreshUser();
      }
    } catch (err) {}
  };

  return (
    <PageFrame
      eyebrow="Account"
      title="Profile"
      description="Manage your profile details used across Technoventor MIS."
      metrics={[
        metric("Account", user?.email ?? "Signed in", "Profile details", <UserCircle />),
      ]}
    >
      <PremiumSurface className="p-6">
        <ResourceForm
          fields={profileFields}
          initialValues={user as Entity | null}
          submitLabel="Update profile"
          onSubmit={async (values) => {
            await apiClient.update("users/me/", values);
            await refreshUser();
          }}
        />
      </PremiumSurface>

      {invites.length > 0 && (
        <PremiumSurface className="mt-6 p-6">
          <SectionHeader
            title="My Invitations"
            description="Pending invitations to join organizations and laboratories."
          />
          <div className="mt-6 space-y-4">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {invite.organisation_name}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Lab: <span className="font-medium">{invite.lab_name}</span>
                  </div>
                  <div className="mt-1">
                    <span className="inline-flex items-center rounded-md bg-pink-50 px-2 py-1 text-xs font-medium text-pink-700 ring-1 ring-inset ring-pink-700/10 dark:bg-pink-400/10 dark:text-pink-400 dark:ring-pink-400/20">
                      {invite.role_name}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/30"
                    onClick={() => handleAcceptInvite(invite.id, "REJECTED")}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                    onClick={() => handleAcceptInvite(invite.id, "ACCEPTED")}
                  >
                    Accept
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </PremiumSurface>
      )}
    </PageFrame>
  );
}

export function OrganisationSettingsPage() {
  const { orgId } = useParams();
  const [organisation, setOrganisation] = useState<Entity | null>(null);

  useEffect(() => {
    if (!orgId) return;
    apiClient.get<Entity>(endpoints.organisations.detail(orgId), { orgId }).then(setOrganisation);
  }, [orgId]);

  if (!orgId) return null;

  return (
    <PageFrame
      eyebrow="Settings"
      title="Organization"
      description="Update organisation profile and operational details."
      metrics={[
        metric("Organisation", organisation?.name ?? `#${orgId}`, "Profile", <Building2 />),
      ]}
    >
      <PremiumSurface className="p-6">
        <ResourceForm
          fields={organisationFields}
          initialValues={organisation}
          submitLabel="Save Organization"
          onSubmit={async (values) => {
            const updated = await apiClient.update<Entity>(
              endpoints.organisations.detail(orgId),
              values,
              { orgId }
            );
            setOrganisation(updated);
          }}
        />
      </PremiumSurface>
    </PageFrame>
  );
}

export function LabSettingsPage() {
  const { orgId, labId } = useParams();
  const [lab, setLab] = useState<Entity | null>(null);

  useEffect(() => {
    if (!orgId || !labId) return;
    apiClient.get<Entity>(endpoints.labs.detail(orgId, labId), { orgId }).then(setLab);
  }, [labId, orgId]);

  if (!orgId || !labId) return null;

  return (
    <PageFrame
      eyebrow="Settings"
      title="Lab"
      description="Update lab profile fields, location, and operating details."
      metrics={[
        metric("Lab", lab?.name ?? `#${labId}`, "Editable facility", <FlaskConical />),
      ]}
    >
      <PremiumSurface className="p-6">
        <ResourceForm
          fields={labFields}
          initialValues={lab}
          submitLabel="Save lab"
          onSubmit={async (values) => {
            const updated = await apiClient.update<Entity>(
              endpoints.labs.detail(orgId, labId),
              values,
              { orgId }
            );
            setLab(updated);
          }}
        />
      </PremiumSurface>
    </PageFrame>
  );
}

export function ReportsPage() {
  const { orgId, labId } = useParams();
  const reportingBaseUrl = getReportingBaseUrl();
  const reportUrl = reportingBaseUrl
    ? buildReportUrl(reportingBaseUrl, { orgId, labId })
    : null;

  return (
    <PageFrame
      eyebrow="Insights"
      title="Reports"
      description="Reports and analytics for organisation and lab activity."
      metrics={[
        metric("Scope", labId ? `Lab #${labId}` : `Org #${orgId}`, "Reporting context", <BarChart3 />),
        metric("Provider", reportUrl ? "Connected" : "Not configured", "Reporting service", <Settings />),
      ]}
    >
      {reportUrl ? (
        <PremiumSurface className="overflow-hidden p-0">
          <iframe
            title="MIS reporting dashboard"
            src={reportUrl}
            className="h-[72vh] w-full border-0"
            loading="lazy"
          />
        </PremiumSurface>
      ) : (
        <EmptyState
          title="Reporting endpoint not configured"
          description="Reports dashboard is not configured yet. Contact your administrator to enable it."
          icon={<BarChart3 className="size-7" />}
        />
      )}
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
          {metrics.map((item) => (
            <KpiCard
              key={item.label}
              label={item.label}
              value={String(item.value)}
              helper={item.helper}
              icon={<span className="[&>svg]:size-5">{item.icon}</span>}
              trend="Live"
            />
          ))}
        </div>
      ) : null}
      {children}
    </div>
  );
}

type Metric = {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
};

function metric(label: string, value: unknown, helper: string, icon: ReactNode): Metric {
  return { label, value: String(value), helper, icon };
}

function getReportingBaseUrl(): string | null {
  const meta = import.meta as ImportMeta & {
    env?: Record<string, string | undefined>;
  };
  return meta.env?.VITE_PUBLIC_METABASE_ENDPOINT ?? null;
}

function buildReportUrl(
  baseUrl: string,
  context: { orgId?: string; labId?: string }
): string {
  const url = new URL(baseUrl, window.location.origin);
  if (context.orgId) url.searchParams.set("orgId", context.orgId);
  if (context.labId) url.searchParams.set("labId", context.labId);
  return url.toString();
}
