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

type LabPermissionsPayload = {
  permissions: string[];
  role_name: string;
  is_org_admin: boolean;
};

type LabPermissionsContextValue = {
  permissions: Set<string>;
  roleName: string;
  isOrgAdmin: boolean;
  isLoading: boolean;
  can: (codename: string) => boolean;
  canAny: (...codenames: string[]) => boolean;
};

const LabPermissionsContext = createContext<LabPermissionsContextValue>({
  permissions: new Set(),
  roleName: "",
  isOrgAdmin: false,
  isLoading: false,
  can: () => false,
  canAny: () => false,
});

export function LabPermissionsProvider({ children }: { children: ReactNode }) {
  const { orgId, labId } = useParams();
  const isOrgAdmin = useIsOrgAdmin(orgId);
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [roleName, setRoleName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!orgId || !labId) {
      setPermissions(new Set());
      setRoleName("");
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
        const list = Array.isArray(payload?.permissions) ? payload.permissions : [];
        setPermissions(new Set(list));
        setRoleName(String(payload?.role_name ?? ""));
      })
      .catch(() => {
        if (!cancelled) {
          setPermissions(new Set());
          setRoleName("");
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

  const value = useMemo(
    () => ({
      permissions,
      roleName,
      isOrgAdmin,
      isLoading,
      can,
      canAny,
    }),
    [can, canAny, isLoading, isOrgAdmin, permissions, roleName]
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
