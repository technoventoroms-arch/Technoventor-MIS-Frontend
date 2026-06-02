import type { Entity } from "@mono/api_client";

export type MaterialDetail = {
  item_id?: number;
  item_name?: string;
  quantity?: number | string;
  unit_symbol?: string | null;
  unit_name?: string | null;
  requested_quantity?: number | string;
  requested_unit_symbol?: string | null;
  stock_quantity?: number | string;
  stock_unit_symbol?: string | null;
  on_hand_quantity?: number | string;
  available_quantity?: number | string;
};

export function formatInventoryItemOption(item: Entity): string {
  const name = String(item.name ?? item.sku ?? `Item ${item.id}`);
  const symbol = item.unit_symbol ? String(item.unit_symbol) : "";
  const available = item.available_quantity ?? item.quantity;
  if (available === undefined || available === null) {
    return symbol ? `${name} (${symbol})` : name;
  }
  return symbol ? `${name} — ${available} ${symbol} available` : `${name} — ${available} available`;
}

export function formatMaterialDetailsLine(detail: MaterialDetail): string {
  const name = detail.item_name ?? `Item ${detail.item_id ?? ""}`;
  const reqQty = detail.requested_quantity ?? detail.quantity;
  const reqUnit = detail.requested_unit_symbol ?? detail.unit_symbol ?? detail.unit_name ?? "";
  const stockQty = detail.stock_quantity ?? detail.quantity;
  const stockUnit = detail.stock_unit_symbol ?? detail.unit_symbol ?? "";
  if (reqUnit && stockUnit && String(reqUnit) !== String(stockUnit) && stockQty !== undefined) {
    return `${reqQty} ${reqUnit} ${name} (= ${stockQty} ${stockUnit} stock)`;
  }
  const unit = reqUnit || stockUnit;
  return unit ? `${reqQty} ${unit} ${name}` : `${reqQty} × ${name}`;
}

export function formatMaterialDetailsSummary(
  details: MaterialDetail[] | unknown
): string {
  if (!Array.isArray(details) || details.length === 0) {
    return "—";
  }
  return details.map((row) => formatMaterialDetailsLine(row as MaterialDetail)).join("; ");
}

export function formatOrderLinesSummary(lines: unknown): string {
  if (!Array.isArray(lines) || lines.length === 0) {
    return "—";
  }
  return lines
    .map((line) => {
      const row = line as Record<string, unknown>;
      if (row.display_quantity) {
        const name = row.item_name ? String(row.item_name) : `Item ${row.inventory_item ?? ""}`;
        return `${row.display_quantity} ${name}`;
      }
      const reqQty = row.requested_quantity ?? row.quantity ?? "?";
      const reqUnit = row.requested_unit_symbol
        ? String(row.requested_unit_symbol)
        : row.unit_symbol
          ? String(row.unit_symbol)
          : "";
      const stockQty = row.quantity;
      const stockUnit = row.stock_unit_symbol ?? row.unit_symbol;
      const name = row.item_name ? String(row.item_name) : `Item ${row.inventory_item ?? ""}`;
      if (reqUnit && stockUnit && String(reqUnit) !== String(stockUnit) && stockQty !== undefined) {
        return `${reqQty} ${reqUnit} ${name} (= ${stockQty} ${stockUnit})`;
      }
      const unit = reqUnit || (stockUnit ? String(stockUnit) : "");
      return unit ? `${reqQty} ${unit} ${name}` : `${reqQty} × ${name}`;
    })
    .join("; ");
}
