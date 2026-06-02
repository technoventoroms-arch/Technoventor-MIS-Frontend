import { useMemo } from "react";

import { useCurrentUserProfile } from "./use-current-user-profile";
import { useOrganisationAccess } from "./use-organisation-access";

export function useIsOrgAdmin(orgId?: string): boolean {
  const { accountType, labRoles, uiContext } = useCurrentUserProfile();
  const { organisations } = useOrganisationAccess(Boolean(orgId));
  const isOwner = accountType === "organisation_owner";
  const canManageOrgSettings = uiContext.capabilities.can_manage_org_settings;

  return useMemo(() => {
    if (!orgId) {
      return isOwner || canManageOrgSettings;
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
}
