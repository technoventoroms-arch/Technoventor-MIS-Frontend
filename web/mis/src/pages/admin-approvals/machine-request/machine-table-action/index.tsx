import { MachineBookingSummary } from "@/interfaces/reservation";
import { Button } from "@mono/shared_ui/components/ui/button";
import { CellContext } from "@tanstack/react-table";
import { Check, X } from "lucide-react";
import { BaseSyntheticEvent } from "react";

const MachineTableAction = ({
  table,
  row,
}: CellContext<MachineBookingSummary, any>) => {
  const handleRejectRequest = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.rejectRequest?.(row.original);
  };
  const handleApproveRequest = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.approveRequest?.(row.original);
  };

  return (
    <>
      <Button
        onClick={handleApproveRequest}
        variant={"green"}
        className="rounded size-6 mr-2"
        size={"icon"}
        title="Approve Request"
      >
        <Check className="size-3" />
      </Button>
      <Button
        onClick={handleRejectRequest}
        variant={"red"}
        className="rounded size-6"
        size={"icon"}
        title="Reject Request"
      >
        <X className="size-3" />
      </Button>
    </>
  );
};

export default MachineTableAction;
