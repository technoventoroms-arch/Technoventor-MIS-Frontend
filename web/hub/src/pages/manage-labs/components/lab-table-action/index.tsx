import { Button } from "@mono/shared_ui/components/ui/button";
import { CellContext } from "@tanstack/react-table";
import { Edit2Icon, ShieldUser } from "lucide-react";
import { BaseSyntheticEvent } from "react";
import { ILabType } from "../../schema";

const LabsTableAction = ({ table, row }: CellContext<ILabType, any>) => {
  const handleEditLab = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.editLab?.(row.original);
  };
  const handleChangeAdmin = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.changeAdmin?.(row.original);
  };
  return (
    <>
      <Button
        onClick={handleEditLab}
        variant={"indigo"}
        className="rounded size-6 mr-2"
        size={"icon"}
        title="Edit lab"
      >
        <Edit2Icon className="size-3" />
      </Button>
      <Button
        onClick={handleChangeAdmin}
        variant={"red"}
        className="rounded size-6"
        size={"icon"}
        title="Change admin"
      >
        <ShieldUser className="size-3" />
      </Button>
    </>
  );
};

export default LabsTableAction;
