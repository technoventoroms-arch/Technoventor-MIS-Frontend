export type AccountType = "member" | "organisation_owner";

export type DashboardVariant = "member_dashboard" | "owner_dashboard";

export type SignupType = "member" | "organisation";

export type ProfileLabRole = {
  lab_id: number;
  lab_name: string;
  organisation_id: number;
  organisation_name: string;
  role_id: number;
  role_name: string;
  can_manage_inventory: boolean;
};

export type UiContextCapabilities = {
  can_create_organisation: boolean;
  can_manage_org_settings: boolean;
  can_invite_members: boolean;
  can_view_billing: boolean;
  can_manage_inventory_any_lab: boolean;
};

export type UiContextDefaultContext = {
  default_organisation_id: number | null;
  default_lab_id: number | null;
};

export type MemberOnboardingState = {
  joined_organisations_count?: number;
  pending_invites_count?: number;
};

export type OwnerOnboardingState = {
  organisation_created?: boolean;
  labs_count?: number;
};

export type UiContext = {
  primary_experience: "member" | "organisation_owner";
  dashboard_variant: DashboardVariant;
  onboarding_state: MemberOnboardingState | OwnerOnboardingState;
  capabilities: UiContextCapabilities;
  default_context: UiContextDefaultContext;
  navigation_sections: string[];
  badges: string[];
};

export type CurrentUserProfile = {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  account_type?: AccountType;
  can_create_organisation?: boolean;
  lab_roles?: ProfileLabRole[];
  ui_context?: Partial<UiContext>;
  [key: string]: unknown;
};

export const NAV_SECTION_TO_LABEL: Record<string, string> = {
  dashboard: "Dashboard",
  overview: "Dashboard",
  organisations: "My Organizations",
  my_labs: "Labs",
  organisation_settings: "Organization Settings",
  members: "Users",
  labs: "Labs",
  billing: "Billing",
  bookings: "Booking calendar",
  reports: "Reports",
  inventory: "Inventory",
  machines: "Machines",
  projects: "Projects",
  attendance: "Attendance",
  approvals: "Approvals",
  notifications: "Notifications",
  profile: "Profile",
  create_organisation: "Create organisation",
  join_lab: "Join a lab",
};

/** Extra nav labels matched when filtering by backend section keys. */
export const NAV_SECTION_EXTRA_LABELS: Record<string, string[]> = {
  my_labs: ["My Organizations"],
  overview: ["My Organizations"],
};

const DEFAULT_CAPABILITIES: UiContextCapabilities = {
  can_create_organisation: false,
  can_manage_org_settings: false,
  can_invite_members: false,
  can_view_billing: false,
  can_manage_inventory_any_lab: false,
};

const DEFAULT_CONTEXT: UiContextDefaultContext = {
  default_organisation_id: null,
  default_lab_id: null,
};

export function profileToUIContext(profile: CurrentUserProfile | null): UiContext {
  const accountType = profile?.account_type ?? "member";
  const experience = accountType === "organisation_owner" ? "organisation_owner" : "member";
  const dashboardVariant: DashboardVariant =
    experience === "organisation_owner" ? "owner_dashboard" : "member_dashboard";
  const source = profile?.ui_context;

  return {
    primary_experience: source?.primary_experience ?? experience,
    dashboard_variant: source?.dashboard_variant ?? dashboardVariant,
    onboarding_state: source?.onboarding_state ?? {},
    capabilities: {
      ...DEFAULT_CAPABILITIES,
      ...source?.capabilities,
      can_create_organisation:
        source?.capabilities?.can_create_organisation ?? Boolean(profile?.can_create_organisation),
      can_manage_inventory_any_lab:
        source?.capabilities?.can_manage_inventory_any_lab ??
        Boolean(profile?.lab_roles?.some((role) => role.can_manage_inventory)),
    },
    default_context: {
      ...DEFAULT_CONTEXT,
      ...source?.default_context,
    },
    navigation_sections: source?.navigation_sections ?? [],
    badges: source?.badges ?? [],
  };
}
