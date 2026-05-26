import ContinuePayment from "@/pages/continue-payment";
import { getOrganizationById } from "@/services/organization.service";
import { getActiveSubscription } from "@/services/payment.services";
import { Organization } from "@mono/shared_ui/interfaces/organization";
import {
  ActiveSubscription,
  Entitlement,
  QuotaUsage,
} from "@mono/shared_ui/interfaces/plans";
import { DataWithLoading } from "@mono/shared_ui/interfaces/utils";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { Loader } from "lucide-react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { toast } from "sonner";
import { useOrgContext } from "./organization-provider";
import { useUser } from "./user-info-provider";

const ActiveOrganizationContext = createContext<{
  currentSub: ActiveSubscription | null;
  activeOrganization: Organization | null;
  isOrgAdmin: boolean;
  limits: Record<Entitlement["resource_type"], QuotaUsage>;
  incrementLabCount: () => void;
}>({} as any);

export const useActiveOrganization = () =>
  useContext(ActiveOrganizationContext);

const ActiveOrganizationProvider = () => {
  const { user } = useUser();
  const { orgId } = useOrgContext();
  const [currentSub, setCurrentSub] = useState<ActiveSubscription | null>(null);
  const [activeOrganization, setActiveOrganization] = useState<
    DataWithLoading<Organization | null>
  >({
    data: null,
    loading: true,
  });
  const fetchCurrentSub = async (id: number) => {
    try {
      const res = await getActiveSubscription(id);
      if (!res.error) {
        setCurrentSub(res.data);
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
  };
  const getOrgInfo = async () => {
    setActiveOrganization({ data: null, loading: true });
    try {
      const res = await getOrganizationById(orgId);
      if (!res.error) {
        setActiveOrganization({
          data: res.data,
          loading: false,
        });
        fetchCurrentSub(res.data.id);
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
      setActiveOrganization({ data: null, loading: false });
    }
  };
  useEffect(() => {
    orgId && getOrgInfo();
  }, [orgId]);
  const isOrgAdmin = useMemo(() => {
    return !!(
      activeOrganization.data?.admin.identity_provider_id ==
        user?.identity_provider_id && user?.is_verified
    );
  }, [activeOrganization.data]);

  const limits = useMemo(() => {
    const ent =
      currentSub?.quota_usage?.reduce((acc, curr) => {
        acc[curr.resource_type as Entitlement["resource_type"]] = curr;
        return acc;
      }, {} as Record<Entitlement["resource_type"], QuotaUsage>) || {};
    return ent;
  }, [currentSub]);

  const incrementLabCount = () => {
    if (!currentSub) return;
    const updatedLimits = { ...currentSub };
    updatedLimits!.quota_usage =
      updatedLimits?.quota_usage?.map((limit) => {
        if (limit.resource_type === "LAB") {
          limit.used_quantity += 1;
        }
        return limit;
      }) || [];
    setCurrentSub(updatedLimits);
  };
  return (
    <ActiveOrganizationContext.Provider
      value={{
        currentSub,
        activeOrganization: activeOrganization.data,
        isOrgAdmin,
        limits: limits as any,
        incrementLabCount,
      }}
    >
      {!activeOrganization.loading &&
        activeOrganization.data &&
        !activeOrganization.data?.has_active_subscription && (
          <ContinuePayment
            showModal={!activeOrganization.data?.has_active_subscription}
          />
        )}

      {activeOrganization.loading ? (
        <Loader className="animate-spin" />
      ) : (
        <Outlet />
      )}
    </ActiveOrganizationContext.Provider>
  );
};

export default ActiveOrganizationProvider;
