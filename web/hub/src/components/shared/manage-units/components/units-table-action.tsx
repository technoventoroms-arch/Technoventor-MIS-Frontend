import { IUnit } from "@/interfaces/inventory";
import { Button } from "@mono/shared_ui/components/ui/button";
import { CellContext } from "@tanstack/react-table";
import { Trash } from "lucide-react";
import { BaseSyntheticEvent } from "react";

const UnitsTableAction = ({ table, row }: CellContext<IUnit, any>) => {
  const handleDeleteUnit = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.deleteUnit?.(row.original);
  };
  return (
    <>
      <Button
        onClick={handleDeleteUnit}
        variant={"red"}
        className="rounded size-6"
        size={"icon"}
        title="Delete category"
      >
        <Trash className="size-3" />
      </Button>
    </>
  );
};

export default UnitsTableAction;
