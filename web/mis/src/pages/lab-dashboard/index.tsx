import { getLabDashboardUrl } from "@/services/metabse.service";
import { SiteHeader } from "@mono/shared_ui/components/shared/site-header";
import { Skeleton } from "@mono/shared_ui/components/ui/skeleton";
import { useLoading } from "@mono/shared_ui/hooks/use-loading";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";
const LabDashBoardPage = () => {
  const { loading, hideLoading, showLoading } = useLoading();
  const [state, setState] = useState("");

  const fetchLabDashUrl = async () => {
    showLoading();
    try {
      const res = await getLabDashboardUrl();
      if (!res.error) {
        setState(`${res.data}`);
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      hideLoading();
    }
  };
  useEffect(() => {
    fetchLabDashUrl();
  }, []);
  return (
    <>
      <SiteHeader title="Lab Dashboard" />
      <div className="@container/main bg-slate-50 dark:bg-transparent flex flex-1 overflow-hidden ">
        <div className="h-full max-w-7xl gap-2 w-full overflow-auto p-2">
          {loading ? (
            <Skeleton className="w-full h-full" />
          ) : (
            state && <iframe src={`${state}`} className="w-full h-full" />
          )}
        </div>
      </div>
    </>
  );
};

export default LabDashBoardPage;
