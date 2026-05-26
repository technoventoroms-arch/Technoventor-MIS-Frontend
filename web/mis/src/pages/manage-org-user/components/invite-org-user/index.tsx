import InviteUser, { InviteUserProps } from "@/components/shared/invite-user";
import { ILabType } from "@/interfaces/labs";
import { getAllLabs } from "@/services/labs.service";
import { DataWithLoading } from "@mono/shared_ui/interfaces/utils";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = Pick<
  InviteUserProps,
  "handleClose" | "handleSubmit" | "loading" | "orgId"
>;
const InviteOrgUser = ({ orgId, ...props }: Props) => {
  const [labs, setLabs] = useState<DataWithLoading<ILabType[]>>({
    data: [],
    loading: false,
  });

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
  return <InviteUser {...props} labs={labs} orgId={orgId} />;
};

export default InviteOrgUser;
