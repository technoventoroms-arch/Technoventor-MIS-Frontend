import { IInvntoryItem } from "@/interfaces/inventory";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Edit } from "lucide-react";

type Props = {
  itemDetail: IInvntoryItem | null;
  canEditMachine: boolean;
  onEditClick: () => void;
};

const ViewItemInfo = ({ itemDetail, canEditMachine, onEditClick }: Props) => {
  return (
    <div className="flex gap-2 flex-col md:flex-row">
      <span className="p-2">
        <img
          className="rounded-md w-full max-w-xl h-64"
          src={itemDetail?.image_link || undefined}
        />
      </span>
      <div className="p-2 px-4 space-y-3 flex-1">
        <div className="flex justify-between items-start md:items-end gap-2  overflow-hidden">
          <div className="flex-1 w-full">
            <div className="text-xs">Item Name</div>
            <div className="text-lg font-semibold text-wrap break-words">
              {itemDetail?.name}
            </div>
          </div>
          <div className=" ">
            {canEditMachine && (
              <Button
                onClick={onEditClick}
                size={"icon"}
                rounded={"sm"}
                variant={"gray"}
              >
                <Edit />
              </Button>
            )}
          </div>
        </div>
        <div className="flex gap-10 flex-wrap">
          <div className="space-y-1">
            <div className="text-xs">SKU</div>
            <div className="text-lg font-semibold">
              <Badge className="text-sm " variant={"green"}>
                {itemDetail?.sku || "Low"}
              </Badge>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs">Unit</div>
            <div className="text-lg font-semibold">
              <Badge className="text-sm " variant={"indigo"}>
                {itemDetail?.unit.symbol} -{" "}
                <span className="uppercase">({itemDetail?.unit.name})</span>
              </Badge>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs">Type</div>
            <div className="text-lg font-semibold">
              <Badge className="text-sm " variant={"red"}>
                {itemDetail?.type}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-10 flex-wrap">
          <div className="space-y-1">
            <div className="text-xs">Available Qtty</div>
            <div className="text-lg font-semibold">
              <Badge className="text-sm " variant={"yellow"}>
                {itemDetail?.quantity}
              </Badge>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs">Min Threshold</div>
            <div className="text-lg font-semibold">
              <Badge className="text-sm " variant={"yellow"}>
                {itemDetail?.threshold}
              </Badge>
            </div>
          </div>
        </div>
        <div className="">
          <div className="text-xs">Description</div>
          <div className="text-lg font-semibold">{itemDetail?.description}</div>
        </div>
      </div>
    </div>
  );
};

export default ViewItemInfo;
