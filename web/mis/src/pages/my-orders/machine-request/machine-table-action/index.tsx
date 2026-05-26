import { MachineBookingSummary } from "@/interfaces/reservation";
import { Button } from "@mono/shared_ui/components/ui/button";
import { CellContext } from "@tanstack/react-table";
import { isBefore } from "date-fns";
import { X } from "lucide-react";
import { BaseSyntheticEvent } from "react";

const MachineTableAction = ({
  table,
  row,
}: CellContext<MachineBookingSummary, any>) => {
  const handleCancelRequest = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.cancelRequest?.(row.original);
  };
  const isDisabled =
    row.original.status !== "APPROVED" ||
    isBefore(row.original.booked_from, new Date());
  return (
    <>
      <Button
        onClick={handleCancelRequest}
        variant={isDisabled ? "gray" : "red"}
        className="rounded size-6"
        size={"icon"}
        disabled={isDisabled}
        title="Cancel Request"
      >
        <X className="size-3" />
      </Button>
    </>
  );
};

export default MachineTableAction;
