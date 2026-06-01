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

import { apiClient, endpoints, type Entity } from "@mono/api_client";

import { useAuth } from "./auth";
import { useIsOrgAdmin } from "./use-org-admin";
import { mergeRolePermissions, normalizeRoleKey } from "./role-defaults";

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

function readMembershipInventoryFlag(rows: Entity[], userId?: number): boolean {
  if (!userId) return false;
  const mine = rows.find((row) => Number((row.user as Entity | undefined)?.id ?? row.id) === userId);
  return Boolean(mine?.can_manage_inventory);
}

export function LabPermissionsProvider({ children }: { children: ReactNode }) {
  const { orgId, labId } = useParams();
  const { user } = useAuth();
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
    void Promise.all([
      apiClient.get<{ error?: boolean; data?: LabPermissionsPayload }>(
        endpoints.labs.myPermissions(orgId, labId),
        { orgId }
      ),
      apiClient.list<Entity>(endpoints.labs.members(orgId, labId), { orgId }).catch(() => ({
        results: [] as Entity[],
        next: null,
        previous: null,
      })),
    ])
      .then(([permRes, membersPage]) => {
        if (cancelled) return;
        const payload =
          permRes && typeof permRes === "object" && "data" in permRes && permRes.data
            ? permRes.data
            : (permRes as LabPermissionsPayload);
        const apiList = Array.isArray(payload?.permissions) ? payload.permissions : [];
        const role = String(payload?.role_name ?? "");
        const fromMembership = readMembershipInventoryFlag(membersPage.results, user?.id);
        const inventoryGranted =
          Boolean(payload?.can_manage_inventory) ||
          fromMembership ||
          (normalizeRoleKey(role) === "lab manager" &&
            apiList.includes("inventory:write"));
        const list = mergeRolePermissions(apiList, role, {
          canManageInventory: inventoryGranted,
        });
        setPermissions(new Set(list));
        setRoleName(role);
        setCanManageInventory(inventoryGranted);
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
  }, [orgId, labId, user?.id]);

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
