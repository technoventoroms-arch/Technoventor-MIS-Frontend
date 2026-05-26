import { useEffect, useRef, useState, type ReactNode } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@mono/shared_ui/components/ui/tabs";
import {
  apiClient,
  endpoints,
  normalizeApiError,
  type Entity,
} from "@mono/api_client";

import { usePagedResource } from "./api-hooks";
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
  { name: "serial_number", label: "Serial number" },
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
      description="Start from the tenant that owns labs, members, billing, and operating data."
      metrics={[
        metric("Organisations", resource.rows.length, "Accessible tenants", <Building2 />),
        metric("Session", "JWT", "Django compatible", <Gauge />),
        metric("Operations", "Live", "No placeholder mode", <Activity />),
      ]}
    >
      <PremiumDataTable
        title="My Organizations"
        description={resource.error?.message ?? "Tenant records from the live MIS API."}
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
      description="Launch a tenant with admin ownership, billing readiness, and lab operations enabled."
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
      description="Premium redesign of the previous MIS request-lab flow."
      metrics={[
        metric("Labs", availableLabs.rows.length, "Available to request", <DoorOpen />),
      ]}
    >
      <ResourceCrudTable
        title="Available Labs"
        description={availableLabs.error?.message ?? "Discover active labs and submit the same join request as the previous MIS."}
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
      description="A premium overview of labs, teams, subscriptions, and high-priority work."
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
        description="Organisation-scoped labs from Django REST."
        resource={resource}
        fields={labFields}
        orgId={orgId}
        createPath={endpoints.labs.list(orgId)}
        updatePath={(row) => endpoints.labs.detail(orgId, row.id)}
        deletePath={(row) => endpoints.labs.detail(orgId, row.id)}
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
            createPath={endpoints.organisations.invites(orgId)}
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
            createPath={endpoints.iam.roles(orgId)}
            updatePath={(row) => `${endpoints.iam.roles(orgId)}${row.id}/`}
            deletePath={(row) => `${endpoints.iam.roles(orgId)}${row.id}/`}
            createLabel="Create role"
            columns={[nameColumn(), textColumn("description", "Description"), dateColumn()]}
          />
        </TabsContent>
      </Tabs>
    </PageFrame>
  );
}

export function LabMembersPage() {
  const { orgId, labId } = useParams();
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
      description="Assign organisation users to this lab, control roles, and issue RFID cards."
      metrics={[
        metric("Lab members", members.rows.length, "Active assignments", <Users />),
        metric("RFID cards", rfids.rows.length, "Selected member", <Radio />),
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
          createPath={`${endpoints.labs.members(orgId, labId)}add/`}
          deletePath={(row) => `${endpoints.labs.members(orgId, labId)}${row.id}/remove/`}
          createLabel="Assign member"
          columns={[
            memberColumn(),
            roleColumn(),
            {
              key: "rfid",
              header: "RFID",
              render: (row) => (
                <Button size="sm" variant="outline" onClick={() => setSelectedMember(row)}>
                  Manage RFID
                </Button>
              ),
            },
          ]}
        />
        {selectedMember ? (
          <ResourceCrudTable
            title="RFID cards"
            resource={rfids}
            fields={[{ name: "rfid_uid", label: "RFID UID", required: true }]}
            orgId={orgId}
            createPath={endpoints.labs.rfids(labId, selectedMember.id)}
            deletePath={(row) => `${endpoints.labs.rfids(labId, selectedMember.id)}${row.id}/`}
            createLabel="Add RFID"
            columns={[textColumn("rfid_uid", "RFID UID"), dateColumn()]}
          />
        ) : (
          <EmptyState title="Select a lab member" description="Choose Manage RFID to issue or revoke cards." />
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
      description="Monitor machines, inventory, projects, attendance, and IoT readiness for this lab."
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
            createPath={endpoints.inventory.items(labId)}
            updatePath={(row) => endpoints.inventory.item(labId, row.id)}
            deletePath={(row) => endpoints.inventory.item(labId, row.id)}
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
                    <Button size="sm" variant="outline" onClick={() => setAdjusting(row)}>
                      Adjust
                    </Button>
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
            createPath={endpoints.inventory.categories(labId)}
            updatePath={(row) => `${endpoints.inventory.categories(labId)}${row.id}/`}
            deletePath={(row) => `${endpoints.inventory.categories(labId)}${row.id}/`}
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
            createPath={endpoints.inventory.units(labId)}
            updatePath={(row) => `${endpoints.inventory.units(labId)}${row.id}/`}
            deletePath={(row) => `${endpoints.inventory.units(labId)}${row.id}/`}
            createLabel="Add unit"
            columns={[nameColumn(), textColumn("symbol", "Symbol"), dateColumn()]}
          />
        </TabsContent>
      </Tabs>
      <ResourceFormDialog
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
      />
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
  const [statusMachine, setStatusMachine] = useState<ApiRow | null>(null);
  const [reservationMachine, setReservationMachine] = useState<ApiRow | null>(null);
  const [logMachine, setLogMachine] = useState<ApiRow | null>(null);
  const machines = usePagedResource<ApiRow>(labId ? endpoints.machines.list(labId) : null, orgId);
  const projects = usePagedResource<ApiRow>(labId ? endpoints.projects.list(labId) : null, orgId);
  const reservations = usePagedResource<ApiRow>(
    labId && reservationMachine ? endpoints.machines.reservations(labId, reservationMachine.id) : null,
    orgId
  );
  const logs = usePagedResource<ApiRow>(
    labId && logMachine ? endpoints.machines.logs(labId, logMachine.id) : null,
    orgId
  );

  if (!labId) return null;
  return (
    <PageFrame
      eyebrow="Equipment"
      title="Machines"
      description="Register machines, change states, inspect reservations, and prepare IoT operations."
      metrics={[metric("Machines", machines.rows.length, "Equipment records", <Wrench />)]}
    >
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <ResourceCrudTable
          title="Machines"
          resource={machines}
          fields={machineFields}
          orgId={orgId}
          createPath={endpoints.machines.list(labId)}
          updatePath={(row) => endpoints.machines.detail(labId, row.id)}
          deletePath={(row) => endpoints.machines.detail(labId, row.id)}
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
                  <Button size="sm" variant="outline" onClick={() => setStatusMachine(row)}>
                    Status
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setReservationMachine(row)}>
                    Reservations
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
              { name: "notes", label: "Notes", type: "textarea" },
            ]}
            orgId={orgId}
            createPath={endpoints.machines.reservations(labId, reservationMachine.id)}
            createLabel="Reserve machine"
            columns={[textColumn("project", "Project"), statusColumn(), textColumn("booked_from", "From"), textColumn("booked_till", "Till")]}
          />
        ) : (
          <EmptyState title="Select a machine" description="Open Reservations to view and create bookings." />
        )}
      </div>
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
          emptyDescription="Status changes and RFID machine events will appear here."
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
  const attendance = usePagedResource<ApiRow>(
    labId ? `${endpoints.attendance.me}?lab_id=${labId}` : endpoints.attendance.me,
    orgId
  );

  if (!labId) return null;
  return (
    <PageFrame
      eyebrow="Access"
      title="My Attendance"
      description="Review your RFID check-ins and request attendance regularisation."
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
              const notes = window.prompt("Reason for regularization", String(row.notes ?? ""));
              if (notes === null) return;
              await apiClient.update(endpoints.attendance.meRecord(row.id), { notes }, { orgId });
            },
          },
        ]}
      />
    </PageFrame>
  );
}

