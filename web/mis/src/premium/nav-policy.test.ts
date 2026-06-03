import { describe, expect, it } from "vitest";

import { buildMisNav } from "./nav-policy";

describe("buildMisNav", () => {
  const can = () => true;
  const canAny = () => true;

  it("keeps org essentials visible even when navigation_sections omit them", () => {
    const nav = buildMisNav({
      orgId: "12",
      isOrgAdmin: true,
      roleName: "",
      can,
      canAny,
      canManageInventory: true,
      navigationSections: ["dashboard", "labs", "profile"],
      capabilities: {
        can_manage_org_settings: true,
      },
    });

    expect(nav.map((item) => item.label)).toEqual([
      "My Organizations",
      "Dashboard",
      "Labs",
      "Organization Settings",
      "Profile",
    ]);
  });

  it("hides billing and org settings when capabilities are disabled", () => {
    const nav = buildMisNav({
      orgId: "12",
      isOrgAdmin: true,
      roleName: "",
      can,
      canAny,
      capabilities: {
        can_manage_org_settings: false,
        can_view_billing: false,
      },
    });

    const labels = nav.map((item) => item.label);
    expect(labels).not.toContain("Organization Settings");
    expect(labels).not.toContain("Billing");
  });

  it("maps backend member navigation_sections to Labs and Profile", () => {
    const nav = buildMisNav({
      orgId: "12",
      isOrgAdmin: false,
      roleName: "",
      can,
      canAny,
      navigationSections: ["overview", "my_labs", "bookings", "profile"],
    });

    const labels = nav.map((item) => item.label);
    expect(labels).toContain("Dashboard");
    expect(labels).toContain("Labs");
    expect(labels).toContain("Profile");
  });

  it("maps backend overview to Dashboard for org admins", () => {
    const nav = buildMisNav({
      orgId: "12",
      isOrgAdmin: true,
      roleName: "",
      can,
      canAny,
      navigationSections: ["overview", "labs", "members", "profile"],
      capabilities: {
        can_manage_org_settings: true,
      },
    });

    const labels = nav.map((item) => item.label);
    expect(labels).toContain("Dashboard");
    expect(labels).toContain("Labs");
    expect(labels).toContain("Users");
    expect(labels).toContain("Profile");
  });

  it("shows My Organizations at root when my_labs is allowed", () => {
    const nav = buildMisNav({
      isOrgAdmin: false,
      roleName: "",
      can,
      canAny,
      navigationSections: ["overview", "my_labs", "profile"],
    });

    const labels = nav.map((item) => item.label);
    expect(labels).toContain("My Organizations");
    expect(labels).toContain("Profile");
  });

  it("shows My Organizations and Organization Settings for org owners", () => {
    const nav = buildMisNav({
      orgId: "12",
      isOrgAdmin: true,
      roleName: "",
      can,
      canAny,
      navigationSections: [
        "organisations",
        "overview",
        "labs",
        "members",
        "organisation_settings",
        "billing",
        "profile",
      ],
      capabilities: {
        can_manage_org_settings: true,
        can_view_billing: true,
      },
    });

    const labels = nav.map((item) => item.label);
    expect(labels).toContain("My Organizations");
    expect(labels).toContain("Dashboard");
    expect(labels).toContain("Organization Settings");
    expect(labels).toContain("Billing");
  });

  it("includes Machines in lab-manager lab sidebar", () => {
    const nav = buildMisNav({
      orgId: "12",
      labId: "34",
      isOrgAdmin: false,
      roleName: "Lab Manager",
      can,
      canAny,
      canManageInventory: true,
    });

    const labels = nav.map((item) => item.label);
    expect(labels).toContain("Machines");
    expect(labels).toContain("Dashboard");
    expect(labels).toContain("Approvals");
  });
});
