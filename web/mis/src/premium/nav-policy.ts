import type { ShellNavItem } from "@mono/shared_ui/components/premium";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  CalendarCheck,
  CalendarDays,
  FileText,
  FlaskConical,
  Gauge,
  LayoutDashboard,
  ListChecks,
  Plus,
  QrCode,
  Settings,
  ShoppingCart,
  UserCircle,
  Users,
  Wrench,
} from "lucide-react";

import { resolveLabNavPersona } from "./lab-role";
import { P } from "./permission-codes";
import { NAV_SECTION_EXTRA_LABELS, NAV_SECTION_TO_LABEL } from "./profile-to-ui-context";

export function buildMisNav(options: {
  orgId?: string;
  labId?: string;
  isOrgAdmin: boolean;
  roleName?: string;
  canCreateOrganisation?: boolean;
  showJoinLab?: boolean;
  can: (codename: string) => boolean;
  canAny: (...codenames: string[]) => boolean;
  canManageInventory?: boolean;
  navigationSections?: string[];
  capabilities?: {
    can_create_organisation?: boolean;
    can_manage_org_settings?: boolean;
    can_invite_members?: boolean;
    can_view_billing?: boolean;
  };
}): ShellNavItem[] {
  const {
    orgId,
    labId,
    isOrgAdmin,
    roleName = "",
    canCreateOrganisation = false,
    showJoinLab = true,
    can,
    canAny,
    canManageInventory = false,
    navigationSections = [],
    capabilities = {},
  } = options;
  const profileItem: ShellNavItem = { label: "Profile", to: "/profile", icon: UserCircle };

  if (!orgId) {
    const rootItems: ShellNavItem[] = [
      { label: "My organisations", to: "/", icon: Building2, end: true },
      ...(canCreateOrganisation
        ? [{ label: "Create organisation", to: "/create-organization", icon: Plus }]
        : []),
      ...(showJoinLab
        ? [{ label: "Join a lab", to: "/request_lab", icon: FlaskConical }]
        : []),
      profileItem,
    ];
    return applyNavigationSectionFilter(rootItems, navigationSections);
  }

  const orgBase = `/${orgId}`;

  if (labId) {
    return buildLabNav({
      orgBase,
      labBase: `${orgBase}/lab/${labId}`,
      isOrgAdmin,
      roleName,
      can,
      canAny,
      canManageInventory,
      profileItem,
    });
  }

  const orgItems: ShellNavItem[] = [
    { label: "Dashboard", to: `${orgBase}/dashboard`, icon: LayoutDashboard },
    { label: "Labs", to: `${orgBase}/labs`, icon: FlaskConical, end: !isOrgAdmin },
    ...(isOrgAdmin
      ? [
          { label: "Users", to: `${orgBase}/users`, icon: Users },
          ...(capabilities.can_manage_org_settings
            ? [{ label: "Organization", to: `${orgBase}/organization`, icon: Settings }]
            : []),
          ...(capabilities.can_view_billing
            ? [{ label: "Billing", to: `${orgBase}/settings`, icon: FileText }]
            : []),
        ]
      : []),
    ...(isOrgAdmin || can(P.REPORTS_READ)
      ? [{ label: "Reports", to: `${orgBase}/reports`, icon: BarChart3 }]
      : []),
    profileItem,
  ];
  return applyNavigationSectionFilter(orgItems, navigationSections);
}

function sectionKeysToAllowedLabels(section: string): string[] {
  const key = section.trim().toLowerCase();
  if (!key) return [];
  const primary = NAV_SECTION_TO_LABEL[key] ?? "";
  const extras = NAV_SECTION_EXTRA_LABELS[key] ?? [];
  return [key, primary, ...extras].map((label) => label.trim().toLowerCase()).filter(Boolean);
}

function applyNavigationSectionFilter(items: ShellNavItem[], navigationSections: string[]): ShellNavItem[] {
  if (!navigationSections.length) return items;
  const allowed = new Set<string>(
    navigationSections.flatMap((section) => sectionKeysToAllowedLabels(section))
  );
  // Product requirement: org-level sidebar essentials should never disappear by RBAC section misconfiguration.
  const alwaysVisible = new Set(["dashboard", "labs", "profile"]);
  return items.filter((item) => {
    const normalizedLabel = item.label.trim().toLowerCase();
    if (alwaysVisible.has(normalizedLabel)) return true;
    const normalizedWords = normalizedLabel.split(" ");
    return (
      allowed.has(normalizedLabel) ||
      normalizedWords.some((word) => allowed.has(word)) ||
      (normalizedLabel === "my organisations" && allowed.has("organisations"))
    );
  });
}

