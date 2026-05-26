import { IOrderLog } from "@/interfaces/order";
import { Button } from "@mono/shared_ui/components/ui/button";
import { CellContext } from "@tanstack/react-table";
import { X } from "lucide-react";
import { BaseSyntheticEvent } from "react";

const InventoryTableAction = ({ table, row }: CellContext<IOrderLog, any>) => {
  const handleCancelRequest = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.cancelRequest?.(row.original);
  };

  return (
    <>
      <Button
        onClick={handleCancelRequest}
        variant={row.original.status == "NEW" ? "red" : "gray"}
        className="rounded size-6"
        size={"icon"}
        disabled={row.original.status !== "NEW"}
        title="Cancel Request"
      >
        <X className="size-3" />
      </Button>
    </>
  );
};

export default InventoryTableAction;
