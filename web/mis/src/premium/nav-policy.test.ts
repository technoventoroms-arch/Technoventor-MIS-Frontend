import { describe, expect, it } from "vitest";

import { buildMisNav } from "./nav-policy";

describe("buildMisNav", () => {
  const can = () => true;
  const canAny = () => true;

  it("gates nav using ui_context navigation_sections", () => {
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

    expect(nav.map((item) => item.label)).toEqual(["Dashboard", "Labs", "Profile"]);
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
    expect(labels).not.toContain("Organization");
    expect(labels).not.toContain("Billing");
  });
});
