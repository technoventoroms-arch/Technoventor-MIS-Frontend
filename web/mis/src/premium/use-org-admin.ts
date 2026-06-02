import { useMemo } from "react";
import { useCurrentUserProfile } from "./use-current-user-profile";

export function useIsOrgAdmin(orgId?: string): boolean {
  const { accountType, labRoles } = useCurrentUserProfile();

  return useMemo(() => {
    if (accountType === "organisation_owner" && !orgId) {
      return true;
    }
    if (!orgId) return false;
    return (
      accountType === "organisation_owner" &&
      labRoles.some((role) => String(role.organisation_id) === String(orgId))
    );
  }, [accountType, labRoles, orgId]);
}
