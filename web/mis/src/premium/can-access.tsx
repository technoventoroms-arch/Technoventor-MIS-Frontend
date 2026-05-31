import type { ReactNode } from "react";

import { useLabPermissions } from "./lab-permissions";

export function CanAccess({
  permission,
  anyOf,
  children,
  fallback = null,
}: {
  permission?: string;
  anyOf?: string[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { can, canAny } = useLabPermissions();
  const allowed = permission ? can(permission) : anyOf ? canAny(...anyOf) : true;
  return allowed ? <>{children}</> : <>{fallback}</>;
}
