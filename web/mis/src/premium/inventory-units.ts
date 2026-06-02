import type { Entity } from "@mono/api_client";

/** Format quantity with unit symbol (e.g. "10 Nos"). */
export function formatQuantityWithUnit(
  quantity: unknown,
  unitSymbol?: string | null,
  unitName?: string | null
): string {
  const qty = quantity === null || quantity === undefined ? "—" : String(quantity);
  const unit = unitSymbol || unitName || "";
  return unit ? `${qty} ${unit}` : qty;
}

/** Prefer Nos as the default count unit label in selectors. */
export function formatUnitOption(unit: Entity): string {
  const name = String(unit.name ?? "");
  const symbol = String(unit.symbol ?? "");
  return symbol ? `${name} (${symbol})` : name;
}

export function sortUnitsWithNosFirst(units: Entity[]): Entity[] {
  return [...units].sort((a, b) => {
    const aNos = String(a.symbol ?? "").toLowerCase() === "nos";
    const bNos = String(b.symbol ?? "").toLowerCase() === "nos";
    if (aNos && !bNos) return -1;
    if (!aNos && bNos) return 1;
    return String(a.name ?? "").localeCompare(String(b.name ?? ""));
  });
}

export function defaultUnitIdForItem(item: Entity, units: Entity[]): string {
  const stockUnitId = item.unit ? String(item.unit) : String(item.unit_id ?? "");
  if (stockUnitId) return stockUnitId;
  const nos = units.find((u) => String(u.symbol).toLowerCase() === "nos");
  return nos ? String(nos.id) : units[0] ? String(units[0].id) : "";
}
