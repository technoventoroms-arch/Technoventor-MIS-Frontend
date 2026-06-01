import type { Entity } from "@mono/api_client";

export type MaterialDetail = {
  item_id?: number;
  item_name?: string;
  quantity?: number | string;
  unit_symbol?: string | null;
  unit_name?: string | null;
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
  const qty = detail.quantity ?? "?";
  const unit = detail.unit_symbol ?? detail.unit_name ?? "";
  const name = detail.item_name ?? `Item ${detail.item_id ?? ""}`;
  return unit ? `${qty} ${unit} ${name}` : `${qty} × ${name}`;
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
      const qty = row.quantity ?? "?";
      const unit = row.unit_symbol ? String(row.unit_symbol) : "";
      const name = row.item_name ? String(row.item_name) : `Item ${row.inventory_item ?? ""}`;
      return unit ? `${qty} ${unit} ${name}` : `${qty} × ${name}`;
    })
    .join("; ");
}
