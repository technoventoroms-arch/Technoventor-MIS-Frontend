import { useLabContext } from "@/providers/lab-provider";
import { useUser } from "@/providers/user-info-provider";
import { PERMISSIONS } from "@mono/shared_ui/interfaces/permissions";
import { PropsWithChildren } from "react";
type Props = {
  action: (a: typeof PERMISSIONS) => string;
};

export const useCanIUse = (action: string) => {
  const { permissions, labData } = useLabContext();
  const { user } = useUser();
  return labData?.is_active && user?.is_verified
    ? !!permissions?.has(action)
    : false;
};

const CanIUse = ({ action, children }: PropsWithChildren<Props>) => {
  const isAllowed = useCanIUse(action(PERMISSIONS));
  return isAllowed ? children : null;
};

export default CanIUse;
