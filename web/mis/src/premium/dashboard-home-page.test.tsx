import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DashboardHomePage } from "./pages";

vi.mock("./use-current-user-profile", () => ({
  useCurrentUserProfile: vi.fn(),
}));

import { useCurrentUserProfile } from "./use-current-user-profile";

describe("DashboardHomePage", () => {
  it("routes owner variant to owner dashboard", () => {
    vi.mocked(useCurrentUserProfile).mockReturnValue({
      profile: null,
      accountType: "organisation_owner",
      labRoles: [],
      uiContext: {
        primary_experience: "organisation_owner",
        dashboard_variant: "owner_dashboard",
        onboarding_state: {},
        capabilities: {
          can_create_organisation: true,
          can_manage_org_settings: true,
          can_invite_members: true,
          can_view_billing: true,
          can_manage_inventory_any_lab: false,
        },
        default_context: {
          default_organisation_id: 99,
          default_lab_id: null,
        },
        navigation_sections: [],
        badges: [],
      },
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<DashboardHomePage />} />
          <Route path="/99/dashboard" element={<div>Owner dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Owner dashboard")).toBeInTheDocument();
  });
});
