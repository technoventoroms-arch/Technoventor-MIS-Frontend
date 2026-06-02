import { useMemo } from "react";

import { useAuth } from "./auth";
import { profileToUIContext } from "./profile-to-ui-context";

export function useCurrentUserProfile() {
  const { profile } = useAuth();
  const uiContext = useMemo(() => profileToUIContext(profile), [profile]);

  return {
    profile,
    uiContext,
    labRoles: profile?.lab_roles ?? [],
    accountType: profile?.account_type ?? "member",
  };
}
