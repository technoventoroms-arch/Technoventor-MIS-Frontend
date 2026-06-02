import { useMemo } from "react";

import { endpoints, type Entity } from "@mono/api_client";

import { usePagedResource } from "./api-hooks";

type OrganisationRow = Entity & {
  is_admin?: boolean;
};

/**
 * Organisation list for the signed-in user.
 * Create organisation: only users who are already organisation admins.
 */
export function useOrganisationAccess(enabled = true) {
  const resource = usePagedResource<OrganisationRow>(
    enabled ? endpoints.organisations.list : null
  );

  return useMemo(() => {
    const count = resource.rows.length;
    const isOrgAdminSomewhere = resource.rows.some((row) => Boolean(row.is_admin));
    const canCreateOrganisation = enabled && !resource.isLoading && isOrgAdminSomewhere;
    return {
      organisations: resource.rows,
      organisationCount: count,
      isOrgAdminSomewhere,
      canCreateOrganisation,
      isLoading: resource.isLoading,
      resource,
    };
  }, [enabled, resource.isLoading, resource.rows]);
}
