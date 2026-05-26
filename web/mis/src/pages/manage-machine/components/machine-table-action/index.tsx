import CanIUse, { useCanIUse } from "@/components/shared/can-i-use";
import { IMachine } from "@/interfaces/machines";
import { Button } from "@mono/shared_ui/components/ui/button";
import { PERMISSIONS } from "@mono/shared_ui/interfaces/permissions";
import { CellContext } from "@tanstack/react-table";
import { Barcode, Edit2Icon, Logs, Trash } from "lucide-react";
import { BaseSyntheticEvent } from "react";

const MachineTableAction = ({ table, row }: CellContext<IMachine, any>) => {
  const canEdit = useCanIUse(PERMISSIONS.UPDATE_MACHINES);
  const handleEdit = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.editMachine?.(row.original);
  };
  const handleDeleteMachine = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.deleteMachine?.(row.original);
  };
  const handleShowMachineLogs = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.showMachineLogs?.(row.original);
  };
  const handleShowMachineQR = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.showMachineQR?.(row.original);
  };

  return (
    <>
      <Button
        onClick={handleEdit}
        variant={"indigo"}
        className="rounded size-6 mr-2"
        size={"icon"}
        title={canEdit ? "Edit Machine" : "View Machine"}
      >
        <Edit2Icon className="size-3" />
      </Button>

      <Button
        onClick={handleShowMachineQR}
        variant={"green"}
        className="rounded size-6 mr-2"
        size={"icon"}
        title="Show Qr for machine"
      >
        <Barcode className="size-3" />
      </Button>
      <Button
        onClick={handleShowMachineLogs}
        variant={"blue"}
        className="rounded size-6 mr-2"
        size={"icon"}
        title="Machine Logs"
      >
        <Logs className="size-3" />
      </Button>
      <CanIUse action={(a) => a.DELETE_MACHINES}>
        <Button
          onClick={handleDeleteMachine}
          variant={"red"}
          className="rounded size-6 "
          size={"icon"}
          title="Delete Machine"
        >
          <Trash className="size-3" />
        </Button>
      </CanIUse>
    </>
  );
};

export default MachineTableAction;
