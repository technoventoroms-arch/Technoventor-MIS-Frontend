import CanIUse from "@/components/shared/can-i-use";
import { InvItemSpecs } from "@/interfaces/inventory";
import { Button } from "@mono/shared_ui/components/ui/button";
import { CellContext } from "@tanstack/react-table";
import { Trash } from "lucide-react";
import { BaseSyntheticEvent } from "react";

const SpecsTableAction = ({ table, row }: CellContext<InvItemSpecs, any>) => {
  const handleDeleteSpecs = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.deleteSpecs?.(row.original);
  };
  return (
    <CanIUse action={(a) => a.UPDATE_INVENTORY}>
      <Button
        onClick={handleDeleteSpecs}
        variant={"red"}
        className="rounded size-6"
        size={"icon"}
        title="Delete Specs"
      >
        <Trash className="size-3" />
      </Button>
    </CanIUse>
  );
};

export default SpecsTableAction;
