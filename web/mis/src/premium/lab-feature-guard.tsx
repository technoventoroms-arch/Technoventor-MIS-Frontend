import type { ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";

import { useLabPermissions } from "./lab-permissions";
import { P } from "./permission-codes";

/** Blocks non-admins from commerce routes (project orders). */
export function RequireLabFeature({
  feature,
  children,
}: {
  feature: "projects-order";
  children: ReactNode;
}) {
  const { orgId, labId } = useParams();
  const { can } = useLabPermissions();
  const allowed = feature === "projects-order" ? can(P.PROJECTS_ORDER) : false;

  if (!allowed) {
    const fallback = orgId && labId ? `/${orgId}/lab/${labId}` : "/";
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
