import { ILabJoinRequest } from "@/interfaces/labs";
import { Button } from "@mono/shared_ui/components/ui/button";
import { CellContext } from "@tanstack/react-table";
import { Check, X } from "lucide-react";
import { BaseSyntheticEvent } from "react";

const JoinReqTableAction = ({
  table,
  row,
}: CellContext<ILabJoinRequest, any>) => {
  const handleRejectJoinReq = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.rejectJoin?.(row.original);
  };
  const handleApproveJoinReq = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.approveJoin?.(row.original);
  };

  return row.original.status == "PENDING" ? (
    <>
      <Button
        onClick={handleApproveJoinReq}
        variant={"green"}
        className="rounded size-6 mr-2"
        size={"icon"}
        title="Approve attendance"
      >
        <Check className="size-3" />
      </Button>
      <Button
        onClick={handleRejectJoinReq}
        variant={"red"}
        className="rounded size-6"
        size={"icon"}
        title="Reject Attendance"
      >
        <X className="size-3" />
      </Button>
    </>
  ) : null;
};

export default JoinReqTableAction;
