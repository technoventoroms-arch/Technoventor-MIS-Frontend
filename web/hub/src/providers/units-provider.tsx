import { IUnit } from "@/interfaces/inventory";
import { getInvUnits } from "@/services/inventory.service";
import { DataWithLoading } from "@mono/shared_ui/interfaces/utils";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { useLabContext } from "./lab-provider";

type SearchParams = {
  searchQuery?: string;
};

type UnitsContextType = {
  units: DataWithLoading<IUnit[]>;
  getUnitsList: (param: SearchParams) => Promise<void>;
  updateUnitsList: (param: DataWithLoading<IUnit[]>) => void;
};
const UnitsContext = createContext({} as UnitsContextType);

export const UnitsProvider = ({ children }: PropsWithChildren) => {
  const { labData } = useLabContext();
  const [units, setUnits] = useState<DataWithLoading<IUnit[]>>({
    data: [],
    loading: false,
  });
  const fetchUnitsList = async (param: SearchParams) => {
    let res: IUnit[] = [];
    try {
      const data = await getInvUnits(param);
      if (!data.error) {
        res = data.data as any;
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    }
    return res;
  };

  const getUnitsList = async (param: SearchParams) => {
    setUnits({ data: [], loading: true });
    const data = await fetchUnitsList(param);
    setUnits({ data: data || [], loading: false });
  };

  useEffect(() => {
    if (labData?.lab_id) {
      getUnitsList({
        searchQuery: "",
      });
    }
  }, [labData?.lab_id]);
  const updateUnitsList = (param: DataWithLoading<IUnit[]>) => {
    setUnits((prev) => ({
      ...prev,
      ...param,
    }));
  };
  return (
    <UnitsContext.Provider value={{ units, getUnitsList, updateUnitsList }}>
      {children}
    </UnitsContext.Provider>
  );
};

export const useUnitsProvider = () => useContext(UnitsContext);
