import { describe, expect, it } from "vitest";

import { defaultUnitIdForItem, formatQuantityWithUnit, sortUnitsWithNosFirst } from "./inventory-units";

describe("inventory-units", () => {
  it("formatQuantityWithUnit formats quantity and unit symbol", () => {
    expect(formatQuantityWithUnit(10, "Nos", null)).toBe("10 Nos");
  });

  it("sortUnitsWithNosFirst puts Nos first", () => {
    const units = [
      { id: 1, symbol: "kg", name: "Kilogram" },
      { id: 2, symbol: "nos", name: "Nos" },
      { id: 3, symbol: "pcs", name: "Pieces" },
    ] as any[];
    const sorted = sortUnitsWithNosFirst(units);
    expect(String(sorted[0].symbol).toLowerCase()).toBe("nos");
  });

  it("defaultUnitIdForItem prefers item.unit", () => {
    const units = [
      { id: 1, symbol: "nos", name: "Nos" },
      { id: 2, symbol: "kg", name: "Kilogram" },
    ] as any[];
    const item = { unit: 2, unit_id: 999 } as any;
    expect(defaultUnitIdForItem(item, units)).toBe("2");
  });
});

