import { describe, expect, it } from "vitest";

import { csvRowsToBulkItems, inventoryCsvTemplate, parseCsv } from "./inventory-csv-tools";

describe("inventory-csv-tools", () => {
  it("inventoryCsvTemplate contains required headers and Nos sample", () => {
    const template = inventoryCsvTemplate();
    expect(template).toContain("unit_symbol");
    expect(template).toContain("Nos");
    expect(template.split("\n")[0]).toContain("name");
  });

  it("parseCsv handles quoted values", () => {
    const rows = parseCsv(`name,sku,type,unit_symbol,category_id,quantity,threshold,description\n"Acrylic, Sheet",ACR-001,CONSUMABLE,Nos,,10,1,"desc"\n`);
    expect(rows.length).toBe(2);
    expect(rows[1][0]).toBe("Acrylic, Sheet");
    expect(rows[1][7]).toBe("desc");
  });

  it("csvRowsToBulkItems parses unit_symbol and numeric fields", () => {
    const csv = `name,sku,type,unit_symbol,category_id,quantity,threshold,description,image_url,is_active
Gloves,GLV-001,CONSUMABLE,Nos,,100,10,Disposable,,true`;
    const { rows, errors } = csvRowsToBulkItems(csv);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(1);
    expect(rows[0].unit_symbol).toBe("Nos");
    expect(rows[0].quantity).toBe("100");
    expect(rows[0].threshold).toBe("10");
  });
});

