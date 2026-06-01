import { Plus, Trash2 } from "lucide-react";

import type { Entity } from "@mono/api_client";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Input } from "@mono/shared_ui/components/ui/input";
import { Label } from "@mono/shared_ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@mono/shared_ui/components/ui/select";

import { formatInventoryItemOption } from "./inventory-booking";

export type BookingMaterialLine = {
  itemId: string;
  quantity: string;
  unitId: string;
};

type Props = {
  lines: BookingMaterialLine[];
  onChange: (lines: BookingMaterialLine[]) => void;
  inventoryItems: Entity[];
  labUnits: Entity[];
};

export function emptyMaterialLine(items: Entity[], units: Entity[]): BookingMaterialLine {
  const firstItem = items[0];
  return {
    itemId: firstItem ? String(firstItem.id) : "",
    quantity: "",
    unitId: firstItem?.unit ? String(firstItem.unit) : units[0] ? String(units[0].id) : "",
  };
}

export function BookingMaterialsEditor({ lines, onChange, inventoryItems, labUnits }: Props) {
  function updateLine(index: number, patch: Partial<BookingMaterialLine>) {
    const next = lines.map((line, i) => (i === index ? { ...line, ...patch } : line));
    onChange(next);
  }

  function addLine() {
    onChange([...lines, emptyMaterialLine(inventoryItems, labUnits)]);
  }

  function removeLine(index: number) {
    onChange(lines.filter((_, i) => i !== index));
  }

  function unitsForItem(_itemId: string): Entity[] {
    return labUnits;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Materials (optional)</Label>
        <Button type="button" size="sm" variant="outline" onClick={addLine} disabled={!inventoryItems.length}>
          <Plus className="size-3.5" />
          Add material
        </Button>
      </div>
      {lines.length === 0 ? (
        <p className="text-xs text-muted-foreground">No materials requested. Add a line to include inventory.</p>
      ) : null}
      {lines.map((line, index) => {
        const item = inventoryItems.find((row) => String(row.id) === line.itemId);
        const unitOptions = unitsForItem(line.itemId);
        const stockSymbol = item?.unit_symbol ? String(item.unit_symbol) : "units";
        const available = item?.available_quantity ?? item?.quantity;

        return (
          <div
            key={`material-${index}`}
            className="grid gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800 sm:grid-cols-[1fr_100px_100px_auto]"
          >
            <div className="space-y-1">
              <Label className="text-xs">Item</Label>
              <Select
                value={line.itemId}
                onValueChange={(itemId) => {
                  const selected = inventoryItems.find((row) => String(row.id) === itemId);
                  updateLine(index, {
                    itemId,
                    unitId: selected?.unit ? String(selected.unit) : line.unitId,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {inventoryItems.map((row) => (
                    <SelectItem key={String(row.id)} value={String(row.id)}>
                      {formatInventoryItemOption(row)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Qty</Label>
              <Input
                type="number"
                min={0}
                step="any"
                value={line.quantity}
                onChange={(e) => updateLine(index, { quantity: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Unit</Label>
              <Select value={line.unitId} onValueChange={(unitId) => updateLine(index, { unitId })}>
                <SelectTrigger>
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map((unit) => (
                    <SelectItem key={String(unit.id)} value={String(unit.id)}>
                      {String(unit.symbol ?? unit.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="button" size="icon" variant="ghost" onClick={() => removeLine(index)}>
                <Trash2 className="size-4 text-rose-600" />
              </Button>
            </div>
            {item ? (
              <p className="text-xs text-muted-foreground sm:col-span-4">
                Stock unit: {stockSymbol}. Available: {String(available)} {stockSymbol} (after pending requests).
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function materialsToApiPayload(lines: BookingMaterialLine[]): Record<string, unknown>[] {
  return lines
    .filter((line) => line.itemId && line.quantity && Number(line.quantity) > 0)
    .map((line) => ({
      item_id: Number(line.itemId),
      quantity: Number(line.quantity),
      unit_id: Number(line.unitId),
    }));
}
