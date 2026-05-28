import { getLabById } from "@/services/labs.service";
import { Skeleton } from "@mono/shared_ui/components/ui/skeleton";
import { DataWithLoading } from "@mono/shared_ui/interfaces/utils";
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
import { ILabType } from "@/interfaces/labs";
import paramStore from "@/store/params-store";
import { routeConstants } from "@/constants/route.constants";

type LabContextType = {
  labData: ILabType | null;
  loading: boolean;
  updateLab: (data: ILabType) => void;
  baseUrl: string;
};
const LabContext = createContext<LabContextType>({} as any);

export const useLabContext = () => useContext(LabContext);

const LabContextProvider = ({ children }: PropsWithChildren) => {
  const { orgId } = useOrgContext();
  const [lab, setLab] = useState<DataWithLoading<ILabType | null>>({
    data: null,
    loading: true,
  });
  const params = useParams();
  const labId = Number.parseInt(params.labId || "") || 0;
  const fetchLabById = async (id: number) => {
    if (!id) return;
    setLab({ data: null, loading: true });
    try {
      const res = await getLabById(id, orgId);
      if (!res.error) {
        setLab({
          data: { ...res.data, address_2: res.data.address_2 || "" },
          loading: false,
        });
      }
    } catch (error: any) {
      setLab(() => ({ data: null, loading: false }));
      toast.error(error.resposnse.data || "Something went wrong");
    }
  };
  const updateLab = (lab: ILabType) => {
    setLab({ data: lab, loading: false });
  };
  useEffect(() => {
    fetchLabById(labId);
    paramStore.setLabId(labId);
    paramStore.setOrgId(orgId);
  }, [params.labId]);
  const baseUrl = `${orgId}/${routeConstants.LAB}/${labId}`;

  if (lab.loading) {
    return <Skeleton className="h-screen w-screen" />;
  }
  return (
    <LabContext.Provider
      value={{ labData: lab.data, loading: lab.loading, updateLab, baseUrl }}
    >
      {children}
    </LabContext.Provider>
  );
};
export default LabContextProvider;
