import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  Boxes,
  Building2,
  CalendarCheck,
  CreditCard,
  DoorOpen,
  FileText,
  FlaskConical,
  Gauge,
  ListChecks,
  Loader2,
  Plus,
  Radio,
  ScanBarcode,
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
  apiClient,
  endpoints,
  normalizeApiError,
  type Entity,
} from "@mono/api_client";

import { usePagedResource } from "./api-hooks";
import { useAuth } from "./auth";
import { MachineApiKeySection } from "./machine-api-key-section";
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
  {
    name: "booking_enabled",
    label: "Allow bookings",
    type: "select",
    options: [
      { value: "true", label: "Enabled" },
      { value: "false", label: "Disabled" },
    ],
    defaultValue: "true",
  },
  { name: "slot_duration_minutes", label: "Slot duration (minutes)", type: "number", defaultValue: "60" },
  { name: "no_show_grace_minutes", label: "No-show grace (minutes)", type: "number", defaultValue: "30" },
  { name: "booking_window_start", label: "Booking start (HH:MM)", placeholder: "09:00" },
  { name: "booking_window_end", label: "Booking end (HH:MM)", placeholder: "18:00" },
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
  {
    name: "priority",
    label: "Priority",
    type: "select",
    defaultValue: "medium",
    options: ["low", "medium", "high", "very high"].map(toOption),
  },
  { name: "start_date", label: "Start date", type: "date" },
  { name: "end_date", label: "End date", type: "date" },
  { name: "description", label: "Description", type: "textarea" },
];

export function OrganisationSwitcherPage() {
  const resource = usePagedResource<ApiRow>(endpoints.organisations.list);

  return (
    <PageFrame
      eyebrow="Workspace"
      title="My Organizations"
      description="Choose the organisation that contains your labs, people, billing, and day-to-day operations."
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
        emptyDescription="Create an organisation to unlock the MIS workspace."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/request_lab">
                <DoorOpen className="size-4" />
                Join Lab
              </Link>
            </Button>
            <Button asChild>
              <Link to="/create-organizations">
                <Plus className="size-4" />
                Create Org
              </Link>
            </Button>
          </div>
        }
      />
    </PageFrame>
  );
}

