import { useMemo } from "react";

import { useCurrentUserProfile } from "./use-current-user-profile";
import { useOrganisationAccess } from "./use-organisation-access";

/** Org ids in routes are numeric primary keys (e.g. `/12/settings`). */
export function isNumericOrgId(orgId: string | undefined): boolean {
  return Boolean(orgId && /^\d+$/.test(orgId));
}

export function useOrgAdminAccess(orgId?: string) {
  const { accountType, labRoles, uiContext } = useCurrentUserProfile();
  const { organisations, isLoading } = useOrganisationAccess(Boolean(orgId));
  const isOwner = accountType === "organisation_owner";
  const canManageOrgSettings = uiContext.capabilities.can_manage_org_settings;

  const isOrgAdmin = useMemo(() => {
    if (!orgId) {
      return isOwner || canManageOrgSettings;
    }

    if (!isNumericOrgId(orgId)) {
      return false;
    }

    const isAdminOfOrg = organisations.some(
      (row) => String(row.id) === String(orgId) && Boolean(row.is_admin)
    );
    if (isAdminOfOrg) {
      return true;
    }

    if (isOwner && labRoles.some((role) => String(role.organisation_id) === String(orgId))) {
      return true;
    }

    return false;
  }, [canManageOrgSettings, isOwner, labRoles, orgId, organisations]);

  return {
    isOrgAdmin,
    isLoading: Boolean(orgId) && isLoading,
  };
}

export function useIsOrgAdmin(orgId?: string): boolean {
  return useOrgAdminAccess(orgId).isOrgAdmin;
}
