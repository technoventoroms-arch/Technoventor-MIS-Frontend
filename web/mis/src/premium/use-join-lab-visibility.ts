import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { apiClient, endpoints } from "@mono/api_client";

import { useLabPermissions } from "./lab-permissions";
import { normalizeRoleKey } from "./role-defaults";
import { useIsOrgAdmin } from "./use-org-admin";
import { useOrganisationAccess } from "./use-organisation-access";

type PermissionsPayload = {
  role_name?: string;
  is_org_admin?: boolean;
};

/**
 * "Join a lab" is for students onboarding themselves.
 * Organisation admins and lab managers are invited or assigned — hide the flow.
 */
export function useJoinLabVisibility() {
  const { orgId, labId } = useParams();
  const { isOrgAdminSomewhere, organisations, isLoading: orgsLoading } = useOrganisationAccess(true);
  const isOrgAdmin = useIsOrgAdmin(orgId);
  const { roleName, isLoading: permsLoading } = useLabPermissions();
  const [isLabManagerSomewhere, setIsLabManagerSomewhere] = useState(false);
  const [probeDone, setProbeDone] = useState(false);

  const isLabManagerHere = normalizeRoleKey(roleName) === "lab manager";

  useEffect(() => {
    if (orgsLoading) return;

    if (isOrgAdminSomewhere || isOrgAdmin || isLabManagerHere) {
      setIsLabManagerSomewhere(false);
      setProbeDone(true);
      return;
    }

    if (organisations.length === 0) {
      setIsLabManagerSomewhere(false);
      setProbeDone(true);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        for (const org of organisations) {
          if (Boolean(org.is_admin)) continue;
          const labsPage = await apiClient.list<{ id: number }>(endpoints.labs.list(org.id), {
            orgId: org.id,
          });
          for (const lab of labsPage.results) {
            try {
              const res = await apiClient.get<{ error?: boolean; data?: PermissionsPayload }>(
                endpoints.labs.myPermissions(org.id, lab.id),
                { orgId: org.id }
              );
              const payload =
                res && typeof res === "object" && "data" in res && res.data
                  ? res.data
                  : (res as PermissionsPayload);
              if (payload?.is_org_admin) continue;
              if (normalizeRoleKey(String(payload?.role_name ?? "")) === "lab manager") {
                if (!cancelled) setIsLabManagerSomewhere(true);
                return;
              }
            } catch {
              /* not a member of this lab */
            }
          }
        }
        if (!cancelled) setIsLabManagerSomewhere(false);
      } finally {
        if (!cancelled) setProbeDone(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [organisations, orgsLoading, isOrgAdminSomewhere, isOrgAdmin, isLabManagerHere]);

  return useMemo(() => {
    const isLabManager = isLabManagerHere || isLabManagerSomewhere;
    const isLoading = orgsLoading || !probeDone || (Boolean(labId) && permsLoading);
    const showJoinLab =
      !isLoading && !isOrgAdminSomewhere && !isOrgAdmin && !isLabManager;
    return { showJoinLab, isLoading, isLabManager, isOrgAdmin: isOrgAdmin || isOrgAdminSomewhere };
  }, [
    isLabManagerHere,
    isLabManagerSomewhere,
    isOrgAdmin,
    isOrgAdminSomewhere,
    labId,
    orgsLoading,
    permsLoading,
    probeDone,
  ]);
}
