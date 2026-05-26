import { useCanIUse } from "@/components/shared/can-i-use";
import { IInvntoryItem } from "@/interfaces/inventory";
import { Button } from "@mono/shared_ui/components/ui/button";
import { PERMISSIONS } from "@mono/shared_ui/interfaces/permissions";
import { CellContext } from "@tanstack/react-table";
import { ShoppingCart, Trash } from "lucide-react";
import { BaseSyntheticEvent } from "react";

const InventoryTableAction = ({
  table,
  row,
}: CellContext<IInvntoryItem, any>) => {
  const canDelete = useCanIUse(PERMISSIONS.DELETE_INVENTORY);

  const handleDeleteInventory = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.deleteInventory?.(row.original);
  };
  const handleAddToCart = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.addToCart?.(row.original);
  };
  return (
    <>
      <Button
        onClick={handleAddToCart}
        variant={"purple"}
        className="rounded size-6  mr-2"
        size={"icon"}
        title="Add To Cart"
      >
        <ShoppingCart className="size-3" />
      </Button>

      {canDelete && (
        <Button
          onClick={handleDeleteInventory}
          variant={"red"}
          className="rounded size-6"
          size={"icon"}
          title="Delete inventory item"
        >
          <Trash className="size-3" />
        </Button>
      )}
    </>
  );
};

export default InventoryTableAction;
