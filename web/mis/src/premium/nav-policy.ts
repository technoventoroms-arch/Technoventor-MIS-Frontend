import type { ShellNavItem } from "@mono/shared_ui/components/premium";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  CalendarCheck,
  CreditCard,
  FileText,
  FlaskConical,
  Gauge,
  LayoutDashboard,
  ListChecks,
  Plus,
  QrCode,
  ScanBarcode,
  Settings,
  ShoppingCart,
  UserCircle,
  Users,
  Wrench,
} from "lucide-react";

import { P } from "./permission-codes";

export function buildMisNav(options: {
  orgId?: string;
  labId?: string;
  isOrgAdmin: boolean;
  can: (codename: string) => boolean;
  canAny: (...codenames: string[]) => boolean;
}): ShellNavItem[] {
  const { orgId, labId, isOrgAdmin, can, canAny } = options;
  const profileItem: ShellNavItem = { label: "Profile", to: "/profile", icon: UserCircle };

  if (!orgId) {
    return [
      { label: "My organisations", to: "/", icon: Building2, end: true },
      { label: "Create organisation", to: "/create-organization", icon: Plus },
      { label: "Join a lab", to: "/request_lab", icon: FlaskConical },
      profileItem,
    ];
  }

  const orgBase = `/${orgId}`;

  if (labId) {
    const labBase = `${orgBase}/lab/${labId}`;
    const items: ShellNavItem[] = [
      { label: "Back to labs", to: `${orgBase}/labs`, icon: ArrowLeft },
    ];

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
    if (canAny(P.PROJECTS_ORDER, P.INVENTORY_READ)) {
      items.push({ label: "Cart", to: `${labBase}/cart`, icon: ShoppingCart });
    }
    if (can(P.PROJECTS_READ)) {
      items.push({ label: "My orders", to: `${labBase}/orders`, icon: FileText });
    }
    items.push({ label: "Notifications", to: `${labBase}/notifications`, icon: Bell });
    if (can(P.ATTENDANCE_READ)) {
      items.push({ label: "My attendance", to: `${labBase}/attendance`, icon: CalendarCheck });
    }
    if (can(P.MACHINES_READ)) {
      items.push({ label: "Scan machine", to: `${labBase}/scan-machine`, icon: ScanBarcode });
    }
    if (canAny(P.ATTENDANCE_WRITE, P.INVENTORY_WRITE, P.MACHINES_WRITE, P.PROJECTS_WRITE)) {
      items.push({ label: "Approvals", to: `${labBase}/approval`, icon: Activity });
    }
    if (canAny(P.SETTINGS_WRITE, P.LABS_WRITE)) {
      items.push({ label: "Lab settings", to: `${labBase}/edit-lab`, icon: QrCode });
    }
    if (can(P.REPORTS_READ) || isOrgAdmin) {
      items.push({ label: "Reports", to: `${orgBase}/reports`, icon: BarChart3 });
    }
    items.push(profileItem);
    return items;
  }

  return [
    ...(isOrgAdmin
      ? [{ label: "Dashboard", to: `${orgBase}/dashboard`, icon: LayoutDashboard }]
      : []),
    { label: "Labs", to: `${orgBase}/labs`, icon: FlaskConical, end: !isOrgAdmin },
    ...(isOrgAdmin
      ? [
          { label: "Users", to: `${orgBase}/users`, icon: Users },
          { label: "Organization", to: `${orgBase}/organization`, icon: Settings },
          {
            label: "Subscriptions",
            to: `${orgBase}/organization/transactions`,
            icon: CreditCard,
          },
        ]
      : []),
    ...(isOrgAdmin || can(P.REPORTS_READ)
      ? [{ label: "Reports", to: `${orgBase}/reports`, icon: BarChart3 }]
      : []),
    { label: "Join a lab", to: "/request_lab", icon: Plus },
    profileItem,
  ];
}
