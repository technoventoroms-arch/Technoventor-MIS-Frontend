import { Button } from "@mono/shared_ui/components/ui/button";
import { ICategory } from "@mono/shared_ui/interfaces/category";
import { CellContext } from "@tanstack/react-table";
import { Trash } from "lucide-react";
import { BaseSyntheticEvent } from "react";

const CategoryTableAction = ({ table, row }: CellContext<ICategory, any>) => {
  const handleDeleteCategory = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.deleteCategory?.(row.original);
  };
  return (
    <>
      <Button
        onClick={handleDeleteCategory}
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

export default CategoryTableAction;
