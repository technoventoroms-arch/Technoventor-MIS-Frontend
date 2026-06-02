import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { apiClient, endpoints, normalizeApiError, type Entity } from "@mono/api_client";
import { Button } from "@mono/shared_ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@mono/shared_ui/components/ui/dialog";
import { Input } from "@mono/shared_ui/components/ui/input";
import { Label } from "@mono/shared_ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@mono/shared_ui/components/ui/select";
import { toast } from "sonner";

import { formatInventoryItemOption } from "./inventory-booking";
import { defaultUnitIdForItem, formatUnitOption, sortUnitsWithNosFirst } from "./inventory-units";

export function InventoryRequestDialog({
  open,
  onOpenChange,
  item,
  units,
  labId,
  orgId,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Entity | null;
  units: Entity[];
  labId: string;
  orgId?: string;
  onAdded: () => Promise<void>;
}) {
  const [quantity, setQuantity] = useState("1");
  const [unitId, setUnitId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedUnits = sortUnitsWithNosFirst(units);

  useEffect(() => {
    if (item && open) {
      setQuantity("1");
      setUnitId(defaultUnitIdForItem(item, units));
    }
  }, [item, open, units]);

  async function addToCart() {
    if (!item) return;
    setIsSubmitting(true);
    try {
      await apiClient.create(
        endpoints.inventory.cart(labId),
        {
          payload: [
            {
              item_id: item.id,
              cart_quantity: Number(quantity),
              unit_id: unitId ? Number(unitId) : undefined,
            },
          ],
        },
        { orgId }
      );
      toast.success("Added to cart.");
      onOpenChange(false);
      await onAdded();
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request inventory item</DialogTitle>
          <DialogDescription>
            {item ? formatInventoryItemOption(item) : "Select quantity and unit for your cart."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="req-qty">Quantity</Label>
            <Input
              id="req-qty"
              type="number"
              min="0"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="req-unit">Unit</Label>
            <Select value={unitId} onValueChange={setUnitId}>
              <SelectTrigger id="req-unit">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                {sortedUnits.map((unit) => (
                  <SelectItem key={String(unit.id)} value={String(unit.id)}>
                    {formatUnitOption(unit)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!quantity || isSubmitting} onClick={addToCart}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Adding…
              </>
            ) : (
              "Add to cart"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
