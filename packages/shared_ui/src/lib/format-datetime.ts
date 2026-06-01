/** Format API ISO timestamps for display in the user's local timezone. */

const ISO_DATETIME =
  /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function parseApiDateTime(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isApiDateTimeString(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  const trimmed = value.trim();
  return ISO_DATETIME.test(trimmed) || ISO_DATE_ONLY.test(trimmed);
}

/** e.g. "Jun 1, 2026, 11:37 AM" in the browser locale. */
export function formatLocalDateTime(value: unknown): string {
  if (typeof value === "string" && ISO_DATE_ONLY.test(value.trim())) {
    const [year, month, day] = value.trim().split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
  }
  const date = parseApiDateTime(value);
  if (!date) {
    return "—";
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: true,
  }).format(date);
}

/** e.g. "11:37 AM" (same calendar day as today) or full date+time otherwise. */
export function formatLocalDateTimeCompact(value: unknown): string {
  const date = parseApiDateTime(value);
  if (!date) {
    return "—";
  }
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  }

  return formatLocalDateTime(value);
}

/** Use in tables and detail fields — formats ISO strings, passes through other values. */
export function formatDisplayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  if (isApiDateTimeString(value)) {
    return formatLocalDateTime(value);
  }
  return String(value);
}
