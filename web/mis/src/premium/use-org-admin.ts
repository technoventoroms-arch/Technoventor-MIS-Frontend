import { useMemo } from "react";

import { endpoints, type Entity } from "@mono/api_client";

import { useAuth } from "./auth";
import { usePagedResource } from "./api-hooks";

type OrgMember = Entity & {
  user?: { id?: number | string };
  is_admin?: boolean;
};

export function useIsOrgAdmin(orgId?: string): boolean {
  const { user } = useAuth();
  const members = usePagedResource<OrgMember>(
    orgId ? endpoints.organisations.members(orgId) : null,
    orgId
  );

  return useMemo(() => {
    const member = members.rows.find((row) => Number(row.user?.id ?? row.id) === user?.id);
    return Boolean(member?.is_admin);
  }, [members.rows, user?.id]);
}
