import { AllLabsSidebar } from "@/components/shared/all-labs-sidebar";
import { ILabType } from "@/interfaces/labs";
import { useOrgContext } from "@/providers/organization-provider";
import { getAllLabs } from "@/services/labs.service";
import {
  SidebarInset,
  SidebarProvider,
} from "@mono/shared_ui/components/ui/sidebar";
import { DataWithLoading } from "@mono/shared_ui/interfaces/utils";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { toast } from "sonner";

const OrganizationViewLayout = () => {
  const [labs, setLabs] = useState<DataWithLoading<ILabType[]>>({
    data: [],
    loading: false,
  });
  const { orgId } = useOrgContext();
  const getLabs = async (orgId: number) => {
    setLabs({ data: [], loading: true });
    try {
      const res = await getAllLabs(orgId);
      if (!res.error) {
        setLabs({ data: res?.data?.records || [], loading: false });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
      setLabs({ data: [], loading: false });
    }
  };

  useEffect(() => {
    if (orgId) {
      getLabs(orgId);
    }
  }, [orgId]);

  return (
    <SidebarProvider className="max-h-svh overflow-hidden">
      <AllLabsSidebar labCount={labs.data.length} />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default OrganizationViewLayout;
