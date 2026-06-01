import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  Boxes,
  Building2,
  CalendarCheck,
  DoorOpen,
  FileText,
  FlaskConical,
  Gauge,
  ListChecks,
  Loader2,
  Plus,
  Radio,
  ShoppingCart,
  Users,
  Wrench,
} from "lucide-react";

import {
  EmptyState,
  KpiCard,
  PremiumDataTable,
  PremiumSurface,
  SectionHeader,
  StatusBadge,
  type PremiumColumn,
} from "@mono/shared_ui/components/premium";
import { Button } from "@mono/shared_ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@mono/shared_ui/components/ui/dialog";
import { Label } from "@mono/shared_ui/components/ui/label";
import { Input } from "@mono/shared_ui/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@mono/shared_ui/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@mono/shared_ui/components/ui/tabs";
import { Textarea } from "@mono/shared_ui/components/ui/textarea";
import {
  formatDisplayValue,
  formatLocalDateTime,
} from "@mono/shared_ui/lib/format-datetime";
import {
  apiClient,
  endpoints,
  normalizeApiError,
  type Entity,
} from "@mono/api_client";

import { usePagedResource } from "./api-hooks";
import { useOrganisationAccess } from "./use-organisation-access";
import { useJoinLabVisibility } from "./use-join-lab-visibility";
import { entityNameCell, entityTitle } from "./entity-display";
import { RequireLabFeature } from "./lab-feature-guard";
import { useAuth } from "./auth";
import { useLabPermissions } from "./lab-permissions";
import { P } from "./permission-codes";
import {
  buildSlotCandidates,
  defaultBookingPolicy,
  formatMinutesAsTime,
  minBookingDateLocal,
  parseTimeToMinutes,
  localDateTimeToApiIso,
  validateCustomReservation,
  type LabBookingPolicy,
} from "./booking-utils";
import { MachineDevicePanel } from "./machine-device-panel";
import { BookingCalendar } from "./booking-calendar";
import { InviteMemberDialog } from "./invite-member-dialog";
import { LabMemberAssignDialog } from "./lab-member-assign-dialog";
import { isLabManagerRoleName } from "./lab-manager-access";
import { toast } from "sonner";
import {
  ResourceCrudTable,
  ResourceForm,
  ResourceFormDialog,
  type FieldOption,
  type ResourceField,
} from "./resource-forms";

type Metric = {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
};

type ApiRow = Entity & {
  user?: Entity & { full_name?: string; email?: string };
  role?: Entity;
  plan?: Entity;
  is_active?: boolean;
  is_below_threshold?: boolean;
};

