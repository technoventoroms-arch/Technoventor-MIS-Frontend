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

  return (
    <PageFrame
      eyebrow="Account"
      title="Profile"
      description="Keep your MIS identity aligned with the Django user profile."
      metrics={[
        metric("Session", user?.email ?? "Signed in", "JWT profile", <UserCircle />),
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
      description="Update tenant profile fields through the active organisation API."
      metrics={[
        metric("Organisation", organisation?.name ?? `#${orgId}`, "Editable tenant", <Building2 />),
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
      description="Premium reporting surface for organisation and lab analytics."
      metrics={[
        metric("Scope", labId ? `Lab #${labId}` : `Org #${orgId}`, "Reporting context", <BarChart3 />),
        metric("Provider", reportUrl ? "Metabase" : "Not configured", "VITE_PUBLIC_METABASE_ENDPOINT", <Settings />),
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
          description="Set VITE_PUBLIC_METABASE_ENDPOINT to expose the premium reporting dashboard."
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
