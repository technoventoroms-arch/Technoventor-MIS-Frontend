import { projectRecentActivity } from "@/services/projects.service";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@mono/shared_ui/components/ui/avatar";
import { ScrollArea } from "@mono/shared_ui/components/ui/scroll-area";
import { ProjectEvent } from "@mono/shared_ui/interfaces/projects";
import { DataWithLoading } from "@mono/shared_ui/interfaces/utils";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  projectId: number;
  labId: number;
};

const RecentActivity = ({ projectId, labId }: Props) => {
  const [recentActivity, setRecentActivity] = useState<
    DataWithLoading<ProjectEvent[]>
  >({ data: [], loading: false });
  const getProjectActivity = async () => {
    setRecentActivity({ data: [], loading: true });

    try {
      const res = await projectRecentActivity(projectId);
      if (!res.error) {
        setRecentActivity({ data: res.data, loading: true });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
      setRecentActivity({ data: [], loading: false });
    }
  };
  useEffect(() => {
    if (labId) getProjectActivity();
  }, [labId]);

  return (
    <div className="h-[calc(100vh_-_80px)]">
      <div className="sticky top-0 font-semibold">Recent Activity</div>
      <ScrollArea className="w-full h-[calc(100vh_-_100px)] p-1">
        {recentActivity.data.map((i) => (
          <div className="p-2 border rounded my-4 text-sm shadow-xs flex items-start gap-2">
            <span className="flex gap-2 items-center">
              <Avatar className="size-6 rounded-full ">
                <AvatarImage src={i?.user.image_link} alt={i.user.first_name} />
                <AvatarFallback className="rounded-lg uppercase">
                  {i.user.first_name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            </span>
            <div className="">
              <span className="truncate font-bold">
                {i.user.first_name} {i.user.last_name}
              </span>{" "}
              {i.message}
              <div className="text-xs mt-2 font-medium ">
                {format(i.time, "PPP hh:mm aa")}
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default RecentActivity;
