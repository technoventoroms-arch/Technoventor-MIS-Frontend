import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  BarChart3,
  Building2,
  CalendarClock,
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
import { Input } from "@mono/shared_ui/components/ui/input";
import { Label } from "@mono/shared_ui/components/ui/label";
import { Switch } from "@mono/shared_ui/components/ui/switch";

import { type UserInvitation } from "@mono/api_client";
import { isLabManagerRoleName } from "./lab-manager-access";

import { useAuth } from "./auth";
import { useLabPermissions } from "./lab-permissions";
import { P } from "./permission-codes";
import { useIsOrgAdmin } from "./use-org-admin";
import {
  defaultBookingPolicy,
  formatMinutesAsTime,
  parseTimeToMinutes,
  type LabBookingPolicy,
} from "./booking-utils";
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

function workspacePathFromInvite(invite: UserInvitation): string {
  const orgId = invite.organisation_id;
  const labId = invite.lab_id;
  if (orgId && labId) return `/${orgId}/lab/${labId}`;
  if (orgId) return `/${orgId}/labs`;
  return "/";
}

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [invites, setInvites] = useState<UserInvitation[]>([]);
  const [token, setToken] = useState("");
  const [tokenFeedback, setTokenFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isTokenSubmitting, setIsTokenSubmitting] = useState(false);

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

  const handleAcceptInvite = async (
    invite: UserInvitation,
    state: "ACCEPTED" | "REJECTED"
  ) => {
    try {
      const res = await apiClient.update<any>(`users/me/invitations/${invite.id}/`, {
        status: state,
      });
      if (!res.error) {
        setInvites((prev) => prev.filter((i) => i.id !== invite.id));
        await refreshUser();
        if (state === "ACCEPTED") {
          toast.success("Invitation accepted. Opening your workspace.");
          navigate(workspacePathFromInvite(invite));
        } else {
          toast.success("Invitation rejected.");
        }
      }
    } catch (err) {}
  };

  const handleManualInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    setIsTokenSubmitting(true);
    setTokenFeedback(null);
    try {
      const res = await apiClient.create<any>(`organisations/invites/${token.trim()}/accept/`, {});
      if (!res.error) {
        setTokenFeedback({ type: "success", message: "Successfully joined the organisation!" });
        setToken("");
        await refreshUser();
        const invitesRes = await apiClient.get<{ error?: boolean; data?: UserInvitation[] }>(
          "users/me/invitations"
        );
        if (!invitesRes.error && Array.isArray(invitesRes.data)) {
          setInvites(invitesRes.data);
        }
        const orgId = res.data?.organisation_id ?? res.organisation_id;
        const labId = res.data?.lab_id ?? res.lab_id;
        toast.success("Successfully joined the organisation!");
        if (orgId && labId) {
          navigate(`/${orgId}/lab/${labId}`);
        } else if (orgId) {
          navigate(`/${orgId}/labs`);
        } else {
          navigate("/");
        }
      } else {
        setTokenFeedback({ type: "error", message: res.message || "Failed to accept invitation." });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to accept invitation. Make sure the token is valid.";
      setTokenFeedback({ type: "error", message: msg });
    } finally {
      setIsTokenSubmitting(false);
    }
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

      <PremiumSurface className="mt-6 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Accept Invite by Token
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Have a unique invitation token? Paste it below to join the organisation immediately.
          </p>
        </div>
        <form onSubmit={handleManualInviteSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label htmlFor="token" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Invitation Token
            </label>
            <input
              id="token"
              type="text"
              placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder-slate-400 focus:border-teal-500 focus:ring-teal-500 dark:border-white/10 dark:bg-white/[0.03]"
              required
            />
          </div>
          <Button type="submit" disabled={isTokenSubmitting} className="h-10 shrink-0">
            {isTokenSubmitting ? "Accepting..." : "Accept Invite"}
          </Button>
        </form>
        {tokenFeedback && (
          <div
            className={`mt-4 rounded-md p-3 text-sm ${
              tokenFeedback.type === "success"
                ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
            }`}
          >
            {tokenFeedback.message}
          </div>
        )}
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
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-pink-50 px-2 py-1 text-xs font-medium text-pink-700 ring-1 ring-inset ring-pink-700/10 dark:bg-pink-400/10 dark:text-pink-400 dark:ring-pink-400/20">
                      {invite.role_name}
                    </span>
                  </div>
                  {isLabManagerRoleName(invite.role_name) ? (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {invite.can_manage_inventory === true
                        ? `Includes inventory management for ${invite.lab_name}.`
                        : "Does not include inventory management."}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/30"
                    onClick={() => handleAcceptInvite(invite, "REJECTED")}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                    onClick={() => handleAcceptInvite(invite, "ACCEPTED")}
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
  const isOrgAdmin = useIsOrgAdmin(orgId);
  const { canAny } = useLabPermissions();
  const canManageBooking = isOrgAdmin || canAny(P.SETTINGS_WRITE, P.LABS_WRITE);
  const [lab, setLab] = useState<Entity | null>(null);
  const [booking, setBooking] = useState<LabBookingPolicy>(defaultBookingPolicy);
  const [isSavingBooking, setIsSavingBooking] = useState(false);

  useEffect(() => {
    if (!orgId || !labId) return;
    apiClient.get<Entity>(endpoints.labs.detail(orgId, labId), { orgId }).then(setLab);
    apiClient
      .get<LabBookingPolicy>(endpoints.labs.bookingPolicy(orgId, labId), { orgId })
      .then((policy) => setBooking({ ...defaultBookingPolicy, ...policy }))
      .catch(() => {});
  }, [labId, orgId]);

  if (!orgId || !labId) return null;

  const windowStart = formatMinutesAsTime(parseTimeToMinutes(booking.booking_window_start));
  const windowEnd = formatMinutesAsTime(parseTimeToMinutes(booking.booking_window_end));

  return (
    <PageFrame
      eyebrow="Settings"
      title="Lab"
      description="Update lab profile and control machine booking hours for members."
      metrics={[
        metric("Lab", lab?.name ?? `#${labId}`, "Editable facility", <FlaskConical />),
        metric(
          "Bookings",
          booking.booking_enabled ? "On" : "Off",
          `${windowStart}–${windowEnd}`,
          <CalendarClock />
        ),
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <PremiumSurface className="p-6">
          <SectionHeader title="Lab profile" description="Name, contact, and location." />
          {isOrgAdmin ? (
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
                toast.success("Lab profile saved.");
              }}
            />
          ) : (
            <EmptyState
              title="Organisation admin only"
              description="Lab profile changes are managed at organisation level. You can still control booking policy on the right."
            />
          )}
        </PremiumSurface>

        <PremiumSurface className="p-6">
          <SectionHeader
            title="Machine booking policy"
            description="Turn bookings on or off anytime and set allowed hours for student reservations."
          />
          {!canManageBooking ? (
            <EmptyState
              title="Manager access required"
              description="Only lab managers and organisation admins can change booking policy."
            />
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <div>
                  <Label htmlFor="booking-enabled">Allow machine bookings</Label>
                  <p className="text-xs text-slate-500">
                    When off, members cannot create reservations and IoT unlock requires no booking.
                  </p>
                </div>
                <Switch
                  id="booking-enabled"
                  checked={booking.booking_enabled}
                  onCheckedChange={(checked) =>
                    setBooking((current) => ({ ...current, booking_enabled: checked }))
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="window-start">Booking opens at</Label>
                  <Input
                    id="window-start"
                    type="time"
                    value={windowStart}
                    onChange={(event) =>
                      setBooking((current) => ({
                        ...current,
                        booking_window_start: `${event.target.value}:00`,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="window-end">Booking closes at</Label>
                  <Input
                    id="window-end"
                    type="time"
                    value={windowEnd}
                    onChange={(event) =>
                      setBooking((current) => ({
                        ...current,
                        booking_window_end: `${event.target.value}:00`,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slot-duration">Suggested slot length (minutes)</Label>
                  <Input
                    id="slot-duration"
                    type="number"
                    min={1}
                    value={booking.slot_duration_minutes}
                    onChange={(event) =>
                      setBooking((current) => ({
                        ...current,
                        slot_duration_minutes: Number(event.target.value) || 60,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grace">No-show grace (minutes)</Label>
                  <Input
                    id="grace"
                    type="number"
                    min={0}
                    value={booking.no_show_grace_minutes ?? 30}
                    onChange={(event) =>
                      setBooking((current) => ({
                        ...current,
                        no_show_grace_minutes: Number(event.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>
              <Button
                disabled={isSavingBooking}
                onClick={async () => {
                  setIsSavingBooking(true);
                  try {
                    const updated = await apiClient.update<LabBookingPolicy>(
                      endpoints.labs.bookingPolicy(orgId, labId),
                      booking,
                      { orgId }
                    );
                    setBooking({ ...defaultBookingPolicy, ...updated });
                    toast.success("Booking policy saved.");
                  } catch (error: unknown) {
                    const message =
                      error instanceof Error ? error.message : "Could not save booking policy.";
                    toast.error(message);
                  } finally {
                    setIsSavingBooking(false);
                  }
                }}
              >
                {isSavingBooking ? "Saving…" : "Save booking policy"}
              </Button>
            </div>
          )}
        </PremiumSurface>
      </div>
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
