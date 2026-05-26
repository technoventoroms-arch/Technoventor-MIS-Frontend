import { routeConstants } from "@/constants/route.constants";
import { fetchAllOrganization } from "@/services/organization.service";
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
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useUser } from "./user-info-provider";

type OrganizationContextType = {
  organizationData: Organization[] | null;
  loading: boolean;
  updateOrganization: (data: Organization) => void;

  orgId: number;
  addOrganization: (data: Organization) => void;
  fetchOrganizations: () => Promise<void>;
};
const OrgContext = createContext<OrganizationContextType>({} as any);

export const useOrgContext = () => useContext(OrgContext);

const OrgContextProvider = ({ children }: PropsWithChildren) => {
  const { user } = useUser();
  const params = useParams();
  const location = useLocation();
  const orgId = Math.abs(Number.parseInt(params.orgId || ""));
  const navigate = useNavigate();
  const ref = useRef(true);
  const [organizations, setOrganizations] = useState<
    DataWithLoading<Organization[] | null>
  >({
    data: null,
    loading: true,
  });

  const fetchOrganizations = async () => {
    setOrganizations({ data: null, loading: true });
    try {
      const res = await fetchAllOrganization();
      if (!res.error) {
        setOrganizations({
          data: res?.data || [],
          loading: false,
        });

        if (
          !orgId &&
          !location.pathname.includes(routeConstants.PROFILE) &&
          !location.pathname.includes(routeConstants.UNAUTHORIZED)
        ) {
          if (res.data?.length == 1) {
            navigate(`/${res.data[0].id}`);
            return;
          }
          navigate("/");
        }
      }
    } catch (error: any) {
      setOrganizations({ data: null, loading: false });
      toast.error("Something went wrong");
    }
  };
  const updateOrganization = (data: Organization) => {
    setOrganizations({
      data: organizations.data?.map((i) => (i.id == data.id ? data : i)) || [],
      loading: false,
    });
  };
  useEffect(() => {
    if (user && organizations.data === null && ref.current) {
      ref.current = false;
      fetchOrganizations();
    }
  }, [user]);

  const addOrganization = (org: Organization) => {
    setOrganizations({
      ...organizations,
      data: [...(organizations.data || []), org],
    });
  };
  return (
    <OrgContext.Provider
      value={{
        organizationData: organizations.data,
        loading: organizations.loading,
        updateOrganization,
        orgId,
        addOrganization,
        fetchOrganizations,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
};
export default OrgContextProvider;
