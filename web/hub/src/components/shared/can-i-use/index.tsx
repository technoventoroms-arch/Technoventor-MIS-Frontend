import { useUser } from "@/providers/user-info-provider";
import { PERMISSIONS } from "@mono/shared_ui/interfaces/permissions";
import { PropsWithChildren } from "react";
type Props = {
  action: (a: typeof PERMISSIONS) => string;
};

export const useCanIUse = (action: string) => {
  const { permissions } = useUser();
  return permissions.has(action);
};

const CanIUse = ({ action, children }: PropsWithChildren<Props>) => {
  const isAllowed = useCanIUse(action(PERMISSIONS));
  return isAllowed ? children : null;
};

export default CanIUse;