export function ApprovalsPage() {
  const { orgId, labId } = useParams();
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
    </PageFrame>
  );
}

export function CartPage() {
  const { orgId, labId } = useParams();
  const cart = usePagedResource<ApiRow>(labId ? endpoints.inventory.cart(labId) : null, orgId);

  return (
    <PageFrame
      eyebrow="Cart"
      title="Cart"
      description="Premium redesign of the previous MIS cart page for collecting inventory before checkout."
      metrics={[
        metric("Cart items", cart.rows.length, "Ready for checkout", <ShoppingCart />),
        metric("Checkout", "Django", "Creates project inventory orders", <Boxes />),
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
              const projectId = window.prompt("Enter project ID for this checkout");
              if (!projectId) return;
              await apiClient.create(endpoints.inventory.cartCheckout(String(labId)), { project_id: Number(projectId) }, { orgId });
            },
          },
        ]}
      />
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
      description="Premium redesign of the previous MIS user-level order aggregation."
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
    const scannerId = "premium-machine-qr-reader";
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
                if (!machineId) throw new Error("Machine QR must include id or machine_id.");
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
      description="Premium redesign of the previous QR/RFID machine scan page."
      metrics={[
        metric("Machines", machines.rows.length, "Browser scan targets", <ScanBarcode />),
        metric("IoT endpoint", "Available", "RFID terminal flow still supported", <Radio />),
      ]}
    >
      <PremiumSurface className="mb-6 p-6">
        <SectionHeader
          eyebrow="Camera"
          title={scannedMachineId ? `Scanned machine #${scannedMachineId}` : "Scan Machine QR"}
          description={scannerError ?? "Scan the previous MIS machine QR code, then use the active reservation below."}
        />
        <div id="premium-machine-qr-reader" className="mt-4 overflow-hidden rounded-xl border" />
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
                throw new Error("No approved reservation is active for this machine right now.");
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
  const reservations = usePagedResource<ApiRow>(
    labId && machineId ? endpoints.machines.reservations(labId, machineId) : null,
    orgId
  );

  return (
    <PageFrame
      eyebrow="Machine"
      title="Machine Schedule"
      description="Premium redesign of the previous machine schedule page."
      metrics={[metric("Reservations", reservations.rows.length, "Current page", <Wrench />)]}
    >
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

  return (
    <PageFrame
      eyebrow="Machine"
      title="Machine Details"
      description="Premium redesign of the previous machine details page."
      metrics={[metric("Machine", `#${machineId}`, "Detail route preserved", <Wrench />)]}
    >
      <EmptyState
        title="Machine details are available from the Machines page"
        description="The premium Machines page includes edit, status, reservation, and log actions while preserving this previous MIS route."
        icon={<Wrench className="size-7" />}
        action={
          <Button asChild>
            <Link to={`/${orgId}/lab/${labId}/machine`}>Open Machines</Link>
          </Button>
        }
      />
    </PageFrame>
  );
}

export function MachineLogsPage() {
  const { orgId, labId, machineId } = useParams();
  const logs = usePagedResource<ApiRow>(
    labId && machineId ? endpoints.machines.logs(labId, machineId) : null,
    orgId
  );

  return (
    <PageFrame
      eyebrow="Machine"
      title="Machine Logs"
      description="Premium redesign of the previous machine logs page."
      metrics={[metric("Logs", logs.rows.length, "Status audit records", <Wrench />)]}
    >
      <PremiumDataTable
        title="Machine Logs"
        description={logs.error?.message ?? "Status and RFID audit trail."}
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
      description="Premium redesign of the previous project detail page with team and inventory order tabs."
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
      description={resource.error?.message ?? "Live API-backed data."}
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
