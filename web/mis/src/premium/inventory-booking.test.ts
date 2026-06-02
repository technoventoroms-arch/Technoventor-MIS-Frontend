import { describe, expect, it } from "vitest";

import { formatOrderLinesSummary } from "./inventory-booking";

describe("inventory-booking", () => {
  it("formatOrderLinesSummary uses display_quantity when present", () => {
    const lines = [
      { display_quantity: "10 Nos", item_name: "Gloves", inventory_item: 1, unit_symbol: "nos" },
    ] as any[];
    expect(formatOrderLinesSummary(lines)).toBe("10 Nos Gloves");
  });

  it("formatOrderLinesSummary falls back to requested unit symbols", () => {
    const lines = [
      {
        requested_quantity: 10,
        requested_unit_symbol: "Nos",
        quantity: 20,
        stock_unit_symbol: "pcs",
        item_name: "Screws",
      },
    ] as any[];

    expect(formatOrderLinesSummary(lines)).toBe("10 Nos Screws (= 20 pcs)");
  });
});

