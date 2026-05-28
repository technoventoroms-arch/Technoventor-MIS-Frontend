import { IMachine } from "@/interfaces/machines";
import { Button } from "@mono/shared_ui/components/ui/button";
import { CellContext } from "@tanstack/react-table";
import { Edit2Icon, Trash } from "lucide-react";
import { BaseSyntheticEvent } from "react";

const MachineTableAction = ({ table, row }: CellContext<IMachine, any>) => {
  const handleEdit = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.editMachine?.(row.original);
  };
  const handleDeleteMachine = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.deleteMachine?.(row.original);
  };
  return (
    <>
      <Button
        onClick={handleEdit}
        variant={"indigo"}
        className="rounded size-6 mr-2"
        size={"icon"}
        title="Edit machine"
      >
        <Edit2Icon className="size-3" />
      </Button>
      <Button
        onClick={handleDeleteMachine}
        variant={"red"}
        className="rounded size-6"
        size={"icon"}
        title="Delete Machine"
      >
        <Trash className="size-3" />
      </Button>
    </>
  );
};

export default MachineTableAction;
