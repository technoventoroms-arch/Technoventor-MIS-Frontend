import { Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";

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

type UnitConversionRow = {
  from_unit: number | string;
  to_unit: number | string;
  factor: number | string;
};

type Props = {
  lines: BookingMaterialLine[];
  onChange: (lines: BookingMaterialLine[]) => void;
  inventoryItems: Entity[];
  labUnits: Entity[];
  unitConversions?: UnitConversionRow[];
  /** Inventory item ids suggested for this machine (not auto-added). */
  suggestedItemIds?: number[];
};

export function emptyMaterialLine(items: Entity[], units: Entity[]): BookingMaterialLine {
  const firstItem = items[0];
  return {
    itemId: firstItem ? String(firstItem.id) : "",
    quantity: "",
    unitId: firstItem?.unit ? String(firstItem.unit) : units[0] ? String(units[0].id) : "",
  };
}

function buildSuggestedLines(
  suggestedItemIds: number[],
  inventoryItems: Entity[],
  labUnits: Entity[]
): BookingMaterialLine[] {
  return suggestedItemIds
    .map((id) => {
      const item = inventoryItems.find((row) => Number(row.id) === id);
      if (!item) return null;
      return {
        itemId: String(item.id),
        quantity: "",
        unitId: item.unit ? String(item.unit) : String(labUnits[0]?.id ?? ""),
      };
    })
    .filter(Boolean) as BookingMaterialLine[];
}

function conversionPartnersForStock(
  stockUnitId: string,
  conversions: UnitConversionRow[]
): Set<string> {
  const partners = new Set<string>([stockUnitId]);
  for (const row of conversions) {
    const fromId = String(row.from_unit);
    const toId = String(row.to_unit);
    if (fromId === stockUnitId) partners.add(toId);
    if (toId === stockUnitId) partners.add(fromId);
  }
  return partners;
}

function unitLabel(unit: Entity, stockUnitId: string): string {
  const symbol = String(unit.symbol ?? unit.name ?? unit.id);
  return String(unit.id) === stockUnitId ? `${symbol} (stock)` : symbol;
}

/** Convert entered qty to stock unit using lab conversion factors (client preview). */
function toStockQuantity(
  quantity: number,
  fromUnitId: string,
  stockUnitId: string,
  conversions: UnitConversionRow[]
): number | null {
  if (fromUnitId === stockUnitId) return quantity;

  const direct = conversions.find(
    (c) => String(c.from_unit) === fromUnitId && String(c.to_unit) === stockUnitId
  );
  if (direct) return quantity * Number(direct.factor);

  const reverse = conversions.find(
    (c) => String(c.from_unit) === stockUnitId && String(c.to_unit) === fromUnitId
  );
  if (reverse && Number(reverse.factor) !== 0) return quantity / Number(reverse.factor);

  return null;
}

export function BookingMaterialsEditor({
  lines,
  onChange,
  inventoryItems,
  labUnits,
  unitConversions = [],
  suggestedItemIds = [],
}: Props) {
  const suggestedLines = useMemo(
    () => buildSuggestedLines(suggestedItemIds, inventoryItems, labUnits),
    [suggestedItemIds, inventoryItems, labUnits]
  );

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

  function addSuggested() {
    onChange(suggestedLines);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Label>Materials (optional)</Label>
          <p className="text-xs text-muted-foreground">
            Skip this section if you do not need consumables. Otherwise add a line, enter quantity in
            the unit you choose (e.g. 400 g or 0.4 kg).
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={addLine} disabled={!inventoryItems.length}>
          <Plus className="size-3.5" />
          Add material
        </Button>
      </div>

      {suggestedLines.length > 0 && lines.length === 0 ? (
        <Button type="button" size="sm" variant="secondary" onClick={addSuggested}>
          Add suggested materials for this machine
        </Button>
      ) : null}

      {lines.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-200 px-3 py-4 text-center text-xs text-muted-foreground dark:border-slate-700">
          No materials on this booking. Click &quot;Submit booking request&quot; to continue, or
          &quot;Add material&quot; if you need stock.
        </p>
      ) : null}

      {lines.map((line, index) => {
        const item = inventoryItems.find((row) => String(row.id) === line.itemId);
        const stockUnitId = item?.unit ? String(item.unit) : "";
        const conversionPartners = stockUnitId
          ? conversionPartnersForStock(stockUnitId, unitConversions)
          : new Set<string>();
        const stockSymbol = item?.unit_symbol ? String(item.unit_symbol) : "units";
        const bookableUnits = labUnits.filter(
          (u) => !stockUnitId || conversionPartners.has(String(u.id))
        );
        const available = Number(item?.available_quantity ?? item?.quantity ?? 0);
        const enteredQty = Number(line.quantity);
        const stockEquivalent =
          line.quantity && line.unitId && stockUnitId && !Number.isNaN(enteredQty)
            ? toStockQuantity(enteredQty, line.unitId, stockUnitId, unitConversions)
            : null;
        const selectedUnit = labUnits.find((u) => String(u.id) === line.unitId);
        const selectedSymbol = selectedUnit?.symbol ? String(selectedUnit.symbol) : stockSymbol;

        return (
          <div
            key={`material-${index}`}
            className="space-y-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800"
          >
            <div className="grid gap-2 sm:grid-cols-[1fr_110px_100px_auto]">
              <div className="space-y-1">
                <Label className="text-xs">Item</Label>
                <Select
                  value={line.itemId}
                  onValueChange={(itemId) => {
                    const selected = inventoryItems.find((row) => String(row.id) === itemId);
                    const nextStockUnitId = selected?.unit ? String(selected.unit) : "";
                    const partners = nextStockUnitId
                      ? conversionPartnersForStock(nextStockUnitId, unitConversions)
                      : new Set<string>();
                    const gramUnit = labUnits.find(
                      (u) => String(u.symbol ?? "").toLowerCase() === "g"
                    );
                    const defaultUnitId =
                      gramUnit &&
                      partners.has(String(gramUnit.id)) &&
                      String(selected?.unit_symbol ?? "").toLowerCase() === "kg"
                        ? String(gramUnit.id)
                        : selected?.unit
                          ? String(selected.unit)
                          : line.unitId;
                    updateLine(index, { itemId, unitId: defaultUnitId });
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
                <Label className="text-xs">Quantity</Label>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  placeholder={stockSymbol === "kg" ? "e.g. 0.4 or 400" : "Amount"}
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
                    {bookableUnits.map((unit) => (
                      <SelectItem key={String(unit.id)} value={String(unit.id)}>
                        {unitLabel(unit, stockUnitId)}
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
            </div>
            {item ? (
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>
                  Inventory is tracked in <strong>{stockSymbol}</strong>. Available:{" "}
                  <strong>
                    {available} {stockSymbol}
                  </strong>{" "}
                  (after other pending requests).
                </p>
                {stockEquivalent !== null && line.quantity ? (
                  <p>
                    Your request: <strong>{line.quantity}</strong> {selectedSymbol}
                    {selectedSymbol !== stockSymbol ? (
                      <>
                        {" "}
                        ≈ <strong>{stockEquivalent.toFixed(4)}</strong> {stockSymbol} stock
                      </>
                    ) : null}
                    {stockEquivalent > available ? (
                      <span className="text-rose-600"> — exceeds available stock</span>
                    ) : null}
                  </p>
                ) : line.quantity && selectedSymbol !== stockSymbol ? (
                  <p className="text-rose-600">Cannot convert {selectedSymbol} to {stockSymbol}.</p>
                ) : null}
              </div>
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

/** Returns error message if any line is incomplete or invalid. */
export function validateMaterialLines(
  lines: BookingMaterialLine[],
  inventoryItems: Entity[],
  unitConversions: UnitConversionRow[]
): string | null {
  for (const line of lines) {
    if (!line.itemId) continue;
    const qty = Number(line.quantity);
    if (!line.quantity || Number.isNaN(qty) || qty <= 0) {
      return "Enter a quantity for each material line, or remove the line.";
    }
    const item = inventoryItems.find((row) => String(row.id) === line.itemId);
    if (!item?.unit) continue;
    const stockUnitId = String(item.unit);
    const stockQty = toStockQuantity(qty, line.unitId, stockUnitId, unitConversions);
    if (stockQty === null && line.unitId !== stockUnitId) {
      return `No unit conversion configured for the selected unit on ${item.name ?? "item"}.`;
    }
    const available = Number(item.available_quantity ?? item.quantity ?? 0);
    if (stockQty !== null && stockQty > available) {
      const sym = item.unit_symbol ? String(item.unit_symbol) : "units";
      return `Only ${available} ${sym} available for ${item.name ?? "item"}.`;
    }
  }
  return null;
}
