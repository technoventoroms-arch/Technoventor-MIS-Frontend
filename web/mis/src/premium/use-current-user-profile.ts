import { useMemo } from "react";

import { useAuth } from "./auth";
import { profileToUIContext, type CurrentUserProfile } from "./profile-to-ui-context";

export function useCurrentUserProfile() {
  const auth = useAuth() as { profile?: CurrentUserProfile | null; user?: CurrentUserProfile | null };
  const profile = auth.profile ?? auth.user ?? null;
  const uiContext = useMemo(() => profileToUIContext(profile), [profile]);

  return {
    profile,
    uiContext,
    labRoles: profile?.lab_roles ?? [],
    accountType: profile?.account_type ?? "member",
  };
}
