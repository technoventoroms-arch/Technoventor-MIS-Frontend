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
import { mergeRolePermissions } from "./role-defaults";

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
  const isOrgAdmin = useIsOrgAdmin(orgId);
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [roleName, setRoleName] = useState("");
  const [canManageInventory, setCanManageInventory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!orgId || !labId) {
      setPermissions(new Set());
      setRoleName("");
      setCanManageInventory(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    void apiClient
      .get<{ error?: boolean; data?: LabPermissionsPayload }>(
        endpoints.labs.myPermissions(orgId, labId),
        { orgId }
      )
      .then((res) => {
        if (cancelled) return;
        const payload =
          res && typeof res === "object" && "data" in res && res.data
            ? res.data
            : (res as LabPermissionsPayload);
        const apiList = Array.isArray(payload?.permissions) ? payload.permissions : [];
        const role = String(payload?.role_name ?? "");
        const list = mergeRolePermissions(apiList, role);
        setPermissions(new Set(list));
        setRoleName(role);
        setCanManageInventory(Boolean(payload?.can_manage_inventory));
      })
      .catch(() => {
        if (!cancelled) {
          setPermissions(new Set());
          setRoleName("");
          setCanManageInventory(false);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orgId, labId]);

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
