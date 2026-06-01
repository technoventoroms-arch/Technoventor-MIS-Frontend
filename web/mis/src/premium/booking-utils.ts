/** Lab booking policy helpers (aligned with backend/apps/labs/services.py). */

export type LabBookingPolicy = {
  booking_enabled: boolean;
  slot_duration_minutes: number;
  no_show_grace_minutes?: number;
  booking_window_start: string;
  booking_window_end: string;
};

export const defaultBookingPolicy: LabBookingPolicy = {
  booking_enabled: true,
  slot_duration_minutes: 60,
  booking_window_start: "09:00:00",
  booking_window_end: "18:00:00",
};

export function parseTimeToMinutes(value: string): number {
  const [h, m] = value.split(":").map((part) => Number(part));
  return (h || 0) * 60 + (m || 0);
}

export function formatMinutesAsTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Send lab slot times with the browser's UTC offset (not `.toISOString()` UTC).
 * Backend validates against local wall-clock time; UTC-only strings fail for non-UTC users.
 */
export function localDateTimeToApiIso(value: string): string {
  if (!value) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, "0");
  const offsetMin = date.getTimezoneOffset();
  const sign = offsetMin <= 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  const offH = pad(Math.floor(abs / 60));
  const offM = pad(abs % 60);
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    `${sign}${offH}:${offM}`
  );
}

export function toDatetimeLocalValue(isoOrLocal: string): string {
  const date = new Date(isoOrLocal);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Local calendar date (YYYY-MM-DD) for date inputs — no past dates. */
export function minBookingDateLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isBookingStartInPast(bookedFrom: string): boolean {
  const start = new Date(bookedFrom);
  if (Number.isNaN(start.getTime())) return false;
  return start.getTime() < Date.now();
}

export function buildSlotCandidates(
  bookingDate: string,
  policy: LabBookingPolicy,
  existingReservations: Array<{ booked_from?: unknown; booked_till?: unknown; status?: string }>
): { from: string; till: string; blocked: boolean }[] {
  if (!bookingDate) return [];
  const today = minBookingDateLocal();
  if (bookingDate < today) return [];
  const startMin = parseTimeToMinutes(policy.booking_window_start);
  const endMin = parseTimeToMinutes(policy.booking_window_end);
  const step = Math.max(1, policy.slot_duration_minutes || 60);
  const slots: { from: string; till: string; blocked: boolean }[] = [];

  for (let cursor = startMin; cursor + step <= endMin; cursor += step) {
    const from = `${bookingDate}T${formatMinutesAsTime(cursor)}`;
    const till = `${bookingDate}T${formatMinutesAsTime(cursor + step)}`;
    const fromDate = new Date(from);
    const tillDate = new Date(till);
    const blocked =
      isBookingStartInPast(from) ||
      existingReservations.some((reservation) => {
        if (!reservation.booked_from || !reservation.booked_till) return false;
        if (reservation.status === "CANCELLED" || reservation.status === "REJECTED") {
          return false;
        }
        const rFrom = new Date(String(reservation.booked_from));
        const rTill = new Date(String(reservation.booked_till));
        return rFrom < tillDate && rTill > fromDate;
      });
    slots.push({ from, till, blocked });
  }
  return slots;
}

export function validateCustomReservation(
  policy: LabBookingPolicy,
  bookedFrom: string,
  bookedTill: string
): string | null {
  if (!policy.booking_enabled) {
    return "Bookings are disabled for this lab. Contact the lab manager.";
  }
  if (!bookedFrom || !bookedTill) {
    return "Select both start and end times.";
  }
  const start = new Date(bookedFrom);
  const end = new Date(bookedTill);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Invalid date or time.";
  }
  if (start >= end) {
    return "End time must be after start time.";
  }
  if (isBookingStartInPast(bookedFrom)) {
    return "Cannot book a slot in the past.";
  }
  if (start.toDateString() !== end.toDateString()) {
    return "Booking must start and end on the same day.";
  }
  const windowStart = parseTimeToMinutes(policy.booking_window_start);
  const windowEnd = parseTimeToMinutes(policy.booking_window_end);
  const startMin = start.getHours() * 60 + start.getMinutes();
  const endMin = end.getHours() * 60 + end.getMinutes();
  if (startMin < windowStart) {
    return `Cannot start before ${formatMinutesAsTime(windowStart)} (lab hours ${formatMinutesAsTime(windowStart)}–${formatMinutesAsTime(windowEnd)}).`;
  }
  if (endMin > windowEnd) {
    return `Cannot end after ${formatMinutesAsTime(windowEnd)} (lab hours ${formatMinutesAsTime(windowStart)}–${formatMinutesAsTime(windowEnd)}).`;
  }
  return null;
}