function buildLabNav({
  orgBase,
  labBase,
  isOrgAdmin,
  roleName,
  can,
  canAny,
  canManageInventory,
  profileItem,
}: {
  orgBase: string;
  labBase: string;
  isOrgAdmin: boolean;
  roleName: string;
  can: (codename: string) => boolean;
  canAny: (...codenames: string[]) => boolean;
  canManageInventory: boolean;
  profileItem: ShellNavItem;
}): ShellNavItem[] {
  const back: ShellNavItem = { label: "Back to labs", to: `${orgBase}/labs`, icon: ArrowLeft };
  const accountBasics: ShellNavItem[] = [
    { label: "Notifications", to: `${labBase}/notifications`, icon: Bell },
    profileItem,
  ];

  const persona = resolveLabNavPersona(isOrgAdmin, roleName);

  if (persona === "org-admin") {
    return [
      back,
      { label: "Dashboard", to: labBase, icon: Gauge, end: true },
      { label: "Projects", to: `${labBase}/projects`, icon: ListChecks },
      { label: "Machines", to: `${labBase}/machine`, icon: Wrench },
      { label: "Booking calendar", to: `${labBase}/bookings`, icon: CalendarDays },
      { label: "Inventory", to: `${labBase}/inventory`, icon: Boxes },
      { label: "Attendance", to: `${labBase}/attendance`, icon: CalendarCheck },
      { label: "Lab members", to: `${labBase}/users`, icon: Users },
      { label: "Cart", to: `${labBase}/cart`, icon: ShoppingCart },
      { label: "My orders", to: `${labBase}/orders`, icon: FileText },
      { label: "Approvals", to: `${labBase}/approval`, icon: Activity },
      { label: "Lab settings", to: `${labBase}/edit-lab`, icon: QrCode },
      { label: "Reports", to: `${orgBase}/reports`, icon: BarChart3 },
      ...accountBasics,
    ];
  }

  if (persona === "lab-manager") {
    const managerItems: ShellNavItem[] = [
      back,
      { label: "Dashboard", to: labBase, icon: Gauge, end: true },
      { label: "Machines", to: `${labBase}/machine`, icon: Wrench },
      { label: "Approvals", to: `${labBase}/approval`, icon: Activity },
      { label: "Booking calendar", to: `${labBase}/bookings`, icon: CalendarDays },
      { label: "Lab settings", to: `${labBase}/edit-lab`, icon: QrCode },
      { label: "Lab members", to: `${labBase}/users`, icon: Users },
    ];
    if (isOrgAdmin || canManageInventory) {
      managerItems.push({ label: "Inventory", to: `${labBase}/inventory`, icon: Boxes });
    }
    managerItems.push({ label: "Reports", to: `${orgBase}/reports`, icon: BarChart3 }, ...accountBasics);
    return managerItems;
  }

  if (persona === "student") {
    return [
      back,
      { label: "Dashboard", to: labBase, icon: Gauge, end: true },
      { label: "Projects", to: `${labBase}/projects`, icon: ListChecks },
      { label: "Machines", to: `${labBase}/machine`, icon: Wrench },
      { label: "Booking calendar", to: `${labBase}/bookings`, icon: CalendarDays },
      { label: "Inventory", to: `${labBase}/inventory`, icon: Boxes },
      { label: "Attendance", to: `${labBase}/attendance`, icon: CalendarCheck },
      { label: "Cart", to: `${labBase}/cart`, icon: ShoppingCart },
      { label: "My orders", to: `${labBase}/orders`, icon: FileText },
      ...accountBasics,
    ];
  }

  const items: ShellNavItem[] = [back];
  if (can(P.LABS_READ)) {
    items.push({ label: "Dashboard", to: labBase, icon: Gauge, end: true });
  }
  if (can(P.PROJECTS_READ)) {
    items.push({ label: "Projects", to: `${labBase}/projects`, icon: ListChecks });
  }
  if (can(P.MACHINES_READ)) {
    items.push({ label: "Machines", to: `${labBase}/machine`, icon: Wrench });
  }
  if (can(P.INVENTORY_READ)) {
    items.push({ label: "Inventory", to: `${labBase}/inventory`, icon: Boxes });
  }
  if (can(P.USERS_READ)) {
    items.push({ label: "Lab members", to: `${labBase}/users`, icon: Users });
  }
  if (can(P.PROJECTS_ORDER)) {
    items.push({ label: "Cart", to: `${labBase}/cart`, icon: ShoppingCart });
    items.push({ label: "My orders", to: `${labBase}/orders`, icon: FileText });
  }
  if (can(P.ATTENDANCE_READ)) {
    items.push({ label: "Attendance", to: `${labBase}/attendance`, icon: CalendarCheck });
  }
  if (canAny(P.ATTENDANCE_WRITE, P.INVENTORY_WRITE, P.MACHINES_WRITE, P.PROJECTS_WRITE)) {
    items.push({ label: "Approvals", to: `${labBase}/approval`, icon: Activity });
  }
  if (canAny(P.SETTINGS_WRITE, P.LABS_WRITE)) {
    items.push({ label: "Lab settings", to: `${labBase}/edit-lab`, icon: QrCode });
  }
  if (can(P.REPORTS_READ)) {
    items.push({ label: "Reports", to: `${orgBase}/reports`, icon: BarChart3 });
  }
  items.push(...accountBasics);
  return items;
}

