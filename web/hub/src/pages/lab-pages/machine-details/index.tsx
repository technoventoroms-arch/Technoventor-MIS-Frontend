import { routeConstants } from "@/constants/route.constants";
import { IMachine, MachineSpecs } from "@/interfaces/machines";
import { useLabContext } from "@/providers/lab-provider";
import { getMachineById, getMachineSpecs } from "@/services/machine.service";
import { SiteHeader } from "@mono/shared_ui/components/shared/site-header";
import { useLoading } from "@mono/shared_ui/hooks/use-loading";
import { DataWithLoading } from "@mono/shared_ui/interfaces/utils";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { editMachineSchema } from "../manage-machine/components/machine-form/scheme";
import SpecsTab from "./components/specs-tab";
import ViewMachineInfo from "./components/view-machine-info";

export type EditMachineFormType = z.infer<typeof editMachineSchema>;

const MachineDetails = () => {
  const { labData, baseUrl } = useLabContext();
  const param = useParams();
  const _machineId = Math.abs(Number.parseInt(param.machineId || ""));
  const { loading, hideLoading, showLoading } = useLoading();
  const [machineDetail, setMachineDetail] = useState<IMachine | null>(null);
  const [machineSpecs, setMachineSpecs] = useState<
    DataWithLoading<MachineSpecs[]>
  >({
    data: [],
    loading,
  });

  const getMachineSpecsList = async () => {
    setMachineSpecs({ data: [], loading: true });
    try {
      const res = await getMachineSpecs(_machineId, {});
      if (!res.error) {
        setMachineSpecs({ data: res.data || [], loading: false });
      }
    } catch (error) {
      setMachineSpecs({ data: [], loading: true });
    }
  };

  const getMachineDetails = async (machineId: number) => {
    let machine: IMachine | null = null;
    try {
      const res = await getMachineById(machineId);
      if (!res.error) {
        machine = res.data;
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
    return machine;
  };
  const getDetails = async () => {
    showLoading();
    const data = await getMachineDetails(_machineId);
    setMachineDetail(data);
    hideLoading();
  };

  useEffect(() => {
    if (labData?.lab_id) {
      getDetails();
      getMachineSpecsList();
    }
  }, [labData?.lab_id]);

  return (
    <>
      <SiteHeader
        title="Machine Details"
        breadCrumbs={[
          {
            title: "Machines",
            url: `/${baseUrl}/${routeConstants.MACHINES}`,
          },
          {
            loading: loading && !machineDetail,
            title: machineDetail?.name,
            url: "#",
          },
        ]}
      />
      <div className="@container/main bg-slate-50 dark:bg-transparent flex flex-1 overflow-hidden ">
        <div className="h-full max-w-7xl  static grid grid-cols-10 gap-2 w-full overflow-auto">
          <main className="col-span-10 lg:col-span-10 border border-transparent ">
            <ViewMachineInfo machineDetails={machineDetail} />

            <div className=" p-4">
              <SpecsTab
                loading={machineSpecs.loading}
                specs={machineSpecs.data}
                machineId={_machineId}
              />
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default MachineDetails;
