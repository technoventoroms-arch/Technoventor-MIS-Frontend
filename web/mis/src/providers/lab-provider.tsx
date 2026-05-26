import { routeConstants } from "@/constants/route.constants";
import { ILabType } from "@/interfaces/labs";
import { getLabById, getLabPermissions } from "@/services/labs.service";
import paramStore from "@/store/params-store";
import { Skeleton } from "@mono/shared_ui/components/ui/skeleton";
import { useLoading } from "@mono/shared_ui/hooks/use-loading";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { useOrgContext } from "./organization-provider";

type LabContextType = {
  labData: ILabType | null;
  loading: boolean;
  updateLab: (data: ILabType) => void;
  labId: number;
  baseUrl: string;
  permissions: Set<string> | null;
  isLabActive: boolean;
};
const LabContext = createContext<LabContextType>({} as any);

export const useLabContext = () => useContext(LabContext);

const LabContextProvider = ({ children }: PropsWithChildren) => {
  const { hideLoading, loading, showLoading } = useLoading();
  const params = useParams();
  const labId = Math.abs(Number.parseInt(params.labId || ""));
  const [permissions, setPermissions] = useState<Set<string> | null>(null);
  const { orgId } = useOrgContext();
  const [lab, setLab] = useState<ILabType | null>(null);

  const fetchLabById = async (id: number) => {
    if (!id) return;
    showLoading();
    try {
      const prms = await Promise.allSettled([
        getLabPermissions(orgId, labId),
        getLabById(orgId, labId),
      ]);
      if (prms[0].status === "fulfilled" && !prms[0]!.value!.error) {
        setPermissions(
          new Set(prms[0]!.value!.data.map((i) => i.permission_name) || [])
        );
      } else {
        throw prms[0].status;
      }
      if (prms[1].status === "fulfilled" && !prms[1]!.value!.error) {
        setLab(prms[1]!.value!.data);
      } else {
        throw prms[1].status;
      }
    } catch (error: any) {
      toast.error(error.resposnse.data || "Something went wrong");
    } finally {
      hideLoading();
    }
  };
  const updateLab = (lab: ILabType) => {
    setLab(lab);
  };
  useEffect(() => {
    if (labId && orgId) {
      paramStore.setLabId(labId);
      paramStore.setOrgId(orgId);
      fetchLabById(labId);
    }
  }, [labId, orgId]);
  const baseUrl = `${orgId}/${routeConstants.LAB}/${labId}`;

  const isLabActive = !!lab?.is_active;
  return (
    <LabContext.Provider
      value={{
        labData: lab,
        loading: loading,
        updateLab,
        labId,
        baseUrl,
        permissions,
        isLabActive,
      }}
    >
      {lab ? (
        children
      ) : (
        <div className="h-screen w-screen p-4 grid grid-cols-4 gap-4">
          <Skeleton className="h-full w-full col-span-1" />
          <div className="col-span-3 h-full flex flex-col gap-4">
            <Skeleton className="h-20 " />
            <Skeleton className="flex-1 " />
          </div>
        </div>
      )}
    </LabContext.Provider>
  );
};
export default LabContextProvider;
