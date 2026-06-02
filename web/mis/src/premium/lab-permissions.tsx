import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useParams } from "react-router-dom";

import { apiClient, endpoints } from "@mono/api_client";

import { useIsOrgAdmin } from "./use-org-admin";
import { mergeRolePermissions, normalizeRoleKey } from "./role-defaults";
import { useCurrentUserProfile } from "./use-current-user-profile";

type LabPermissionsPayload = {
  permissions: string[];
  role_name: string;
  is_org_admin: boolean;
  can_manage_inventory?: boolean;
};

type LabPermissionsContextValue = {
  permissions: Set<string>;
  roleName: string;
  isOrgAdmin: boolean;
  canManageInventory: boolean;
  isLoading: boolean;
  can: (codename: string) => boolean;
  canAny: (...codenames: string[]) => boolean;
};

const LabPermissionsContext = createContext<LabPermissionsContextValue>({
  permissions: new Set(),
  roleName: "",
  isOrgAdmin: false,
  canManageInventory: false,
  isLoading: false,
  can: () => false,
  canAny: () => false,
});

export function LabPermissionsProvider({ children }: { children: ReactNode }) {
  const { orgId, labId } = useParams();
  const { labRoles, uiContext } = useCurrentUserProfile();
  const isOrgAdminFromMembership = useIsOrgAdmin(orgId);
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [isOrgAdminFromLab, setIsOrgAdminFromLab] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [canManageInventory, setCanManageInventory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!orgId || !labId) {
      setPermissions(new Set());
      setRoleName("");
      setCanManageInventory(false);
      setIsOrgAdminFromLab(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    void apiClient
      .get<{ error?: boolean; data?: LabPermissionsPayload }>(endpoints.labs.myPermissions(orgId, labId), {
        orgId,
      })
      .then((permRes) => {
        if (cancelled) return;
        const payload =
          permRes && typeof permRes === "object" && "data" in permRes && permRes.data
            ? permRes.data
            : (permRes as LabPermissionsPayload);
        const apiList = Array.isArray(payload?.permissions) ? payload.permissions : [];
        const role = String(payload?.role_name ?? "");
        const activeLabRole = labRoles.find((row) => String(row.lab_id) === String(labId));
        const fromProfile = Boolean(activeLabRole?.can_manage_inventory);
        const inventoryGranted =
          Boolean(payload?.can_manage_inventory) ||
          fromProfile ||
          Boolean(uiContext.capabilities.can_manage_inventory_any_lab) ||
          (normalizeRoleKey(role) === "lab manager" &&
            apiList.includes("inventory:write"));
        const list = mergeRolePermissions(apiList, role, {
          canManageInventory: inventoryGranted,
        });
        setPermissions(new Set(list));
        setRoleName(role);
        setCanManageInventory(inventoryGranted);
        setIsOrgAdminFromLab(Boolean(payload?.is_org_admin));
      })
      .catch(() => {
        if (!cancelled) {
          const activeLabRole = labRoles.find((row) => String(row.lab_id) === String(labId));
          const fallbackRole = String(activeLabRole?.role_name ?? "");
          const fallbackInventory =
            Boolean(activeLabRole?.can_manage_inventory) ||
            Boolean(uiContext.capabilities.can_manage_inventory_any_lab);
          const fallbackList = mergeRolePermissions([], fallbackRole, {
            canManageInventory: fallbackInventory,
          });
          setPermissions(new Set(fallbackList));
          setRoleName(fallbackRole);
          setCanManageInventory(fallbackInventory);
          setIsOrgAdminFromLab(false);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [labId, labRoles, orgId, uiContext.capabilities.can_manage_inventory_any_lab]);

  const isOrgAdmin = isOrgAdminFromMembership || isOrgAdminFromLab;

  const can = useCallback(
    (codename: string) => isOrgAdmin || permissions.has(codename),
    [isOrgAdmin, permissions]
  );

  const canAny = useCallback(
    (...codenames: string[]) =>
      isOrgAdmin || codenames.some((c) => permissions.has(c)),
    [isOrgAdmin, permissions]
  );

  const effectiveCanManageInventory = isOrgAdmin || canManageInventory;

  const value = useMemo(
    () => ({
      permissions,
      roleName,
      isOrgAdmin,
      canManageInventory: effectiveCanManageInventory,
      isLoading,
      can,
      canAny,
    }),
    [can, canAny, effectiveCanManageInventory, isLoading, isOrgAdmin, permissions, roleName]
  );

  return (
    <LabPermissionsContext.Provider value={value}>
      {children}
    </LabPermissionsContext.Provider>
  );
}

export function useLabPermissions() {
  return useContext(LabPermissionsContext);
}
