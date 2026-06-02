import { describe, expect, it } from "vitest";

import { profileToUIContext } from "./profile-to-ui-context";

describe("profileToUIContext", () => {
  it("maps owner accounts to owner dashboard by default", () => {
    const context = profileToUIContext({
      id: 1,
      email: "owner@example.com",
      account_type: "organisation_owner",
      lab_roles: [],
    });

    expect(context.dashboard_variant).toBe("owner_dashboard");
    expect(context.primary_experience).toBe("organisation_owner");
  });

  it("derives lab-specific inventory capability from lab_roles", () => {
    const context = profileToUIContext({
      id: 2,
      email: "member@example.com",
      account_type: "member",
      lab_roles: [
        {
          lab_id: 9,
          lab_name: "Lab A",
          organisation_id: 2,
          organisation_name: "Org A",
          role_id: 4,
          role_name: "Lab Manager",
          can_manage_inventory: true,
        },
      ],
    });

    expect(context.capabilities.can_manage_inventory_any_lab).toBe(true);
  });
});
