import { IMachine } from "@/interfaces/machines";
import { Badge } from "@mono/shared_ui/components/ui/badge";

type Props = {
  machineDetails: IMachine | null;
};

const ViewMachineInfo = ({ machineDetails }: Props) => {
  return (
    <div className="flex gap-2 flex-col md:flex-row">
      <span className="p-2 flex-1">
        <img
          className="rounded-md max-w-xl h-64"
          src={machineDetails?.image_link || undefined}
        />
      </span>
      <div className="p-2 px-4 space-y-3 flex-1 ">
        <div className="flex justify-between items-start md:items-end gap-2  overflow-hidden">
          <div className="flex-1 w-full">
            <div className="text-xs">Machine Name</div>
            <div className="text-lg font-semibold text-wrap break-words">
              {machineDetails?.name}
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs">Status</div>
          <div className="text-lg font-semibold">
            <Badge className="text-sm " variant={"indigo"}>
              {machineDetails?.status}
            </Badge>
          </div>
        </div>
        <div className="">
          <div className="text-xs">Description</div>
          <div className="text-lg font-semibold">
            {machineDetails?.description}
          </div>
        </div>
        <div className="">
          <div className="text-xs">API Key</div>
          <div className="text-lg font-semibold">
            {machineDetails?.api_key || "--"}{" "}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewMachineInfo;
