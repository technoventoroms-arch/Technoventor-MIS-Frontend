export const INVENTORY_CSV_HEADERS = [
  "name",
  "sku",
  "type",
  "unit_symbol",
  "category_id",
  "quantity",
  "threshold",
  "description",
  "image_url",
  "is_active",
] as const;

export type InventoryCsvRow = Record<(typeof INVENTORY_CSV_HEADERS)[number], string>;

export function inventoryCsvTemplate(): string {
  const header = INVENTORY_CSV_HEADERS.join(",");
  const sample = [
    "Sample gloves",
    "GLV-001",
    "CONSUMABLE",
    "Nos",
    "",
    "100",
    "10",
    "Disposable nitrile gloves",
    "",
    "true",
  ].join(",");
  return `${header}\n${sample}\n`;
}

/** Minimal CSV parser (handles quoted fields). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell.trim());
      cell = "";
    } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
      row.push(cell.trim());
      if (row.some((c) => c.length > 0)) rows.push(row);
      row = [];
      cell = "";
      if (ch === "\r") i += 1;
    } else if (ch !== "\r") {
      cell += ch;
    }
  }

  if (cell.length || row.length) {
    row.push(cell.trim());
    if (row.some((c) => c.length > 0)) rows.push(row);
  }

  return rows;
}

export function csvRowsToBulkItems(text: string): { rows: Record<string, string>[]; errors: string[] } {
  const parsed = parseCsv(text.trim());
  if (!parsed.length) {
    return { rows: [], errors: ["CSV is empty."] };
  }

  const header = parsed[0].map((h) => h.trim().toLowerCase());
  const required = ["name", "sku", "type", "unit_symbol"];
  const missing = required.filter((col) => !header.includes(col));
  if (missing.length) {
    return { rows: [], errors: [`Missing columns: ${missing.join(", ")}`] };
  }

  const rows: Record<string, string>[] = [];
  const errors: string[] = [];

  parsed.slice(1).forEach((cells, index) => {
    const record: Record<string, string> = {};
    header.forEach((col, colIndex) => {
      record[col] = cells[colIndex] ?? "";
    });
    if (!record.name?.trim() && !record.sku?.trim()) return;
    if (!record.name?.trim()) errors.push(`Row ${index + 2}: name is required.`);
    if (!record.sku?.trim()) errors.push(`Row ${index + 2}: sku is required.`);
    rows.push({
      name: record.name ?? "",
      sku: record.sku ?? "",
      type: (record.type ?? "CONSUMABLE").toUpperCase(),
      unit_symbol: record.unit_symbol ?? "Nos",
      category: record.category_id || "",
      quantity: record.quantity ?? "0",
      threshold: record.threshold ?? "0",
      description: record.description ?? "",
      image_url: record.image_url ?? "",
      is_active: record.is_active ?? "true",
    });
  });

  return { rows, errors };
}

export function bulkItemsToCsv(items: Array<Record<string, unknown>>): string {
  const lines = [INVENTORY_CSV_HEADERS.join(",")];
  for (const item of items) {
    const cells = INVENTORY_CSV_HEADERS.map((header) => {
      if (header === "unit_symbol") {
        return escapeCsv(String(item.unit_symbol ?? ""));
      }
      if (header === "category_id") {
        return escapeCsv(String(item.category ?? ""));
      }
      const value = item[header === "category_id" ? "category" : header];
      return escapeCsv(value === null || value === undefined ? "" : String(value));
    });
    lines.push(cells.join(","));
  }
  return `${lines.join("\n")}\n`;
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
