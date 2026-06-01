import type { Entity } from "@mono/api_client";

/** Primary label for any API row — never shows database IDs. */
export function entityTitle(row: Entity | undefined): string {
  if (!row) return "Unknown";

  const nested = row.user as Entity | undefined;
  const source = nested ?? row;
  const fromParts = [source.first_name, source.last_name].filter(Boolean).join(" ");
  if (fromParts) return fromParts;

  for (const value of [
    source.full_name,
    source.name,
    row.name,
    source.title,
    source.email,
    row.email,
    source.number,
    row.slug,
  ]) {
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value);
    }
  }

  return "Unnamed";
}

/** Secondary line (email, slug, role hint) — omit when nothing useful. */
export function entitySubtitle(row: Entity): string | undefined {
  const nested = row.user as Entity | undefined;
  const title = entityTitle(row);
  const email = String(nested?.email ?? row.email ?? "").trim();
  if (email && email !== title) return email;

  const slug = String(row.slug ?? "").trim();
  if (slug && slug !== title) return slug;

  const description = String(row.description ?? "").trim();
  if (description) {
    return description.length > 72 ? `${description.slice(0, 72)}…` : description;
  }

  if (row.is_admin === true) return "Organisation admin";
  if (row.is_admin === false && (nested || row.user)) return "Member";

  return undefined;
}

export function entityNameCell(row: Entity) {
  const subtitle = entitySubtitle(row);
  return (
    <div>
      <p className="font-semibold text-slate-950 dark:text-white">{entityTitle(row)}</p>
      {subtitle ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      ) : null}
    </div>
  );
}