const orgFields: ResourceField[] = [
  { name: "name", label: "Organisation name", required: true, placeholder: "Fab Lab India" },
  { name: "slug", label: "Unique slug", required: true, placeholder: "fab-lab-india" },
  { name: "phone", label: "Phone", placeholder: "+91..." },
  { name: "website", label: "Website", placeholder: "https://example.com" },
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

const machineFields: ResourceField[] = [
  { name: "name", label: "Machine name", required: true },
  { name: "model_number", label: "Model number" },
  { name: "purchased_at", label: "Purchased at", type: "date" },
  { name: "image_url", label: "Image URL" },
  { name: "description", label: "Description", type: "textarea" },
];

const projectFields: ResourceField[] = [
  { name: "title", label: "Project title", required: true },
  { name: "start_date", label: "Start date", type: "date" },
  { name: "end_date", label: "End date", type: "date" },
  { name: "description", label: "Description", type: "textarea" },
];

/** @deprecated Use `OrganisationSwitcherPage` from `./pages` (router entry). */
export function OrganisationSwitcherPage() {
  const { resource, canCreateOrganisation } = useOrganisationAccess(true);
  const { showJoinLab } = useJoinLabVisibility();

  return (
    <PageFrame
      eyebrow="Workspace"
      title="My Organizations"
      description="Choose the organisation that contains your labs, people, and day-to-day operations."
      metrics={[
        metric("Organisations", resource.rows.length, "Your organisations", <Building2 />),
        metric("Access", "Secure", "Role-based access", <Gauge />),
        metric("Operations", "Live", "Production workflow", <Activity />),
      ]}
    >
      <PremiumDataTable
        title="My Organizations"
        description={resource.error?.message ?? "Your organisations and available workspaces."}
        columns={[
          nameColumn(),
          {
            key: "active",
            header: "Status",
            render: (row) => <StatusBadge>{row.is_active === false ? "inactive" : "active"}</StatusBadge>,
          },
          dateColumn(),
          {
            key: "open",
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
        emptyDescription={
          canCreateOrganisation
            ? "Create an organisation to unlock the MIS workspace."
            : "Join a lab or accept an invite to get access."
        }
        actions={
          <div className="flex flex-wrap gap-2">
            {showJoinLab ? (
              <Button asChild variant="outline">
                <Link to="/request_lab">
                  <DoorOpen className="size-4" />
                  Join Lab
                </Link>
              </Button>
            ) : null}
            {canCreateOrganisation ? (
              <Button asChild>
                <Link to="/create-organization">
                  <Plus className="size-4" />
                  Create Org
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />
    </PageFrame>
  );
}

export function CreateOrganisationPage() {
  const navigate = useNavigate();
  const { canCreateOrganisation, isLoading } = useOrganisationAccess(true);

  if (isLoading) {
    return (
      <PageFrame
        eyebrow="Create"
        title="Create New Organization"
        description="Checking your workspace access…"
      >
        <PremiumSurface className="flex items-center justify-center p-12">
          <Loader2 className="size-8 animate-spin text-teal-600" />
        </PremiumSurface>
      </PageFrame>
    );
  }

  if (!canCreateOrganisation) {
    return <Navigate to="/" replace />;
  }

  return (
    <PageFrame
      eyebrow="Create"
      title="Create New Organization"
      description="Create a new organisation with you as the administrator. You can add labs and invite members next."
    >
      <PremiumSurface className="p-6">
        <ResourceForm
          fields={orgFields}
          submitLabel="Create Org"
          onSubmit={async (values) => {
            await apiClient.create(endpoints.organisations.list, values);
            const organisations = await apiClient.list<ApiRow>(endpoints.organisations.list);
            const created = organisations.results.find((row) => row.slug === values.slug);
            navigate(created ? `/${created.id}/dashboard` : "/");
          }}
        />
      </PremiumSurface>
    </PageFrame>
  );
}

export function RequestLabPage() {
  const { showJoinLab, isLoading } = useJoinLabVisibility();
  const availableLabs = usePagedResource<ApiRow>(endpoints.labs.available);

  if (!isLoading && !showJoinLab) {
    return <Navigate to="/" replace />;
  }

  return (
    <PageFrame
      eyebrow="Join Lab"
      title="Join Lab"
      description="Request access to labs and continue the onboarding workflow."
      metrics={[
        metric("Labs", availableLabs.rows.length, "Available to request", <DoorOpen />),
      ]}
    >
      <ResourceCrudTable
        title="Available Labs"
        description={availableLabs.error?.message ?? "Discover active labs and submit join requests."}
        resource={availableLabs}
        fields={[]}
        columns={[
          nameColumn(),
          statusColumn(),
          textColumn("organisation", "Organization"),
          {
            key: "address",
            header: "Address",
            render: (row) => String(row.address ?? "Not set"),
          },
          {
            key: "request",
            header: "Request",
            render: (row) => (
              <Button size="sm" variant="outline" onClick={() => apiClient.create(endpoints.labs.joinRequest(row.id), {})}>
                Request access
              </Button>
            ),
          },
        ]}
        rowActions={[]}
      />
    </PageFrame>
  );
}

export function OrgDashboardPage() {
  const { orgId } = useParams();
  const labs = usePagedResource<ApiRow>(orgId ? endpoints.labs.list(orgId) : null, orgId);
  const members = usePagedResource<ApiRow>(
    orgId ? endpoints.organisations.members(orgId) : null,
    orgId
  );
  return (
    <PageFrame
      eyebrow="Organisation"
      title="Dashboard"
      description="Overview of labs, teams, and high-priority work."
      metrics={[
        metric("Labs", labs.rows.length, "Facilities online", <FlaskConical />),
        metric("Members", members.rows.length, "Organisation users", <Users />),
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <CompactTable title="Labs" resource={labs} />
        <CompactTable title="Members" resource={members} columns={[memberColumn(), roleColumn()]} />
      </div>
    </PageFrame>
  );
}

export function LabsPage() {
  const { orgId } = useParams();
  const { isOrgAdmin } = useOrgRole(orgId);
  const resource = usePagedResource<ApiRow>(orgId ? endpoints.labs.list(orgId) : null, orgId);

  if (!orgId) return null;
  return (
    <PageFrame
      eyebrow="Facilities"
      title="Labs"
      description="Create labs, open lab workspaces, and manage physical locations."
      metrics={[metric("Labs", resource.rows.length, "Current page", <FlaskConical />)]}
    >
      <ResourceCrudTable
        title="Labs"
        description="Organisation-scoped labs with workspace access and controls."
        resource={resource}
        fields={labFields}
        orgId={orgId}
        createPath={isOrgAdmin ? endpoints.labs.list(orgId) : undefined}
        updatePath={isOrgAdmin ? (row) => endpoints.labs.detail(orgId, row.id) : undefined}
        deletePath={isOrgAdmin ? (row) => endpoints.labs.detail(orgId, row.id) : undefined}
        createLabel="Create lab"
        columns={[
          nameColumn(),
          textColumn("phone", "Phone"),
          {
            key: "workspace",
            header: "Workspace",
            render: (row) => (
              <Button asChild size="sm" variant="outline">
                <Link to={`/${orgId}/lab/${row.id}/dashboard`}>Open lab</Link>
              </Button>
            ),
          },
        ]}
      />
    </PageFrame>
  );
}

export function OrgUsersPage() {
  const { orgId } = useParams();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [editingInvite, setEditingInvite] = useState<ApiRow | null>(null);
  const { isOrgAdmin } = useOrgRole(orgId);
  const labs = usePagedResource<ApiRow>(orgId ? endpoints.labs.list(orgId) : null, orgId);
  const roles = usePagedResource<ApiRow>(orgId ? endpoints.iam.roles(orgId) : null, orgId);
  const labLabelById = useMemo(
    () => new Map(labs.rows.map((row) => [String(row.id), displayName(row)])),
    [labs.rows]
  );
  const roleLabelById = useMemo(
    () => new Map(roles.rows.map((row) => [String(row.id), displayName(row)])),
    [roles.rows]
  );
  const members = usePagedResource<ApiRow>(
    orgId ? endpoints.organisations.members(orgId) : null,
    orgId
  );
  const invites = usePagedResource<ApiRow>(
    orgId ? endpoints.organisations.invites(orgId) : null,
    orgId
  );

  if (!orgId) return null;
  return (
    <PageFrame
      eyebrow="People"
      title="Users"
      description="Review members and issue lab-aware invitations with role assignment."
      metrics={[
        metric("Members", members.rows.length, "Active org users", <Users />),
        metric("Invites", invites.rows.length, "Pending and historic", <Plus />),
      ]}
    >
      <Tabs defaultValue="members" className="gap-6">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="invites">Invites</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>
        <TabsContent value="members">
          {isOrgAdmin ? (
            <ResourceCrudTable
              title="Members"
              resource={members}
              fields={[]}
              orgId={orgId}
              deletePath={(row) => endpoints.organisations.member(orgId, row.id)}
              columns={[
                memberColumn(),
                {
                  key: "is_admin",
                  header: "Admin",
                  render: (row) => (row.is_admin ? "Yes" : "No"),
                },
                dateColumn(),
              ]}
            />
          ) : (
            <CompactTable title="Members" resource={members} columns={[memberColumn(), dateColumn()]} />
          )}
          {isOrgAdmin ? (
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                Bulk import users
              </Button>
            </div>
          ) : null}
        </TabsContent>
        <TabsContent value="invites">
          {isOrgAdmin ? (
            <InviteMemberDialog
              open={isInviteDialogOpen}
              onOpenChange={setIsInviteDialogOpen}
              orgId={orgId}
              labs={labs.rows}
              roles={roles.rows}
              createPath={endpoints.organisations.invites(orgId)}
              updatePath={
                editingInvite ? endpoints.organisations.invite(orgId, editingInvite.id) : undefined
              }
              initialInvite={editingInvite}
              onSaved={async () => {
                setEditingInvite(null);
                await invites.reload();
              }}
            />
          ) : null}
          {isOrgAdmin ? (
            <div className="mb-4 flex justify-end">
              <Button
                onClick={() => {
                  setEditingInvite(null);
                  setIsInviteDialogOpen(true);
                }}
              >
                <Plus className="size-4" />
                Invite member
              </Button>
            </div>
          ) : null}
          <ResourceCrudTable
            title="Invites"
            resource={invites}
            fields={[]}
            orgId={orgId}
            deletePath={
              isOrgAdmin ? (row) => endpoints.organisations.invite(orgId, row.id) : undefined
            }
            rowActions={
              isOrgAdmin
                ? [
                    {
                      label: "Edit",
                      run: async (row) => {
                        setEditingInvite(row);
                        setIsInviteDialogOpen(true);
                      },
                    },
                  ]
                : []
            }
            columns={[
              textColumn("email", "Email"),
              textColumn("status", "Status"),
              {
                key: "lab",
                header: "Lab",
                render: (row) => labLabelById.get(String(row.lab)) ?? formatValue(row.lab),
              },
              {
                key: "role",
                header: "Role",
                render: (row) => roleLabelById.get(String(row.role)) ?? formatValue(row.role),
              },
              {
                key: "inventory",
                header: "Inventory",
                render: (row) => {
                  const roleName = roleLabelById.get(String(row.role)) ?? "";
                  if (!isLabManagerRoleName(roleName)) return "—";
                  return row.can_manage_inventory ? "Yes" : "No";
                },
              },
              dateColumn(),
            ]}
          />
        </TabsContent>
        <TabsContent value="roles">
          <ResourceCrudTable
            title="Roles"
            resource={roles}
            fields={[
              { name: "name", label: "Role name", required: true },
              { name: "description", label: "Description", type: "textarea" },
            ]}
            orgId={orgId}
            createPath={isOrgAdmin ? endpoints.iam.roles(orgId) : undefined}
            updatePath={isOrgAdmin ? (row) => `${endpoints.iam.roles(orgId)}${row.id}/` : undefined}
            deletePath={isOrgAdmin ? (row) => `${endpoints.iam.roles(orgId)}${row.id}/` : undefined}
            createLabel="Create role"
            columns={[nameColumn(), textColumn("description", "Description"), dateColumn()]}
          />
        </TabsContent>
      </Tabs>
      {isOrgAdmin ? <ResourceFormDialog
        title="Bulk import users"
        description="Paste CSV rows: email,first_name,last_name,password,lab_id,role_id,card_uid"
        fields={[{ name: "rows", label: "CSV rows", type: "textarea", required: true }]}
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onSubmit={async (values) => {
          const users = String(values.rows)
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
              const [email, first_name, last_name, password, lab_id, role_id, rfid_uid] = line
                .split(",")
                .map((part) => part.trim());
              return {
                email,
                first_name,
                last_name,
                password,
                lab_id: lab_id ? Number(lab_id) : undefined,
                role_id: role_id ? Number(role_id) : undefined,
                rfid_uid: rfid_uid || undefined,
              };
            });
          await apiClient.create(endpoints.organisations.bulkUserImport(orgId), { users }, { orgId });
          await members.reload();
        }}
      /> : null}
    </PageFrame>
  );
}

export function LabMembersPage() {
  const { orgId, labId } = useParams();
  const { isOrgAdmin, isLabManager } = useLabAccessRole(orgId, labId);
  const [selectedMember, setSelectedMember] = useState<ApiRow | null>(null);
  const [isAssignMemberOpen, setIsAssignMemberOpen] = useState(false);
  const [labName, setLabName] = useState<string | undefined>();
  const orgMembers = usePagedResource<ApiRow>(
    orgId ? endpoints.organisations.members(orgId) : null,
    orgId
  );
  const roles = usePagedResource<ApiRow>(orgId ? endpoints.iam.roles(orgId) : null, orgId);
  const members = usePagedResource<ApiRow>(
    orgId && labId ? endpoints.labs.members(orgId, labId) : null,
    orgId
  );
  const rfids = usePagedResource<ApiRow>(
    labId && selectedMember ? endpoints.labs.rfids(labId, selectedMember.id) : null,
    orgId
  );

  useEffect(() => {
    if (!orgId || !labId) return;
    void apiClient
      .get<ApiRow>(endpoints.labs.detail(orgId, labId), { orgId })
      .then((lab) => setLabName(String(lab.name ?? "")))
      .catch(() => setLabName(undefined));
  }, [orgId, labId]);

  if (!orgId || !labId) return null;
  return (
    <PageFrame
      eyebrow="Lab access"
      title="Users"
      description="Assign organisation users to this lab, set roles, and manage access cards."
      metrics={[
        metric("Lab members", members.rows.length, "Active assignments", <Users />),
        metric("Access cards", rfids.rows.length, "Selected member", <Radio />),
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {isOrgAdmin ? (
          <LabMemberAssignDialog
            open={isAssignMemberOpen}
            onOpenChange={setIsAssignMemberOpen}
            orgId={orgId}
            labName={labName}
            orgMembers={orgMembers.rows}
            roles={roles.rows}
            createPath={`${endpoints.labs.members(orgId, labId)}add/`}
            onSaved={async () => members.reload()}
          />
        ) : null}
        {isOrgAdmin ? (
          <div className="mb-4 flex justify-end xl:col-span-2">
            <Button onClick={() => setIsAssignMemberOpen(true)}>
              <Plus className="size-4" />
              Assign member
            </Button>
          </div>
        ) : null}
        <ResourceCrudTable
          title="Lab members"
          resource={members}
          fields={[]}
          orgId={orgId}
          deletePath={isOrgAdmin ? (row) => `${endpoints.labs.members(orgId, labId)}${row.id}/remove/` : undefined}
          columns={[
            memberColumn(),
            roleColumn(),
            {
              key: "inventory",
              header: "Inventory",
              render: (row) => {
                const roleName = displayName(row.role as ApiRow | undefined);
                if (!isLabManagerRoleName(roleName)) return "—";
                return row.can_manage_inventory ? "Yes" : "No";
              },
            },
            {
              key: "rfid",
              header: "Access",
              render: (row) => (
                <Button size="sm" variant="outline" onClick={() => setSelectedMember(row)}>
                  Manage card
                </Button>
              ),
            },
          ]}
        />
        {selectedMember ? (
          <ResourceCrudTable
            title="Access cards"
            description="Enter the full ID from the reader (UID and name), e.g. 0232F200-BHAIRAVIDEWALKAR — exactly as shown on the OLED or in Serial Monitor."
            resource={rfids}
            fields={[
              {
                name: "rfid_uid",
                label: "Full card ID",
                required: true,
                placeholder: "0232F200-BHAIRAVIDEWALKAR",
              },
            ]}
            orgId={orgId}
            createPath={isOrgAdmin || isLabManager ? endpoints.labs.rfids(labId, selectedMember.id) : undefined}
            deletePath={isOrgAdmin || isLabManager ? (row) => `${endpoints.labs.rfids(labId, selectedMember.id)}${row.id}/` : undefined}
            createLabel="Add card"
            columns={[textColumn("rfid_uid", "Full card ID"), dateColumn()]}
          />
        ) : (
          <EmptyState title="Select a lab member" description="Choose Manage card to add or remove access cards." />
        )}
      </div>
    </PageFrame>
  );
}

export function LabDashboardPage() {
  const { orgId, labId } = useParams();
  const machines = usePagedResource<ApiRow>(labId ? endpoints.machines.list(labId) : null, orgId);
  const inventory = usePagedResource<ApiRow>(labId ? endpoints.inventory.items(labId) : null, orgId);
  const projects = usePagedResource<ApiRow>(labId ? endpoints.projects.list(labId) : null, orgId);

  return (
    <PageFrame
      eyebrow="Lab"
      title="Dashboard"
      description="Monitor machines, inventory, projects, and attendance for this lab."
      metrics={[
        metric("Machines", machines.rows.length, "Equipment records", <Wrench />),
        metric("Inventory", inventory.rows.length, "Stock records", <Boxes />),
        metric("Projects", projects.rows.length, "Active work", <ListChecks />),
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-3">
        <CompactTable title="Machines" resource={machines} columns={[nameColumn(), statusColumn()]} />
        <CompactTable title="Inventory" resource={inventory} columns={[nameColumn(), textColumn("quantity", "Qty")]} />
        <CompactTable title="Projects" resource={projects} columns={[nameColumn(), statusColumn()]} />
      </div>
    </PageFrame>
  );
}

export function InventoryPage() {
  const { orgId, labId } = useParams();
  const { isOrgAdmin, isLabManager, canManageInventory, can } = useLabAccessRole(orgId, labId);
  const [adjusting, setAdjusting] = useState<ApiRow | null>(null);
  const [movementItem, setMovementItem] = useState<ApiRow | null>(null);
  const items = usePagedResource<ApiRow>(labId ? endpoints.inventory.items(labId) : null, orgId);
  const categories = usePagedResource<ApiRow>(labId ? endpoints.inventory.categories(labId) : null, orgId);
  const units = usePagedResource<ApiRow>(labId ? endpoints.inventory.units(labId) : null, orgId);
  const movements = usePagedResource<ApiRow>(
    labId && movementItem ? endpoints.inventory.movements(labId, movementItem.id) : null,
    orgId
  );

  const canManageLabInventory = isOrgAdmin || canManageInventory;
  const canBrowseInventory = canManageLabInventory || can(P.INVENTORY_READ);
  const isManagerWithoutInventory =
    isLabManager && !isOrgAdmin && !canManageInventory && !can(P.INVENTORY_READ);

  if (!labId) return null;

  if (isManagerWithoutInventory) {
    return (
      <PageFrame
        eyebrow="Stock"
        title="Inventory"
        description="Inventory management was not granted for your lab manager role."
      >
        <EmptyState
          title="No inventory access"
          description="Your organisation admin can enable “Allow inventory management” when inviting or assigning you as a Lab Manager."
        />
      </PageFrame>
    );
  }

  if (!canBrowseInventory) {
    return (
      <PageFrame eyebrow="Stock" title="Inventory" description="You do not have access to inventory for this lab.">
        <EmptyState title="Access denied" description="Contact your lab administrator if you need inventory access." />
      </PageFrame>
    );
  }

  return (
    <PageFrame
      eyebrow="Stock"
      title="Inventory"
      description="Manage reusable assets, consumables, units, categories, thresholds, and stock movements."
      metrics={[
        metric("Items", items.rows.length, "Inventory records", <Boxes />),
        metric("Low stock", items.rows.filter((row) => row.is_below_threshold).length, "Below threshold", <Gauge />),
      ]}
    >
      <Tabs defaultValue="items" className="gap-6">
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          {canManageLabInventory ? (
            <>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="units">Units</TabsTrigger>
            </>
          ) : null}
        </TabsList>
        <TabsContent value="items">
          <ResourceCrudTable
            title="Inventory items"
            resource={items}
            fields={[
              { name: "name", label: "Name", required: true },
              { name: "sku", label: "SKU", required: true },
              { name: "type", label: "Type", type: "select", required: true, options: ["REUSABLE", "CONSUMABLE"].map(toOption) },
              { name: "unit", label: "Unit", type: "select", required: true, options: toOptions(units.rows) },
              { name: "category", label: "Category", type: "select", options: toOptions(categories.rows) },
              { name: "threshold", label: "Threshold", type: "number" },
              { name: "image_url", label: "Image URL" },
              { name: "description", label: "Description", type: "textarea" },
            ]}
            orgId={orgId}
            createPath={canManageLabInventory ? endpoints.inventory.items(labId) : undefined}
            updatePath={canManageLabInventory ? (row) => endpoints.inventory.item(labId, row.id) : undefined}
            deletePath={canManageLabInventory ? (row) => endpoints.inventory.item(labId, row.id) : undefined}
            createLabel="Add item"
            columns={[
              nameColumn(),
              textColumn("sku", "SKU"),
              textColumn("quantity", "Qty"),
              textColumn("type", "Type"),
              {
                key: "adjust",
                header: "Stock",
                render: (row) => (
                  <div className="flex flex-wrap gap-2">
                    {canManageLabInventory ? (
                      <Button size="sm" variant="outline" onClick={() => setAdjusting(row)}>
                        Adjust
                      </Button>
                    ) : null}
                    <Button size="sm" variant="outline" onClick={() => setMovementItem(row)}>
                      Movements
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </TabsContent>
        <TabsContent value="categories">
          <ResourceCrudTable
            title="Categories"
            resource={categories}
            fields={[
              { name: "name", label: "Name", required: true },
              { name: "parent", label: "Parent category", type: "select", options: toOptions(categories.rows) },
            ]}
            orgId={orgId}
            createPath={canManageLabInventory ? endpoints.inventory.categories(labId) : undefined}
            updatePath={canManageLabInventory ? (row) => `${endpoints.inventory.categories(labId)}${row.id}/` : undefined}
            deletePath={canManageLabInventory ? (row) => `${endpoints.inventory.categories(labId)}${row.id}/` : undefined}
            createLabel="Add category"
            columns={[nameColumn(), dateColumn()]}
          />
        </TabsContent>
        <TabsContent value="units">
          <ResourceCrudTable
            title="Units"
            resource={units}
            fields={[
              { name: "name", label: "Name", required: true },
              { name: "symbol", label: "Symbol", required: true },
            ]}
            orgId={orgId}
            createPath={canManageLabInventory ? endpoints.inventory.units(labId) : undefined}
            updatePath={canManageLabInventory ? (row) => `${endpoints.inventory.units(labId)}${row.id}/` : undefined}
            deletePath={canManageLabInventory ? (row) => `${endpoints.inventory.units(labId)}${row.id}/` : undefined}
            createLabel="Add unit"
            columns={[nameColumn(), textColumn("symbol", "Symbol"), dateColumn()]}
          />
        </TabsContent>
      </Tabs>
      {canManageLabInventory ? <ResourceFormDialog
        title="Adjust stock"
        description={adjusting ? `Update quantity for ${displayName(adjusting)}.` : undefined}
        open={Boolean(adjusting)}
        onOpenChange={(open) => !open && setAdjusting(null)}
        fields={[
          { name: "type", label: "Movement type", type: "select", required: true, options: ["IN", "OUT", "ADJUST"].map(toOption) },
          { name: "quantity", label: "Quantity", type: "number", required: true },
          { name: "reference", label: "Reference" },
          { name: "note", label: "Note", type: "textarea" },
        ]}
        onSubmit={async (values) => {
          if (!adjusting) return;
          await apiClient.create(endpoints.inventory.adjust(labId, adjusting.id), values, { orgId });
          await items.reload();
        }}
      /> : null}
      {movementItem ? (
        <PremiumDataTable
          title="Stock movements"
          description={`Movement history for ${displayName(movementItem)}.`}
          columns={[
            textColumn("type", "Type"),
            textColumn("quantity", "Quantity"),
            textColumn("reference", "Reference"),
            textColumn("note", "Note"),
            dateColumn(),
          ]}
          rows={movements.rows}
          getRowKey={(row) => String(row.id)}
          next={movements.next}
          previous={movements.previous}
          onNext={movements.loadNext}
          onPrevious={movements.loadPrevious}
          emptyTitle="No stock movements"
          emptyDescription="Movements appear after stock adjustments are recorded."
        />
      ) : null}
    </PageFrame>
  );
}

export function BookingCalendarPage() {
  const { orgId, labId } = useParams();
  const { isOrgAdmin, isLabManager } = useLabAccessRole(orgId, labId);

  if (!orgId || !labId) return null;

  const mode = isOrgAdmin || isLabManager ? "manager" : "researcher";

  return (
    <PageFrame
      eyebrow="Machines"
      title={mode === "manager" ? "Lab booking calendar" : "My bookings"}
      description={
        mode === "manager"
          ? "All machine reservations in this lab."
          : "Your machine reservations in this lab."
      }
    >
      <BookingCalendar orgId={orgId} labId={labId} mode={mode} />
    </PageFrame>
  );
}

export function MachinesPage() {
  const { orgId, labId } = useParams();
  const { isOrgAdmin, isLabManager } = useLabAccessRole(orgId, labId);
  const [statusMachine, setStatusMachine] = useState<ApiRow | null>(null);
  const [reservationMachine, setReservationMachine] = useState<ApiRow | null>(null);
  const [logMachine, setLogMachine] = useState<ApiRow | null>(null);
  const [bookingMachine, setBookingMachine] = useState<ApiRow | null>(null);
  const [isBookingCreateProjectOpen, setIsBookingCreateProjectOpen] = useState(false);
  const [bookingMachineId, setBookingMachineId] = useState<string>("");
  const [bookingDate, setBookingDate] = useState<string>("");
  const [bookingSlotStart, setBookingSlotStart] = useState<string>("");
  const [bookingSlotEnd, setBookingSlotEnd] = useState<string>("");
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingProject, setBookingProject] = useState("");
  const [bookingMaterialItem, setBookingMaterialItem] = useState("");
  const [bookingCustomMaterialItem, setBookingCustomMaterialItem] = useState("");
  const [bookingMaterialQty, setBookingMaterialQty] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingTimeMode, setBookingTimeMode] = useState<"slots" | "custom">("slots");
  const [labBookingPolicy, setLabBookingPolicy] = useState<LabBookingPolicy>(defaultBookingPolicy);
  const machines = usePagedResource<ApiRow>(labId ? endpoints.machines.list(labId) : null, orgId);
  const projects = usePagedResource<ApiRow>(labId ? endpoints.projects.list(labId) : null, orgId);
  const inventoryItems = usePagedResource<ApiRow>(labId ? endpoints.inventory.items(labId) : null, orgId);
  const reservations = usePagedResource<ApiRow>(
    labId && reservationMachine ? endpoints.machines.reservations(labId, reservationMachine.id) : null,
    orgId
  );
  const bookingReservations = usePagedResource<ApiRow>(
    labId && bookingMachineId ? endpoints.machines.reservations(labId, bookingMachineId) : null,
    orgId
  );
  const logs = usePagedResource<ApiRow>(
    labId && logMachine ? endpoints.machines.logs(labId, logMachine.id) : null,
    orgId
  );
  const bookingMachineData = machines.rows.find((row) => String(row.id) === bookingMachineId) ?? bookingMachine;
  const existingReservations = bookingReservations.rows;
  const slotCandidates = useMemo(
    () => buildSlotCandidates(bookingDate, labBookingPolicy, existingReservations),
    [bookingDate, existingReservations, labBookingPolicy]
  );
  const bookingHoursLabel = `${formatMinutesAsTime(parseTimeToMinutes(labBookingPolicy.booking_window_start))}–${formatMinutesAsTime(parseTimeToMinutes(labBookingPolicy.booking_window_end))}`;

  useEffect(() => {
    if (!orgId || !labId) return;
    apiClient
      .get<LabBookingPolicy>(endpoints.labs.bookingPolicy(orgId, labId), { orgId })
      .then((policy) => setLabBookingPolicy({ ...defaultBookingPolicy, ...policy }))
      .catch(() => {});
  }, [orgId, labId]);

  if (!labId) return null;
  return (
    <PageFrame
      eyebrow="Equipment"
      title="Machines"
      description="Register machines, update status, review bookings, and manage day-to-day use."
      metrics={[metric("Machines", machines.rows.length, "Equipment records", <Wrench />)]}
    >
      {!labBookingPolicy.booking_enabled ? (
        <PremiumSurface className="border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          Machine bookings are <strong>turned off</strong> for this lab. Lab managers can re-enable them under{" "}
          <strong>Lab Settings</strong>.
        </PremiumSurface>
      ) : (
        <PremiumSurface className="p-4 text-sm text-slate-600 dark:text-slate-300">
          Booking hours: <strong>{bookingHoursLabel}</strong> (custom times must fall within this window and not overlap).
        </PremiumSurface>
      )}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <ResourceCrudTable
          title="Machines"
          resource={machines}
          fields={machineFields}
          orgId={orgId}
          createPath={isOrgAdmin || isLabManager ? endpoints.machines.list(labId) : undefined}
          updatePath={isOrgAdmin || isLabManager ? (row) => endpoints.machines.detail(labId, row.id) : undefined}
          deletePath={isOrgAdmin || isLabManager ? (row) => endpoints.machines.detail(labId, row.id) : undefined}
          createLabel="Register machine"
          columns={[
            nameColumn(),
            statusColumn(),
            textColumn("serial_number", "Serial"),
            {
              key: "ops",
              header: "Operations",
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  {isLabManager || isOrgAdmin ? (
                    <>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/${orgId}/lab/${labId}/machine/${row.id}/details`}>Details</Link>
                      </Button>
                      <Button size="sm" variant="secondary" asChild>
                        <Link to={`/${orgId}/lab/${labId}/machine/${row.id}/details`}>
                          Reader
                        </Link>
                      </Button>
                    </>
                  ) : null}
                  {isLabManager || isOrgAdmin ? (
                    <Button size="sm" variant="outline" onClick={() => setStatusMachine(row)}>
                      Status
                    </Button>
                  ) : null}
                  <Button size="sm" variant="outline" onClick={() => setReservationMachine(row)}>
                    Reservations
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setBookingMachine(row);
                    setBookingStep(1);
                    setBookingMachineId(String(row.id));
                    setBookingDate("");
                    setBookingSlotStart("");
                    setBookingSlotEnd("");
                    setBookingTimeMode("slots");
                    setBookingError(null);
                  }}
                  disabled={!labBookingPolicy.booking_enabled}
                  >
                    Book slot
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setLogMachine(row)}>
                    Logs
                  </Button>
                </div>
              ),
            },
          ]}
        />
        {reservationMachine ? (
          <ResourceCrudTable
            title="Reservations"
            description={`Custom start/end allowed between ${bookingHoursLabel}. The API rejects overlaps and times outside lab hours.`}
            resource={reservations}
            fields={[
              { name: "project", label: "Project", type: "select", required: true, options: toOptions(projects.rows) },
              { name: "booked_from", label: "Booked from", type: "datetime-local", required: true },
              { name: "booked_till", label: "Booked till", type: "datetime-local", required: true },
              { name: "material_item_id", label: "Material item", type: "select", options: toOptions(inventoryItems.rows) },
              { name: "material_quantity", label: "Material quantity", type: "number" },
              { name: "notes", label: "Notes", type: "textarea" },
            ]}
            orgId={orgId}
            createPath={
              labBookingPolicy.booking_enabled
                ? endpoints.machines.reservations(labId, reservationMachine.id)
                : undefined
            }
            createLabel="Reserve machine"
            transformPayload={(values) => {
              const validationError = validateCustomReservation(
                labBookingPolicy,
                String(values.booked_from ?? ""),
                String(values.booked_till ?? "")
              );
              if (validationError) {
                throw new Error(validationError);
              }
              const payload: Record<string, unknown> = {
                project: Number(values.project),
                booked_from: localDateTimeToApiIso(String(values.booked_from ?? "")),
                booked_till: localDateTimeToApiIso(String(values.booked_till ?? "")),
                notes: values.notes,
              };
              if (values.material_item_id && values.material_quantity) {
                payload.materials = [
                  {
                    item_id: Number(values.material_item_id),
                    quantity: Number(values.material_quantity),
                  },
                ];
              }
              return payload;
            }}
            columns={[textColumn("project", "Project"), statusColumn(), textColumn("booked_from", "From"), textColumn("booked_till", "Till")]}
          />
        ) : (
          <EmptyState title="Select a machine" description="Open Reservations to view and create bookings." />
        )}
      </div>
      {isLabManager || isOrgAdmin ? (
        <ResourceFormDialog
          title="Update machine status"
          open={Boolean(statusMachine)}
          onOpenChange={(open) => !open && setStatusMachine(null)}
          fields={[
            {
              name: "status",
              label: "Status",
              type: "select",
              required: true,
              options: ["ACTIVE", "OCCUPIED", "OFF", "UNDER_MAINTENANCE", "RETIRED", "FAULTY"].map(toOption),
            },
            { name: "reference", label: "Reference" },
            { name: "notes", label: "Notes", type: "textarea" },
          ]}
          onSubmit={async (values) => {
            if (!statusMachine) return;
            await apiClient.update(endpoints.machines.status(labId, statusMachine.id), values, { orgId });
            await machines.reload();
          }}
        />
      ) : null}
      <Dialog
        open={Boolean(bookingMachine)}
        onOpenChange={(open) => {
          if (!open) {
            setBookingMachine(null);
            setBookingStep(1);
            setBookingError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book machine slot</DialogTitle>
            <DialogDescription>
              Calendar + open slots + machine matrix with material request.
            </DialogDescription>
          </DialogHeader>
          {bookingMachine ? (
            <div className="space-y-4">
              <div className="text-xs text-slate-500">Step {bookingStep} of 4</div>
              {bookingStep === 1 ? (
                <div className="space-y-2">
                  <Label>Choose project</Label>
                  <Select
                    value={bookingProject}
                    onValueChange={(value) => {
                      if (value === "__create_new__") {
                        setIsBookingCreateProjectOpen(true);
                        return;
                      }
                      setBookingProject(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="__create_new__"
                        className="font-semibold text-teal-600 dark:text-teal-400"
                      >
                        + Create new project
                      </SelectItem>
                      {projects.rows.map((project) => (
                        <SelectItem key={String(project.id)} value={String(project.id)}>
                          {displayName(project)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              {bookingStep === 2 ? (
                <div className="space-y-2">
                  <Label>Machine matrix</Label>
                    <div className="grid grid-cols-2 gap-3">
                    {machines.rows.map((machine) => (
                      <button
                        key={String(machine.id)}
                        type="button"
                          className={`rounded-xl border p-3 text-left transition ${
                            String(machine.id) === bookingMachineId
                              ? "border-teal-500 bg-teal-50 text-teal-900 dark:bg-teal-900/20 dark:text-teal-100"
                              : "border-slate-200 hover:border-teal-300 dark:border-slate-700 dark:hover:border-teal-700"
                          }`}
                        onClick={() => setBookingMachineId(String(machine.id))}
                      >
                        <div className="font-medium">{displayName(machine)}</div>
                        <div className="text-xs text-slate-500">Model: {formatValue(machine.model_number)}</div>
                        <div className="text-xs text-slate-500">Photo: {machine.image_url ? "Available" : "Not set"}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {bookingStep === 3 ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Lab hours: {bookingHoursLabel}. Choose a preset slot or enter a custom range (same day).
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={bookingTimeMode === "slots" ? "default" : "outline"}
                      onClick={() => setBookingTimeMode("slots")}
                    >
                      Preset slots
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={bookingTimeMode === "custom" ? "default" : "outline"}
                      onClick={() => setBookingTimeMode("custom")}
                    >
                      Custom time
                    </Button>
                  </div>
                  {bookingTimeMode === "slots" ? (
                    <>
                      <div className="space-y-2">
                        <Label>Calendar date</Label>
                        <Input
                          type="date"
                          min={minBookingDateLocal()}
                          value={bookingDate}
                          onChange={(event) => setBookingDate(event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Open slots</Label>
                        <div className="grid grid-cols-3 gap-2 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-3 dark:border-teal-800/60 dark:from-teal-950/30 dark:to-slate-950">
                          {slotCandidates.length === 0 ? (
                            <p className="col-span-3 text-xs text-slate-500">
                              Pick a date to see available slots.
                            </p>
                          ) : (
                            slotCandidates.map((slot) => (
                              <Button
                                key={slot.from}
                                type="button"
                                size="sm"
                                className={
                                  bookingSlotStart === slot.from
                                    ? "bg-teal-600 text-white hover:bg-teal-700"
                                    : "border-teal-300 text-teal-700 hover:bg-teal-100 dark:border-teal-700 dark:text-teal-200 dark:hover:bg-teal-900/30"
                                }
                                variant="outline"
                                disabled={slot.blocked}
                                onClick={() => {
                                  setBookingSlotStart(slot.from);
                                  setBookingSlotEnd(slot.till);
                                }}
                              >
                                {slot.from.slice(11, 16)}-{slot.till.slice(11, 16)}
                              </Button>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Start</Label>
                        <Input
                          type="datetime-local"
                          min={minBookingDateLocal() + "T00:00"}
                          value={bookingSlotStart}
                          onChange={(event) => setBookingSlotStart(event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End</Label>
                        <Input
                          type="datetime-local"
                          min={bookingSlotStart || minBookingDateLocal() + "T00:00"}
                          value={bookingSlotEnd}
                          onChange={(event) => setBookingSlotEnd(event.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
              {bookingStep === 4 ? (() => {
                const defaultMaterialsAttr = (bookingMachineData as any)?.attributes?.find(
                  (attr: any) => attr.key === "default_materials"
                );
                const defaultMaterialIds: number[] = defaultMaterialsAttr
                  ? JSON.parse(defaultMaterialsAttr.value)
                  : [];

                const prefilledItems = inventoryItems.rows.filter(item => defaultMaterialIds.includes(Number(item.id)));

                return (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Material item (optional)</Label>
                      <Select value={bookingMaterialItem} onValueChange={(val) => {
                        setBookingMaterialItem(val);
                        if (val !== "custom") {
                          setBookingCustomMaterialItem("");
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select material item" />
                        </SelectTrigger>
                        <SelectContent>
                          {prefilledItems.length > 0 ? (
                            <>
                              {prefilledItems.map((item) => (
                                <SelectItem key={String(item.id)} value={String(item.id)}>
                                  {displayName(item)} (Prefilled)
                                </SelectItem>
                              ))}
                              <SelectItem value="custom" className="font-semibold text-teal-600 dark:text-teal-400">
                                ➕ Custom request...
                              </SelectItem>
                            </>
                          ) : (
                            inventoryItems.rows.map((item) => (
                              <SelectItem key={String(item.id)} value={String(item.id)}>
                                {displayName(item)}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {bookingMaterialItem === "custom" ? (
                      <div className="space-y-2 border-l-2 border-teal-500 pl-3">
                        <Label>Select custom material item</Label>
                        <Select value={bookingCustomMaterialItem} onValueChange={setBookingCustomMaterialItem}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select custom material item" />
                          </SelectTrigger>
                          <SelectContent>
                            {inventoryItems.rows.map((item) => (
                              <SelectItem key={String(item.id)} value={String(item.id)}>
                                {displayName(item)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : null}

                    <div className="space-y-2">
                      <Label>Material quantity</Label>
                      <Input type="number" value={bookingMaterialQty} onChange={(event) => setBookingMaterialQty(event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea value={bookingNotes} onChange={(event) => setBookingNotes(event.target.value)} />
                    </div>
                  </div>
                );
              })() : null}
              {bookingError ? <div className="text-sm text-rose-600">{bookingError}</div> : null}
              <DialogFooter>
                <Button variant="outline" onClick={() => setBookingStep((current) => Math.max(1, current - 1))} disabled={bookingStep === 1}>
                  Back
                </Button>
                {bookingStep < 4 ? (
                  <Button
                    onClick={() => {
                      if (bookingStep === 1 && !bookingProject) return setBookingError("Select a project.");
                      if (bookingStep === 2 && !bookingMachineId) return setBookingError("Select a machine.");
                      if (bookingStep === 3) {
                        const validationError = validateCustomReservation(
                          labBookingPolicy,
                          bookingSlotStart,
                          bookingSlotEnd
                        );
                        if (validationError) return setBookingError(validationError);
                      }
                      setBookingError(null);
                      setBookingStep((current) => current + 1);
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    disabled={isBooking}
                    onClick={async () => {
                      if (!labId || !bookingMachineData) return;
                      const validationError = validateCustomReservation(
                        labBookingPolicy,
                        bookingSlotStart,
                        bookingSlotEnd
                      );
                      if (validationError) {
                        setBookingError(validationError);
                        return;
                      }
                      const finalItemId =
                        bookingMaterialItem === "custom"
                          ? bookingCustomMaterialItem
                          : bookingMaterialItem;
                      if (bookingMaterialQty && !finalItemId) {
                        setBookingError("Select a material item or clear the quantity.");
                        return;
                      }
                      if (finalItemId && bookingMaterialQty && Number(bookingMaterialQty) <= 0) {
                        setBookingError("Material quantity must be greater than zero.");
                        return;
                      }
                      setIsBooking(true);
                      setBookingError(null);
                      try {
                        const payload: Record<string, unknown> = {
                          project: Number(bookingProject),
                          machine: Number(bookingMachineId),
                          booked_from: localDateTimeToApiIso(bookingSlotStart),
                          booked_till: localDateTimeToApiIso(bookingSlotEnd),
                          notes: bookingNotes,
                        };
                        if (finalItemId && bookingMaterialQty) {
                          payload.materials = [{ item_id: Number(finalItemId), quantity: Number(bookingMaterialQty) }];
                        }
                        await apiClient.create(endpoints.machines.reservations(labId, bookingMachineData.id), payload, { orgId });
                        setBookingMachine(null);
                        await reservations.reload();
                        await bookingReservations.reload();
                      } catch (error) {
                        setBookingError(normalizeApiError(error).message);
                      } finally {
                        setIsBooking(false);
                      }
                    }}
                  >
                    {isBooking ? "Submitting..." : "Submit booking request"}
                  </Button>
                )}
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
      {labId ? (
        <ResourceFormDialog
          title="New project"
          description="Create a project for this booking without leaving the wizard."
          open={isBookingCreateProjectOpen}
          onOpenChange={setIsBookingCreateProjectOpen}
          fields={projectFields}
          onSubmit={async (values) => {
            const created = await apiClient.create<ApiRow>(
              endpoints.projects.list(labId),
              values,
              { orgId }
            );
            await projects.reload();
            if (created?.id != null) {
              setBookingProject(String(created.id));
            }
            setBookingError(null);
            toast.success("Project created — select it above if needed.");
          }}
        />
      ) : null}
      {logMachine ? (
        <PremiumDataTable
          title="Machine status logs"
          description={`Audit trail for ${displayName(logMachine)}.`}
          columns={[
            textColumn("previous_status", "Previous"),
            textColumn("new_status", "New"),
            textColumn("reference", "Reference"),
            textColumn("notes", "Notes"),
            dateColumn(),
          ]}
          rows={logs.rows}
          getRowKey={(row) => String(row.id)}
          next={logs.next}
          previous={logs.previous}
          onNext={logs.loadNext}
          onPrevious={logs.loadPrevious}
          emptyTitle="No machine logs"
          emptyDescription="Status changes and machine activity will appear here."
        />
      ) : null}
    </PageFrame>
  );
}

export function ProjectsPage() {
  const { orgId, labId } = useParams();
  const [selectedProject, setSelectedProject] = useState<ApiRow | null>(null);
  const projects = usePagedResource<ApiRow>(labId ? endpoints.projects.list(labId) : null, orgId);
  const inventory = usePagedResource<ApiRow>(labId ? endpoints.inventory.items(labId) : null, orgId);
  const orders = usePagedResource<ApiRow>(
    labId && selectedProject ? endpoints.projects.orders(labId, selectedProject.id) : null,
    orgId
  );
  const members = usePagedResource<ApiRow>(
    labId && selectedProject ? endpoints.projects.members(labId, selectedProject.id) : null,
    orgId
  );

  if (!labId) return null;
  return (
    <PageFrame
      eyebrow="Research"
      title="Projects"
      description="Manage projects, owners, and inventory order requests."
      metrics={[metric("Projects", projects.rows.length, "Current page", <ListChecks />)]}
    >
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <ResourceCrudTable
          title="Projects"
          resource={projects}
          fields={projectFields}
          orgId={orgId}
          createPath={endpoints.projects.list(labId)}
          updatePath={(row) => endpoints.projects.detail(labId, row.id)}
          deletePath={(row) => endpoints.projects.detail(labId, row.id)}
          createLabel="New project"
          columns={[
            nameColumn(),
            statusColumn(),
            {
              key: "orders",
              header: "Orders",
              render: (row) => (
                <Button size="sm" variant="outline" onClick={() => setSelectedProject(row)}>
                  Manage orders
                </Button>
              ),
            },
          ]}
        />
        {selectedProject ? (
          <div className="space-y-6">
            <PremiumDataTable
              title="Project members"
              description={`Team members for ${displayName(selectedProject)}.`}
              columns={[memberColumn(), textColumn("is_owner", "Owner"), dateColumn()]}
              rows={members.rows}
              getRowKey={(row) => String(row.id)}
              next={members.next}
              previous={members.previous}
              onNext={members.loadNext}
              onPrevious={members.loadPrevious}
              emptyTitle="No project members"
              emptyDescription="Project membership will appear after users are assigned."
            />
            <ResourceCrudTable
              title="Inventory orders"
              resource={orders}
              fields={[
                { name: "inventory_item", label: "Inventory item", type: "select", required: true, options: toOptions(inventory.rows) },
                { name: "quantity", label: "Quantity", type: "number", required: true },
                { name: "unit_price", label: "Unit price", type: "number" },
                { name: "notes", label: "Notes", type: "textarea" },
              ]}
              orgId={orgId}
              createPath={endpoints.projects.orders(labId, selectedProject.id)}
              updatePath={(row) => `${endpoints.projects.orders(labId, selectedProject.id)}${row.id}/`}
              deletePath={(row) => `${endpoints.projects.orders(labId, selectedProject.id)}${row.id}/`}
              createLabel="Create order"
              transformPayload={(values) => ({
                notes: values.notes,
                lines: [
                  {
                    inventory_item: values.inventory_item,
                    quantity: values.quantity,
                    unit_price: values.unit_price || "0",
                  },
                ],
              })}
              columns={[textColumn("number", "Order"), statusColumn(), dateColumn()]}
            />
          </div>
        ) : (
          <EmptyState title="Select a project" description="Open Manage orders to request inventory." />
        )}
      </div>
    </PageFrame>
  );
}

export function AttendancePage() {
  const { orgId, labId } = useParams();
  const [regularizeRow, setRegularizeRow] = useState<ApiRow | null>(null);
  const [regularizeNotes, setRegularizeNotes] = useState("");
  const [isSubmittingRegularize, setIsSubmittingRegularize] = useState(false);
  const attendance = usePagedResource<ApiRow>(
    labId ? `${endpoints.attendance.me}?lab_id=${labId}` : endpoints.attendance.me,
    orgId
  );

  if (!labId) return null;
  return (
    <PageFrame
      eyebrow="Access"
      title="My Attendance"
      description="Review your attendance records and submit correction requests when needed."
      metrics={[metric("Attendance", attendance.rows.length, "Current records", <CalendarCheck />)]}
    >
      <ResourceCrudTable
        title="Attendance"
        resource={attendance}
        fields={[]}
        orgId={orgId}
        columns={[
          memberColumn(),
          statusColumn(),
          textColumn("check_in_at", "Check in"),
          textColumn("check_out_at", "Check out"),
        ]}
        rowActions={[
          {
            label: "Regularize",
            run: async (row) => {
              setRegularizeRow(row);
              setRegularizeNotes(String(row.notes ?? ""));
            },
          },
        ]}
      />
      <Dialog
        open={Boolean(regularizeRow)}
        onOpenChange={(open) => {
          if (!open) {
            setRegularizeRow(null);
            setRegularizeNotes("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request attendance regularization</DialogTitle>
            <DialogDescription>
              Provide a short reason so the approver can review and process your request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="regularize-notes">Reason</Label>
            <Textarea
              id="regularize-notes"
              value={regularizeNotes}
              onChange={(event) => setRegularizeNotes(event.target.value)}
              placeholder="Explain the attendance correction needed"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRegularizeRow(null);
                setRegularizeNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={!regularizeRow || isSubmittingRegularize}
              onClick={async () => {
                if (!regularizeRow) return;
                setIsSubmittingRegularize(true);
                try {
                  await apiClient.update(
                    endpoints.attendance.meRecord(regularizeRow.id),
                    { notes: regularizeNotes },
                    { orgId }
                  );
                  setRegularizeRow(null);
                  setRegularizeNotes("");
                  await attendance.reload();
                } finally {
                  setIsSubmittingRegularize(false);
                }
              }}
            >
              {isSubmittingRegularize ? "Submitting..." : "Submit request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageFrame>
  );
}

export function ApprovalsPage() {
  const { orgId, labId } = useParams();
  const { canAny } = useLabAccessRole(orgId, labId);
  const attendance = usePagedResource<ApiRow>(labId ? endpoints.attendance.list(labId) : null, orgId);
  const joinRequests = usePagedResource<ApiRow>(
    orgId ? endpoints.organisations.joinRequests(orgId) : null,
    orgId
  );
  const projectOrders = usePagedResource<ApiRow>(
    labId ? `${endpoints.projects.pendingOrders}?lab_id=${labId}` : endpoints.projects.pendingOrders,
    orgId
  );
  const machineReservations = usePagedResource<ApiRow>(
    labId ? `${endpoints.machines.pendingReservations}?lab_id=${labId}` : endpoints.machines.pendingReservations,
    orgId
  );

  return (
    <PageFrame
      eyebrow="Governance"
      title="Approvals"
      description="Central approval inbox for join requests and attendance decisions."
      metrics={[
        metric("Join requests", joinRequests.rows.length, "Organisation queue", <Users />),
        metric("Attendance", attendance.rows.length, "Lab records", <CalendarCheck />),
        metric("Inventory", projectOrders.rows.length, "Pending project orders", <Boxes />),
        metric("Machines", machineReservations.rows.length, "Pending reservations", <Wrench />),
      ]}
    >
      {!canAny(P.ATTENDANCE_WRITE, P.INVENTORY_WRITE, P.MACHINES_WRITE, P.PROJECTS_WRITE) ? (
        <EmptyState
          title="Approval access required"
          description="Your role does not include approval permissions for this lab."
        />
      ) : (
      <Tabs defaultValue="join" className="gap-6">
        <TabsList>
          <TabsTrigger value="join">Join requests</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Orders</TabsTrigger>
          <TabsTrigger value="machines">Machine Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="join">
          <ResourceCrudTable
            title="Join requests"
            resource={joinRequests}
            fields={[]}
            orgId={orgId}
            columns={[memberColumn(), statusColumn(), textColumn("message", "Message"), dateColumn()]}
            rowActions={[
              {
                label: "Approve",
                run: (row) => apiClient.update(`${endpoints.organisations.joinRequests(String(orgId))}${row.id}/`, { action: "approve" }, { orgId }),
              },
              {
                label: "Reject",
                tone: "destructive",
                run: (row) => apiClient.update(`${endpoints.organisations.joinRequests(String(orgId))}${row.id}/`, { action: "reject" }, { orgId }),
              },
            ]}
          />
        </TabsContent>
        <TabsContent value="attendance">
          {labId ? (
            <ResourceCrudTable
              title="Attendance"
              description={attendance.error?.message ?? "Approve or reject attendance regularisation."}
              resource={attendance}
              fields={[]}
              orgId={orgId}
              columns={[
                memberColumn(),
                statusColumn(),
                textColumn("check_in_at", "Check in"),
                textColumn("check_out_at", "Check out"),
              ]}
              rowActions={[
                {
                  label: "Approve",
                  run: (row) => apiClient.update(endpoints.attendance.approve(labId, row.id), { action: "approve" }, { orgId }),
                },
                {
                  label: "Reject",
                  tone: "destructive",
                  run: (row) => apiClient.update(endpoints.attendance.approve(labId, row.id), { action: "reject" }, { orgId }),
                },
              ]}
            />
          ) : (
            <EmptyState title="Open a lab first" description="Attendance approvals are lab-scoped." />
          )}
        </TabsContent>
        <TabsContent value="inventory">
          <ResourceCrudTable
            title="Inventory Orders"
            description={projectOrders.error?.message ?? "Approve or reject project inventory orders."}
            resource={projectOrders}
            fields={[]}
            orgId={orgId}
            columns={[textColumn("number", "Order"), statusColumn(), textColumn("project", "Project"), dateColumn()]}
            rowActions={[
              {
                label: "Approve",
                run: (row) => apiClient.update(endpoints.projects.orderAction(row.id), { action: "approve" }, { orgId }),
              },
              {
                label: "Reject",
                tone: "destructive",
                run: (row) => apiClient.update(endpoints.projects.orderAction(row.id), { action: "reject" }, { orgId }),
              },
            ]}
          />
        </TabsContent>
        <TabsContent value="machines">
          <ResourceCrudTable
            title="Machine Requests"
            description={machineReservations.error?.message ?? "Approve or reject machine reservation requests."}
            resource={machineReservations}
            fields={[]}
            orgId={orgId}
            columns={[
              textColumn("machine", "Machine"),
              textColumn("project", "Project"),
              statusColumn(),
              textColumn("booked_from", "From"),
              textColumn("booked_till", "Till"),
            ]}
            rowActions={[
              {
                label: "Approve",
                run: (row) => apiClient.update(endpoints.machines.reservationAction(row.id), { action: "approve" }, { orgId }),
              },
              {
                label: "Reject",
                tone: "destructive",
                run: (row) => apiClient.update(endpoints.machines.reservationAction(row.id), { action: "reject" }, { orgId }),
              },
            ]}
          />
        </TabsContent>
      </Tabs>
      )}
    </PageFrame>
  );
}

export function CartPage() {
  const { orgId, labId } = useParams();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutProjectId, setCheckoutProjectId] = useState("");
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  const cart = usePagedResource<ApiRow>(labId ? endpoints.inventory.cart(labId) : null, orgId);
  const projects = usePagedResource<ApiRow>(labId ? endpoints.projects.list(labId) : null, orgId);

  return (
    <RequireLabFeature feature="projects-order">
    <PageFrame
      eyebrow="Cart"
      title="Cart"
      description="Collect inventory items and submit checkout requests for project usage."
      metrics={[
        metric("Cart items", cart.rows.length, "Ready for checkout", <ShoppingCart />),
        metric("Checkout", "Ready", "Creates project inventory orders", <Boxes />),
      ]}
    >
      <ResourceCrudTable
        title="Cart Items"
        description={cart.error?.message ?? "Items added from inventory are checked out into a project order."}
        resource={cart}
        fields={[]}
        orgId={orgId}
        columns={[
          nameColumn(),
          textColumn("sku", "SKU"),
          textColumn("cart_quantity", "Quantity"),
          textColumn("return_date", "Return date"),
        ]}
        deletePath={(row) => endpoints.inventory.cartItem(String(labId), row.id)}
        rowActions={[
          {
            label: "Checkout",
            run: async () => {
              setIsCheckoutOpen(true);
            },
          },
        ]}
      />
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Checkout cart</DialogTitle>
            <DialogDescription>
              Select the project that should receive these inventory items.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="checkout-project">Project</Label>
            <Select value={checkoutProjectId} onValueChange={setCheckoutProjectId}>
              <SelectTrigger id="checkout-project">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.rows.map((project) => (
                  <SelectItem key={String(project.id)} value={String(project.id)}>
                    {displayName(project)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!checkoutProjectId || isSubmittingCheckout}
              onClick={async () => {
                if (!checkoutProjectId || !labId) return;
                setIsSubmittingCheckout(true);
                try {
                  await apiClient.create(
                    endpoints.inventory.cartCheckout(String(labId)),
                    { project_id: Number(checkoutProjectId) },
                    { orgId }
                  );
                  setIsCheckoutOpen(false);
                  setCheckoutProjectId("");
                  await cart.reload();
                } finally {
                  setIsSubmittingCheckout(false);
                }
              }}
            >
              {isSubmittingCheckout ? "Checking out..." : "Confirm checkout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageFrame>
    </RequireLabFeature>
  );
}

export function MyOrdersPage() {
  const { orgId, labId } = useParams();
  const inventoryOrders = usePagedResource<ApiRow>(
    labId ? `${endpoints.projects.userOrders}?lab_id=${labId}` : endpoints.projects.userOrders,
    orgId
  );
  const machineRequests = usePagedResource<ApiRow>(
    labId ? `${endpoints.machines.userReservations}?lab_id=${labId}` : endpoints.machines.userReservations,
    orgId
  );

  return (
    <RequireLabFeature feature="projects-order">
    <PageFrame
      eyebrow="Orders"
      title="My Orders"
      description="Track your inventory and machine-related orders in one place."
      metrics={[
        metric("Inventory orders", inventoryOrders.rows.length, "Across my projects", <FileText />),
        metric("Machine requests", machineRequests.rows.length, "Across my reservations", <Wrench />),
      ]}
    >
      <Tabs defaultValue="inventory" className="gap-6">
        <TabsList>
          <TabsTrigger value="inventory">Inventory Orders</TabsTrigger>
          <TabsTrigger value="machines">Machine Request</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory">
          <ResourceCrudTable
            title="Inventory Orders"
            description={inventoryOrders.error?.message ?? "All inventory orders connected to projects where you are a member."}
            resource={inventoryOrders}
            fields={[]}
            orgId={orgId}
            columns={[
              textColumn("number", "Order"),
              statusColumn(),
              textColumn("project", "Project"),
              dateColumn(),
            ]}
          />
        </TabsContent>
        <TabsContent value="machines">
          <ResourceCrudTable
            title="Machine Request"
            description={machineRequests.error?.message ?? "All machine reservations connected to your projects."}
            resource={machineRequests}
            fields={[]}
            orgId={orgId}
            columns={[
              textColumn("machine", "Machine"),
              textColumn("project", "Project"),
              statusColumn(),
              textColumn("booked_from", "From"),
              textColumn("booked_till", "Till"),
            ]}
          />
        </TabsContent>
      </Tabs>
    </PageFrame>
    </RequireLabFeature>
  );
}

export function NotificationsPage() {
  const { orgId } = useParams();
  const [tab, setTab] = useState<"unread" | "all" | "grouped">("unread");
  const notifications = usePagedResource<ApiRow>(endpoints.users.notifications, orgId);
  const unreadRows = notifications.rows.filter((row) => !row.is_read);
  const groupedRows = Object.entries(
    notifications.rows.reduce<Record<string, number>>((accumulator, row) => {
      const key = String(row.type ?? "GENERAL");
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    }, {})
  ).map(([type, count], index) => ({ id: `${type}-${index}`, type, count }));
  const activeRows = tab === "unread" ? unreadRows : tab === "all" ? notifications.rows : groupedRows;

  return (
    <PageFrame
      eyebrow="Updates"
      title="Notifications"
      description="Review booking updates, approvals, and slot availability alerts."
      metrics={[
        metric("Total", notifications.rows.length, "Recent updates", <Activity />),
        metric("Unread", unreadRows.length, "Needs attention", <Radio />),
      ]}
    >
      <Tabs defaultValue="unread" className="gap-6" onValueChange={(value) => setTab(value as "unread" | "all" | "grouped")}>
        <TabsList>
          <TabsTrigger value="unread">Unread ({unreadRows.length})</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="grouped">Grouped</TabsTrigger>
        </TabsList>
        <TabsContent value="unread">
          <PremiumDataTable
            title="Notification inbox"
            description="Unread updates requiring action."
            rows={activeRows}
            getRowKey={(row) => String(row.id)}
            columns={[textColumn("title", "Title"), textColumn("message", "Message"), textColumn("type", "Type"), dateColumn()]}
            next={notifications.next}
            previous={notifications.previous}
            onNext={notifications.loadNext}
            onPrevious={notifications.loadPrevious}
            emptyTitle="No unread notifications"
            emptyDescription="You are all caught up."
            actions={<Button variant="outline" onClick={() => void notifications.reload()}>Refresh</Button>}
          />
        </TabsContent>
        <TabsContent value="all">
          <ResourceCrudTable
            title="All notifications"
            resource={{ ...notifications, rows: activeRows as ApiRow[] }}
            fields={[]}
            orgId={orgId}
            columns={[textColumn("title", "Title"), textColumn("message", "Message"), textColumn("type", "Type"), dateColumn()]}
            rowActions={[
              {
                label: "Mark read",
                run: async (row) => {
                  await apiClient.update(endpoints.users.markNotificationRead(row.id), {}, { orgId });
                },
              },
            ]}
          />
        </TabsContent>
        <TabsContent value="grouped">
          <PremiumDataTable
            title="Grouped notifications"
            description="Grouped by notification type."
            rows={activeRows}
            getRowKey={(row) => String(row.id)}
            columns={[textColumn("type", "Type"), textColumn("count", "Count")]}
            emptyTitle="No notifications"
            emptyDescription="No grouped activity available."
          />
        </TabsContent>
      </Tabs>
    </PageFrame>
  );
}

/** Scan machine removed from product; legacy URL redirects to lab dashboard. */
export function ScanMachinePage() {
  const { orgId, labId } = useParams();
  if (orgId && labId) {
    return <Navigate to={`/${orgId}/lab/${labId}`} replace />;
  }
  return <Navigate to="/" replace />;
}

export function MachineSchedulePage() {
  const { orgId, labId, machineId } = useParams();
  const { isOrgAdmin, isLabManager } = useLabAccessRole(orgId, labId);
  const reservations = usePagedResource<ApiRow>(
    labId && machineId ? endpoints.machines.reservations(labId, machineId) : null,
    orgId
  );

  if (!orgId || !labId || !machineId) return null;

  const detailsPath = `/${orgId}/lab/${labId}/machine/${machineId}/details`;
  const logsPath = `/${orgId}/lab/${labId}/machine/${machineId}/logs`;

  return (
    <PageFrame
      eyebrow="Machine"
      title="Machine Schedule"
      description="View reservations and operating schedule for this machine."
      metrics={[metric("Reservations", reservations.rows.length, "Current page", <Wrench />)]}
    >
      {!isOrgAdmin && !isLabManager ? (
        <PremiumSurface className="mb-4 border-teal-200 bg-teal-50/80 p-4 text-sm text-teal-950 dark:border-teal-900/40 dark:bg-teal-950/30 dark:text-teal-100">
          After your booking is <strong>approved</strong>, tap your lab RFID card at the machine
          reader during your slot. The system unlocks the machine and records attendance
          automatically.
        </PremiumSurface>
      ) : null}
      <div className="mb-4 flex flex-wrap gap-2">
        {isOrgAdmin || isLabManager ? (
          <Button asChild variant="secondary">
            <Link to={detailsPath}>Machine details</Link>
          </Button>
        ) : null}
        <Button asChild variant="outline">
          <Link to={logsPath}>Activity log</Link>
        </Button>
        <Button asChild>
          <Link to={`/${orgId}/lab/${labId}/machine`}>All machines</Link>
        </Button>
      </div>
      <PremiumDataTable
        title="Reservations"
        description={reservations.error?.message ?? "Machine booking schedule."}
        columns={[
          textColumn("project", "Project"),
          statusColumn(),
          textColumn("booked_from", "From"),
          textColumn("booked_till", "Till"),
          textColumn("notes", "Notes"),
        ]}
        rows={reservations.rows}
        getRowKey={(row) => String(row.id)}
        next={reservations.next}
        previous={reservations.previous}
        onNext={reservations.loadNext}
        onPrevious={reservations.loadPrevious}
        emptyTitle="No reservations"
        emptyDescription="Reservations created from the Machines page will appear here."
      />
    </PageFrame>
  );
}

export function MachineDetailsPage() {
  const { orgId, labId, machineId } = useParams();
  const { isOrgAdmin, isLabManager } = useLabAccessRole(orgId, labId);
  const inventory = usePagedResource<ApiRow>(labId ? endpoints.inventory.items(labId) : null, orgId);
  const [selectedMaterials, setSelectedMaterials] = useState<number[]>([]);
  const [isSavingMaterials, setIsSavingMaterials] = useState(false);
  const [machine, setMachine] = useState<ApiRow | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if ((machine as any)?.attributes) {
      const defaultMaterialsAttr = (machine as any).attributes.find(
        (attr: any) => attr.key === "default_materials"
      );
      if (defaultMaterialsAttr) {
        try {
          setSelectedMaterials(JSON.parse(defaultMaterialsAttr.value));
        } catch (e) {
          setSelectedMaterials([]);
        }
      } else {
        setSelectedMaterials([]);
      }
    }
  }, [machine]);

  const toggleMaterial = (id: number) => {
    setSelectedMaterials((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id]
    );
  };

  const handleSaveMaterials = async () => {
    setIsSavingMaterials(true);
    try {
      await apiClient.create(
        `machines/labs/${labId}/${machineId}/attributes/`,
        {
          key: "default_materials",
          value: JSON.stringify(selectedMaterials),
        },
        { orgId }
      );
      toast.success("Default materials updated successfully.");
      setMachine((current) => {
        if (!current) return null;
        const attrList = [...((current as any).attributes || [])];
        const idx = attrList.findIndex((a) => a.key === "default_materials");
        const newAttr = { key: "default_materials", value: JSON.stringify(selectedMaterials) };
        if (idx !== -1) {
          attrList[idx] = { ...attrList[idx], ...newAttr };
        } else {
          attrList.push({ id: Date.now(), ...newAttr });
        }
        return { ...current, attributes: attrList };
      });
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setIsSavingMaterials(false);
    }
  };

  useEffect(() => {
    if (!orgId || !labId || !machineId) {
      setMachine(null);
      setLoadError(null);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    void apiClient
      .get<ApiRow>(endpoints.machines.detail(labId, machineId), { orgId })
      .then((data) => {
        if (!cancelled) {
          setMachine(data);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(normalizeApiError(error).message);
          setMachine(null);
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [orgId, labId, machineId]);

  if (!orgId || !labId || !machineId) return null;

  const schedulePath = `/${orgId}/lab/${labId}/machine/${machineId}`;
  const logsPath = `/${orgId}/lab/${labId}/machine/${machineId}/logs`;

  return (
    <PageFrame
      eyebrow="Machine"
      title="Machine details"
      description="Specifications, identifiers, and quick links for this machine."
      metrics={[
        metric("Status", machine?.status ? String(machine.status) : "—", "Current state", <Wrench />),
        metric("Model", machine?.model_number ? String(machine.model_number) : "—", "Manufacturer model", <Wrench />),
      ]}
    >
      {isLoading ? (
        <PremiumSurface className="flex items-center justify-center gap-3 p-12 text-sm text-slate-500 dark:text-slate-400">
          <Loader2 className="size-5 animate-spin" />
          Loading machine details…
        </PremiumSurface>
      ) : loadError ? (
        <EmptyState
          title="Could not load machine"
          description={loadError}
          icon={<Wrench className="size-7" />}
          action={
            <Button asChild>
              <Link to={`/${orgId}/lab/${labId}/machine`}>Back to machines</Link>
            </Button>
          }
        />
      ) : machine ? (
        <div className="space-y-6">
          <PremiumSurface className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {machineDetailField("Name", displayName(machine))}
              {machineDetailField("Serial number", machine.serial_number)}
              {machineDetailField("Purchased", machine.purchased_at)}
              {machineDetailField("Description", machine.description)}
            </div>
          </PremiumSurface>

          {isOrgAdmin || isLabManager ? (
            <MachineDevicePanel
              orgId={orgId}
              labId={labId}
              machineId={machineId}
              isOrgAdmin={Boolean(isOrgAdmin)}
            />
          ) : (
            <PremiumSurface className="p-6 space-y-2 border border-dashed border-slate-300 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Using this machine</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Book a slot from <strong>Machines</strong>, wait for manager approval, then tap your
                lab RFID card at the reader during your slot. No API keys or device setup needed on
                your side.
              </p>
            </PremiumSurface>
          )}

          {isOrgAdmin || isLabManager ? (
            <PremiumSurface className="p-6 space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Boxes className="size-5 text-teal-600 dark:text-teal-400" />
                Prefilled Default Materials (Managers Only)
              </h3>
              <p className="text-xs text-slate-500">
                Check the inventory items that should show up by default when users book this machine.
              </p>
              {inventory.rows.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 max-h-60 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl p-3">
                  {inventory.rows.map((item) => {
                    const isChecked = selectedMaterials.includes(Number(item.id));
                    return (
                      <label
                        key={String(item.id)}
                        className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition select-none ${
                          isChecked
                            ? "border-teal-500 bg-teal-50/50 text-teal-900 dark:bg-teal-950/20 dark:text-teal-100"
                            : "border-slate-100 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-850"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 dark:border-slate-700"
                          checked={isChecked}
                          onChange={() => toggleMaterial(Number(item.id))}
                        />
                        <div className="text-sm font-medium leading-none">
                          {displayName(item)}
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 border border-amber-200 dark:border-amber-900/30">
                  No inventory items available in this lab yet. Add items in the Inventory section first.
                </p>
              )}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSaveMaterials}
                  disabled={isSavingMaterials || inventory.rows.length === 0}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-sm transition"
                >
                  {isSavingMaterials ? "Saving..." : "Save Default Materials"}
                </Button>
              </div>
            </PremiumSurface>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to={schedulePath}>Schedule & bookings</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={logsPath}>Activity log</Link>
            </Button>
            <Button asChild>
              <Link to={`/${orgId}/lab/${labId}/machine`}>All machines</Link>
            </Button>
          </div>
        </div>
      ) : (
        <EmptyState title="Machine not found" description="This machine may have been removed or you may not have access." />
      )}
    </PageFrame>
  );
}

export function MachineLogsPage() {
  const { orgId, labId, machineId } = useParams();
  const { isOrgAdmin, isLabManager } = useLabAccessRole(orgId, labId);
  const logs = usePagedResource<ApiRow>(
    labId && machineId ? endpoints.machines.logs(labId, machineId) : null,
    orgId
  );

  if (!orgId || !labId || !machineId) return null;

  const detailsPath = `/${orgId}/lab/${labId}/machine/${machineId}/details`;
  const schedulePath = `/${orgId}/lab/${labId}/machine/${machineId}`;

  return (
    <PageFrame
      eyebrow="Machine"
      title="Machine Logs"
      description="Review machine usage logs and related events."
      metrics={[metric("Logs", logs.rows.length, "Status audit records", <Wrench />)]}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {isOrgAdmin || isLabManager ? (
          <Button asChild variant="secondary">
            <Link to={detailsPath}>Machine details</Link>
          </Button>
        ) : null}
        <Button asChild variant="outline">
          <Link to={schedulePath}>Schedule & bookings</Link>
        </Button>
        <Button asChild>
          <Link to={`/${orgId}/lab/${labId}/machine`}>All machines</Link>
        </Button>
      </div>
      <PremiumDataTable
        title="Machine Logs"
        description={logs.error?.message ?? "Status changes and usage events for this machine."}
        columns={[
          textColumn("previous_status", "Previous"),
          textColumn("new_status", "New"),
          textColumn("reference", "Reference"),
          textColumn("notes", "Notes"),
          dateColumn(),
        ]}
        rows={logs.rows}
        getRowKey={(row) => String(row.id)}
        next={logs.next}
        previous={logs.previous}
        onNext={logs.loadNext}
        onPrevious={logs.loadPrevious}
        emptyTitle="No machine logs"
        emptyDescription="Machine status changes will appear here."
      />
    </PageFrame>
  );
}

export function ProjectDetailsPage() {
  const { orgId, labId, projectId } = useParams();
  const members = usePagedResource<ApiRow>(
    labId && projectId ? endpoints.projects.members(labId, projectId) : null,
    orgId
  );
  const orders = usePagedResource<ApiRow>(
    labId && projectId ? endpoints.projects.orders(labId, projectId) : null,
    orgId
  );

  return (
    <PageFrame
      eyebrow="Project"
      title="Project Details"
      description="Review project team details, timeline, and associated material requests."
      metrics={[
        metric("Team", members.rows.length, "Project members", <Users />),
        metric("Orders", orders.rows.length, "Inventory requests", <FileText />),
      ]}
    >
      <Tabs defaultValue="orders" className="gap-6">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          <PremiumDataTable
            title="Inventory Orders"
            description={orders.error?.message ?? "Project order requests."}
            columns={[textColumn("number", "Order"), statusColumn(), dateColumn()]}
            rows={orders.rows}
            getRowKey={(row) => String(row.id)}
            next={orders.next}
            previous={orders.previous}
            onNext={orders.loadNext}
            onPrevious={orders.loadPrevious}
            emptyTitle="No orders"
            emptyDescription="Create orders from the Projects page."
          />
        </TabsContent>
        <TabsContent value="team">
          <PremiumDataTable
            title="Team"
            description={members.error?.message ?? "Project team members."}
            columns={[memberColumn(), textColumn("is_owner", "Owner"), dateColumn()]}
            rows={members.rows}
            getRowKey={(row) => String(row.id)}
            next={members.next}
            previous={members.previous}
            onNext={members.loadNext}
            onPrevious={members.loadPrevious}
            emptyTitle="No team members"
            emptyDescription="Project members will appear here."
          />
        </TabsContent>
      </Tabs>
    </PageFrame>
  );
}

function machineDetailField(label: string, value: unknown) {
  const text = formatDisplayValue(value);
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-950 dark:text-white">{text}</p>
    </div>
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

function CompactTable({
  title,
  resource,
  columns = [nameColumn(), statusColumn()],
}: {
  title: string;
  resource: ReturnType<typeof usePagedResource<ApiRow>>;
  columns?: PremiumColumn<ApiRow>[];
}) {
  return (
    <PremiumDataTable
      title={title}
      description={resource.error?.message ?? "Live workspace data."}
      columns={columns}
      rows={resource.rows}
      getRowKey={(row, index) => `${row.id}-${index}`}
      next={resource.next}
      previous={resource.previous}
      onNext={resource.loadNext}
      onPrevious={resource.loadPrevious}
      emptyTitle={`No ${title.toLowerCase()} yet`}
    />
  );
}

function metric(label: string, value: string | number, helper: string, icon: ReactNode): Metric {
  return { label, value: String(value), helper, icon };
}

function nameColumn<T extends ApiRow>(): PremiumColumn<T> {
  return {
    key: "name",
    header: "Name",
    render: (row) => entityNameCell(row as Entity),
  };
}

function memberColumn<T extends ApiRow>(): PremiumColumn<T> {
  return {
    key: "member",
    header: "Member",
    render: (row) => (
      <div>
        <p className="font-semibold text-slate-950 dark:text-white">
          {displayName(row.user ?? row)}
        </p>
        <p className="text-xs text-slate-500">{String(row.user?.email ?? row.email ?? "")}</p>
      </div>
    ),
  };
}

function roleColumn<T extends ApiRow>(): PremiumColumn<T> {
  return {
    key: "role",
    header: "Role",
    render: (row) => <span>{displayName(row.role ?? row)}</span>,
  };
}

function statusColumn<T extends ApiRow>(): PremiumColumn<T> {
  return {
    key: "status",
    header: "Status",
    render: (row) =>
      typeof row.status === "string" ? (
        <StatusBadge>{row.status}</StatusBadge>
      ) : row.is_active === false ? (
        <StatusBadge tone="danger">inactive</StatusBadge>
      ) : (
        <StatusBadge tone="success">active</StatusBadge>
      ),
  };
}

function textColumn<T extends ApiRow>(key: string, header: string): PremiumColumn<T> {
  return {
    key,
    header,
    render: (row) => <span className="text-slate-600 dark:text-slate-300">{formatValue(row[key])}</span>,
  };
}

function dateColumn<T extends ApiRow>(): PremiumColumn<T> {
  return {
    key: "updated",
    header: "Updated",
    render: (row) => <span className="text-slate-500">{formatDate(row.updated_at ?? row.created_at)}</span>,
  };
}

function useLabAccessRole(_orgId?: string, _labId?: string) {
  const { isOrgAdmin, can, canAny, roleName, canManageInventory } = useLabPermissions();
  const isLabManager =
    isOrgAdmin ||
    roleName.toLowerCase().includes("manager") ||
    canAny(P.ATTENDANCE_WRITE, P.MACHINES_WRITE, P.LABS_WRITE);
  return { isOrgAdmin, isLabManager, can, canAny, canManageInventory, roleName };
}

function useOrgRole(orgId?: string) {
  const { user } = useAuth();
  const orgMembers = usePagedResource<ApiRow>(orgId ? endpoints.organisations.members(orgId) : null, orgId);

  return useMemo(() => {
    const orgMember = orgMembers.rows.find((row) => Number(row.user?.id ?? row.id) === user?.id);
    return { isOrgAdmin: Boolean(orgMember?.is_admin) };
  }, [orgMembers.rows, user?.id]);
}

function toOptions(rows: ApiRow[]): FieldOption[] {
  return rows.map((row) => ({ value: String(row.id), label: displayName(row) }));
}

function toOption(value: string): FieldOption {
  return { value, label: value.replace(/_/g, " ").toLowerCase() };
}

function displayName(row: Partial<ApiRow> | undefined): string {
  if (!row) return "Unknown";
  return entityTitle(row as Entity);
}

function formatValue(value: unknown): string {
  if (typeof value === "object" && value !== null) {
    return displayName(value as ApiRow);
  }
  const text = formatDisplayValue(value);
  return text === "—" ? "-" : text;
}

function formatDate(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "Not updated";
  }
  const text = formatLocalDateTime(value);
  return text === "—" ? "Not updated" : text;
}
