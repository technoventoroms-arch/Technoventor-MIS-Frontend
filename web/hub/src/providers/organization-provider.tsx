import { Organization } from "@mono/shared_ui/interfaces/organization";
import { DataWithLoading } from "@mono/shared_ui/interfaces/utils";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useUser } from "./user-info-provider";
import { fetchAllOrganizationById } from "@/services/organization.service";

type OrganizationContextType = {
  loading: boolean;
  activeOrganization: Organization | null;
  orgId: number;
};
const OrgContext = createContext<OrganizationContextType>({} as any);

export const useOrgContext = () => useContext(OrgContext);

const OrgContextProvider = ({ children }: PropsWithChildren) => {
  const { user } = useUser();
  const params = useParams();
  const orgId = Math.abs(Number.parseInt(params.orgId || ""));
  const navigate = useNavigate();
  const ref = useRef(true);
  const [activeOrganization, setActiveOrganization] = useState<
    DataWithLoading<Organization | null>
  >({
    data: null,
    loading: true,
  });

  const fetchOrganizationById = async () => {
    setActiveOrganization({ data: null, loading: true });
    try {
      const res = await fetchAllOrganizationById(orgId);
      if (!res.error) {
        setActiveOrganization({
          data: res.data,
          loading: false,
        });
        if (!orgId) {
          navigate("/");
        }
      }
    } catch (error: any) {
      setActiveOrganization({ data: null, loading: false });
      toast.error(error.response.data || "Something went wrong");
    }
  };

  useEffect(() => {
    if (user && activeOrganization.data === null && ref.current) {
      ref.current = false;
      fetchOrganizationById();
    }
  }, [user]);

  return (
    <OrgContext.Provider
      value={{
        loading: activeOrganization.loading,
        activeOrganization: activeOrganization.data,
        orgId,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
};
export default OrgContextProvider;
