import { PERMISSIONS } from "@mono/shared_ui/interfaces/permissions";
import { PropsWithChildren } from "react";

type Props = {
  action: (a: typeof PERMISSIONS) => string | string[];
};

const AccessibleRoute = ({
  // action,
  children,
}: PropsWithChildren<Props>) => {
  // const isAllowed = useMemo(() => {
  //   const actions = action(PERMISSIONS);
  //   if (Array.isArray(actions)) {
  //     return actions.some((action) => useCanIUse(action));
  //   }
  //   return useCanIUse(actions);
  // }, []);
  // if (!isAllowed) {
  //   return <Navigate to={`/${routeConstants.UNAUTHORIZED}`} />;
  // }
  return children;
};

export default AccessibleRoute;
