import { getActiveSubscription } from "@/services/payment.services";
import { ActiveSubscription } from "@mono/shared_ui/interfaces/plans";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { Loader } from "lucide-react";
import { createContext, useContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { toast } from "sonner";
import { useOrgContext } from "./organization-provider";

const ActiveOrganizationContext = createContext<{
  currentSub: ActiveSubscription | null;
}>({} as any);

export const useActiveOrganization = () =>
  useContext(ActiveOrganizationContext);

const ActiveOrganizationProvider = () => {
  const { activeOrganization, loading } = useOrgContext();
  const [currentSub, setCurrentSub] = useState<ActiveSubscription | null>(null);

  const fetchCurrentSub = async () => {
    try {
      const res = await getActiveSubscription(activeOrganization!.id);
      if (!res.error) {
        setCurrentSub(res.data);
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
  };
  useEffect(() => {
    activeOrganization && fetchCurrentSub();
  }, [activeOrganization]);

  return (
    <ActiveOrganizationContext.Provider value={{ currentSub }}>
      {loading ? <Loader className="animate-spin" /> : <Outlet />}
    </ActiveOrganizationContext.Provider>
  );
};

export default ActiveOrganizationProvider;