export function CreateOrganisationPage() {
  const navigate = useNavigate();
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
  const availableLabs = usePagedResource<ApiRow>(endpoints.labs.available);

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
  const subscriptions = usePagedResource<ApiRow>(
    orgId ? endpoints.billing.subscriptions(orgId) : null,
    orgId
  );

  return (
    <PageFrame
      eyebrow="Organisation"
      title="Dashboard"
      description="Overview of labs, teams, subscriptions, and high-priority work."
      metrics={[
        metric("Labs", labs.rows.length, "Facilities online", <FlaskConical />),
        metric("Members", members.rows.length, "Organisation users", <Users />),
        metric("Subscriptions", subscriptions.rows.length, "Billing records", <CreditCard />),
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
        transformPayload={(values) => ({
          ...values,
          booking_enabled: values.booking_enabled === "true",
          slot_duration_minutes: values.slot_duration_minutes ? Number(values.slot_duration_minutes) : undefined,
          no_show_grace_minutes: values.no_show_grace_minutes ? Number(values.no_show_grace_minutes) : undefined,
        })}
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
  const { isOrgAdmin } = useOrgRole(orgId);
  const labs = usePagedResource<ApiRow>(orgId ? endpoints.labs.list(orgId) : null, orgId);
  const roles = usePagedResource<ApiRow>(orgId ? endpoints.iam.roles(orgId) : null, orgId);
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
          <CompactTable title="Members" resource={members} columns={[memberColumn(), dateColumn()]} />
          {isOrgAdmin ? (
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                Bulk import users
              </Button>
            </div>
          ) : null}
        </TabsContent>
        <TabsContent value="invites">
          <ResourceCrudTable
            title="Invites"
            resource={invites}
            fields={[
              { name: "email", label: "Email", type: "email", required: true },
              { name: "lab", label: "Lab", type: "select", options: toOptions(labs.rows) },
              { name: "role", label: "Role", type: "select", options: toOptions(roles.rows) },
            ]}
            orgId={orgId}
            createPath={isOrgAdmin ? endpoints.organisations.invites(orgId) : undefined}
            createLabel="Invite member"
            columns={[textColumn("email", "Email"), textColumn("status", "Status"), dateColumn()]}
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
        <ResourceCrudTable
          title="Lab members"
          resource={members}
          fields={[
            {
              name: "user_id",
              label: "Organisation user",
              type: "select",
              required: true,
              options: orgMembers.rows.map((row) => ({
                value: String(row.user?.id ?? row.id),
                label: displayName(row.user ?? row),
              })),
            },
            { name: "role_id", label: "Role", type: "select", required: true, options: toOptions(roles.rows) },
          ]}
          orgId={orgId}
          createPath={isOrgAdmin || isLabManager ? `${endpoints.labs.members(orgId, labId)}add/` : undefined}
          deletePath={isOrgAdmin || isLabManager ? (row) => `${endpoints.labs.members(orgId, labId)}${row.id}/remove/` : undefined}
          createLabel="Assign member"
          columns={[
            memberColumn(),
            roleColumn(),
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
            resource={rfids}
            fields={[{ name: "rfid_uid", label: "Card UID", required: true }]}
            orgId={orgId}
            createPath={isOrgAdmin || isLabManager ? endpoints.labs.rfids(labId, selectedMember.id) : undefined}
            deletePath={isOrgAdmin || isLabManager ? (row) => `${endpoints.labs.rfids(labId, selectedMember.id)}${row.id}/` : undefined}
            createLabel="Add card"
            columns={[textColumn("rfid_uid", "Card UID"), dateColumn()]}
          />
        ) : (
          <EmptyState title="Select a lab member" description="Choose Manage card to add or remove access cards." />
        )}
      </div>
    </PageFrame>
  );
}

export function BillingPage() {
  const { orgId } = useParams();
  const [selectedSubscription, setSelectedSubscription] = useState<ApiRow | null>(null);
  const subscriptions = usePagedResource<ApiRow>(
    orgId ? endpoints.billing.subscriptions(orgId) : null,
    orgId
  );
  const invoices = usePagedResource<ApiRow>(
    selectedSubscription ? endpoints.billing.invoices(selectedSubscription.id) : null,
    orgId
  );
  const plans = useUnpaginated<ApiRow>(endpoints.billing.plans);

  return (
    <PageFrame
      eyebrow="Commercial"
      title="Subscriptions"
      description="Review active subscriptions, invoices, and public plan entitlements."
      metrics={[
        metric("Subscriptions", subscriptions.rows.length, "Org billing records", <CreditCard />),
        metric("Plans", plans.rows.length, "Public catalog", <ListChecks />),
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <PremiumDataTable
          title="Subscriptions"
          description={subscriptions.error?.message ?? "Organisation subscription records."}
          columns={[
            planColumn(),
            statusColumn(),
            dateColumn(),
            {
              key: "invoices",
              header: "Invoices",
              render: (row) => (
                <Button size="sm" variant="outline" onClick={() => setSelectedSubscription(row)}>
                  View invoices
                </Button>
              ),
            },
          ]}
          rows={subscriptions.rows}
          getRowKey={(row) => String(row.id)}
          next={subscriptions.next}
          previous={subscriptions.previous}
          onNext={subscriptions.loadNext}
          onPrevious={subscriptions.loadPrevious}
          emptyTitle="No subscriptions"
          emptyDescription="Subscription records will appear after billing setup."
        />
        <PremiumDataTable
          title="Plans"
          description={plans.error ?? "Public billing plans available for onboarding."}
          columns={[nameColumn(), textColumn("amount", "Amount"), textColumn("billing_period", "Period")]}
          rows={plans.rows}
          getRowKey={(row) => String(row.id)}
        />
      </div>
      {selectedSubscription ? (
        <PremiumDataTable
          title="Invoices"
          description={`Invoices for subscription #${selectedSubscription.id}.`}
          columns={[
            textColumn("provider_invoice_id", "Invoice"),
            statusColumn(),
            textColumn("amount", "Amount"),
            textColumn("currency", "Currency"),
            textColumn("issued_at", "Issued"),
            textColumn("paid_at", "Paid"),
          ]}
          rows={invoices.rows}
          getRowKey={(row) => String(row.id)}
          next={invoices.next}
          previous={invoices.previous}
          onNext={invoices.loadNext}
          onPrevious={invoices.loadPrevious}
          emptyTitle="No invoices"
          emptyDescription="Invoices will appear when the billing provider creates them."
        />
      ) : null}
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
  const { isOrgAdmin, isLabManager } = useLabAccessRole(orgId, labId);
  const [adjusting, setAdjusting] = useState<ApiRow | null>(null);
  const [movementItem, setMovementItem] = useState<ApiRow | null>(null);
  const items = usePagedResource<ApiRow>(labId ? endpoints.inventory.items(labId) : null, orgId);
  const categories = usePagedResource<ApiRow>(labId ? endpoints.inventory.categories(labId) : null, orgId);
  const units = usePagedResource<ApiRow>(labId ? endpoints.inventory.units(labId) : null, orgId);
  const movements = usePagedResource<ApiRow>(
    labId && movementItem ? endpoints.inventory.movements(labId, movementItem.id) : null,
    orgId
  );

  if (!labId) return null;
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
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="units">Units</TabsTrigger>
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
            createPath={isOrgAdmin || isLabManager ? endpoints.inventory.items(labId) : undefined}
            updatePath={isOrgAdmin || isLabManager ? (row) => endpoints.inventory.item(labId, row.id) : undefined}
            deletePath={isOrgAdmin || isLabManager ? (row) => endpoints.inventory.item(labId, row.id) : undefined}
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
                    {isOrgAdmin || isLabManager ? (
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
            createPath={isOrgAdmin || isLabManager ? endpoints.inventory.categories(labId) : undefined}
            updatePath={isOrgAdmin || isLabManager ? (row) => `${endpoints.inventory.categories(labId)}${row.id}/` : undefined}
            deletePath={isOrgAdmin || isLabManager ? (row) => `${endpoints.inventory.categories(labId)}${row.id}/` : undefined}
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
            createPath={isOrgAdmin || isLabManager ? endpoints.inventory.units(labId) : undefined}
            updatePath={isOrgAdmin || isLabManager ? (row) => `${endpoints.inventory.units(labId)}${row.id}/` : undefined}
            deletePath={isOrgAdmin || isLabManager ? (row) => `${endpoints.inventory.units(labId)}${row.id}/` : undefined}
            createLabel="Add unit"
            columns={[nameColumn(), textColumn("symbol", "Symbol"), dateColumn()]}
          />
        </TabsContent>
      </Tabs>
      {isOrgAdmin || isLabManager ? <ResourceFormDialog
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

export function MachinesPage() {
  const { orgId, labId } = useParams();
  const { isOrgAdmin, isLabManager } = useLabAccessRole(orgId, labId);
  const [statusMachine, setStatusMachine] = useState<ApiRow | null>(null);
  const [reservationMachine, setReservationMachine] = useState<ApiRow | null>(null);
  const [logMachine, setLogMachine] = useState<ApiRow | null>(null);
  const [bookingMachine, setBookingMachine] = useState<ApiRow | null>(null);
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
  const slotCandidates = useMemo(() => {
    if (!bookingDate) return [];
    const slots: { from: string; till: string; blocked: boolean }[] = [];
    for (let hour = 9; hour < 18; hour++) {
      const from = `${bookingDate}T${String(hour).padStart(2, "0")}:00`;
      const till = `${bookingDate}T${String(hour + 1).padStart(2, "0")}:00`;
      const fromDate = new Date(from);
      const tillDate = new Date(till);
      const blocked = existingReservations.some((reservation) => {
        if (!reservation.booked_from || !reservation.booked_till) return false;
        const rFrom = new Date(String(reservation.booked_from));
        const rTill = new Date(String(reservation.booked_till));
        return rFrom < tillDate && rTill > fromDate && reservation.status !== "CANCELLED" && reservation.status !== "REJECTED";
      });
      slots.push({ from, till, blocked });
    }
    return slots;
  }, [bookingDate, existingReservations]);

  if (!labId) return null;
  return (
    <PageFrame
      eyebrow="Equipment"
      title="Machines"
      description="Register machines, update status, review bookings, and manage day-to-day use."
      metrics={[metric("Machines", machines.rows.length, "Equipment records", <Wrench />)]}
    >
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
                          IoT key
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
                    setBookingError(null);
                  }}>
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
            createPath={endpoints.machines.reservations(labId, reservationMachine.id)}
            createLabel="Reserve machine"
            transformPayload={(values) => {
              const payload: Record<string, unknown> = {
                project: Number(values.project),
                booked_from: values.booked_from,
                booked_till: values.booked_till,
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
                  <Select value={bookingProject} onValueChange={setBookingProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
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
                  <div className="space-y-2">
                    <Label>Calendar date</Label>
                    <Input type="date" value={bookingDate} onChange={(event) => setBookingDate(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Open slots</Label>
                    <div className="grid grid-cols-3 gap-2 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-3 dark:border-teal-800/60 dark:from-teal-950/30 dark:to-slate-950">
                      {slotCandidates.map((slot) => (
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
                      ))}
                    </div>
                  </div>
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
                      if (bookingStep === 3 && (!bookingSlotStart || !bookingSlotEnd)) return setBookingError("Select an open slot.");
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
                      setIsBooking(true);
                      setBookingError(null);
                      try {
                        const payload: Record<string, unknown> = {
                          project: Number(bookingProject),
                          machine: Number(bookingMachineId),
                          booked_from: bookingSlotStart,
                          booked_till: bookingSlotEnd,
                          notes: bookingNotes,
                        };
                        const finalItemId = bookingMaterialItem === "custom" ? bookingCustomMaterialItem : bookingMaterialItem;
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
      description="Manage projects, owners, priorities, and inventory order requests."
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
            textColumn("priority", "Priority"),
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
  const { isOrgAdmin, isLabManager } = useLabAccessRole(orgId, labId);
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
      {!isOrgAdmin && !isLabManager ? (
        <EmptyState
          title="Approval access required"
          description="This page is available to organisation admins and lab managers."
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

export function ScanMachinePage() {
  const { orgId, labId } = useParams();
  const machines = usePagedResource<ApiRow>(labId ? endpoints.machines.list(labId) : null, orgId);
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scannedMachineId, setScannedMachineId] = useState<string | null>(null);
  const machineRows = scannedMachineId
    ? machines.rows.filter((row) => String(row.id) === scannedMachineId)
    : machines.rows;
  const visibleMachines = { ...machines, rows: machineRows };

  useEffect(() => {
    const scannerId = "mis-machine-qr-reader";
    let isCancelled = false;

    import("html5-qrcode")
      .then(({ Html5Qrcode }) => {
        if (isCancelled || !document.getElementById(scannerId)) return;
        const scanner = new Html5Qrcode(scannerId);
        scannerRef.current = scanner;
        scanner
          .start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              try {
                const parsed = JSON.parse(decodedText) as { id?: unknown; machine_id?: unknown };
                const machineId = parsed.id ?? parsed.machine_id;
                if (!machineId) throw new Error("This QR code does not contain valid machine information.");
                setScannedMachineId(String(machineId));
              } catch {
                setScannerError("Invalid machine QR code.");
                return;
              }
              void scanner.stop().then(() => scanner.clear()).catch(() => undefined);
            },
            () => undefined
          )
          .catch((error: Error) => setScannerError(error.message));
      })
      .catch((error: Error) => setScannerError(error.message));

    return () => {
      isCancelled = true;
      void scannerRef.current?.stop().then(() => scannerRef.current?.clear()).catch(() => undefined);
    };
  }, []);

  return (
    <PageFrame
      eyebrow="Machine access"
      title="Scan Machine"
      description="Scan machine QR, validate reservations, and start or stop sessions."
      metrics={[
        metric("Equipment", machines.rows.length, "In this lab", <ScanBarcode />),
        metric("Scanning", "Camera", "Point at the machine QR code", <Radio />),
      ]}
    >
      <PremiumSurface className="mb-6 p-6">
        <SectionHeader
          eyebrow="Camera"
          title={scannedMachineId ? `Machine ${scannedMachineId}` : "Scan machine QR code"}
          description={
            scannerError ??
            "Allow camera access, scan the machine QR code, then start or complete your session from the list below."
          }
        />
        <div id="mis-machine-qr-reader" className="mt-4 overflow-hidden rounded-xl border" />
        {scannedMachineId ? (
          <Button className="mt-4" variant="outline" onClick={() => setScannedMachineId(null)}>
            Scan Again
          </Button>
        ) : null}
      </PremiumSurface>
      <ResourceCrudTable
        title="Scan Machine"
        description={machines.error?.message ?? "Select a scanned machine record to start or stop your current approved reservation."}
        resource={visibleMachines}
        fields={[]}
        orgId={orgId}
        columns={[
          nameColumn(),
          statusColumn(),
          textColumn("model_number", "Model"),
          textColumn("serial_number", "Serial"),
        ]}
        rowActions={[
          {
            label: "Use machine",
            run: async (row) => {
              const current = await apiClient.list<ApiRow>(endpoints.machines.currentReservation(String(labId), row.id), { orgId });
              const reservation = current.results[0];
              if (!reservation) {
                throw new Error("No approved booking is active for this machine right now.");
              }
              const nextStatus = row.status === "ACTIVE" ? "OFF" : "ACTIVE";
              await apiClient.create(endpoints.machines.reservationConsume(reservation.id), { status: nextStatus }, { orgId });
            },
          },
        ]}
      />
    </PageFrame>
  );
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
      <div className="mb-4 flex flex-wrap gap-2">
        {isOrgAdmin || isLabManager ? (
          <Button asChild variant="secondary">
            <Link to={detailsPath}>Machine details &amp; IoT key</Link>
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
            <MachineApiKeySection orgId={orgId} labId={labId} machineId={machineId} />
          ) : (
            <PremiumSurface className="p-6 space-y-2 border border-dashed border-slate-300 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Machine IoT credential</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                The machine API key for ESP32 / Wokwi is only visible to{" "}
                <strong>lab managers</strong> and <strong>organisation admins</strong>. Log in as{" "}
                <code className="text-teal-700 dark:text-teal-300">lab.manager@technoventor.com</code>{" "}
                (demo) and open this same page via{" "}
                <strong>Machines → IoT key</strong> or{" "}
                <strong>Machine details &amp; IoT key</strong>.
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
            <Link to={detailsPath}>Machine details &amp; IoT key</Link>
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
  const text = value === null || value === undefined || value === "" ? "—" : String(value);
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

function useUnpaginated<T extends Entity>(path: string) {
  const [rows, setRows] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .listUnpaginated<T>(path)
      .then((data) => {
        if (isMounted) setRows(data);
      })
      .catch((requestError) => {
        if (isMounted) setError(normalizeApiError(requestError).message);
      });
    return () => {
      isMounted = false;
    };
  }, [path]);

  return { rows, error };
}

function metric(label: string, value: string | number, helper: string, icon: ReactNode): Metric {
  return { label, value: String(value), helper, icon };
}

function nameColumn<T extends ApiRow>(): PremiumColumn<T> {
  return {
    key: "name",
    header: "Name",
    render: (row) => (
      <div>
        <p className="font-semibold text-slate-950 dark:text-white">{displayName(row)}</p>
        <p className="text-xs text-slate-500">ID {String(row.id)}</p>
      </div>
    ),
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

function planColumn<T extends ApiRow>(): PremiumColumn<T> {
  return {
    key: "plan",
    header: "Plan",
    render: (row) => <span>{displayName(row.plan ?? row)}</span>,
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

function useLabAccessRole(orgId?: string, labId?: string) {
  const { user } = useAuth();
  const orgMembers = usePagedResource<ApiRow>(orgId ? endpoints.organisations.members(orgId) : null, orgId);
  const labMembers = usePagedResource<ApiRow>(
    orgId && labId ? endpoints.labs.members(orgId, labId) : null,
    orgId
  );

  return useMemo(() => {
    const orgMember = orgMembers.rows.find((row) => Number(row.user?.id ?? row.id) === user?.id);
    const labMember = labMembers.rows.find((row) => Number(row.user?.id ?? row.id) === user?.id);
    const roleName = String(labMember?.role?.name ?? "").toLowerCase();
    const isOrgAdmin = Boolean(orgMember?.is_admin);
    const isLabManager = roleName.includes("manager") || roleName.includes("mentor");
    return { isOrgAdmin, isLabManager };
  }, [labMembers.rows, orgMembers.rows, user?.id]);
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
  return String(row.full_name ?? row.name ?? row.title ?? row.email ?? row.number ?? `Record ${row.id}`);
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") return displayName(value as ApiRow);
  return String(value);
}

function formatDate(value: unknown): string {
  if (typeof value !== "string") return "Not updated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not updated";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}
