import type { Entity } from "@mono/api_client";
import type { IEvent } from "@mono/shared_ui/components/shared/event-calendar/interfaces";
import type { TEventColor } from "@mono/shared_ui/components/shared/event-calendar/types";

export type BookingCalendarRow = Entity & {
  booked_from: string;
  booked_till: string;
  status?: string;
  notes?: string | null;
  machine_name?: string;
  project_title?: string;
  machine_detail?: { name?: string };
};

const STATUS_COLORS: Record<string, TEventColor> = {
  NEW: "yellow",
  APPROVED: "green",
  REJECTED: "red",
  CANCELLED: "gray",
};

export function bookingStatusColor(status: unknown): TEventColor {
  const key = String(status ?? "NEW").toUpperCase();
  return STATUS_COLORS[key] ?? "blue";
}

export function bookingEventTitle(row: BookingCalendarRow): string {
  const machine =
    row.machine_name ??
    (row.machine_detail as { name?: string } | undefined)?.name ??
    "Machine";
  const project = row.project_title ?? "Project";
  return `${machine} · ${project}`;
}

/** Map API reservations to event-calendar events (one block per booking). */
export function reservationsToCalendarEvents(
  rows: BookingCalendarRow[]
): IEvent<BookingCalendarRow>[] {
  const seen = new Set<string>();
  const events: IEvent<BookingCalendarRow>[] = [];

  for (const row of rows) {
    const id = String(row.id);
    if (seen.has(id)) continue;
    seen.add(id);

    const start = new Date(String(row.booked_from));
    const end = new Date(String(row.booked_till));
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) continue;

    events.push({
      id: Number(row.id),
      startDate: start,
      endDate: end,
      title: bookingEventTitle(row),
      description: String(row.notes ?? ""),
      color: bookingStatusColor(row.status),
      meta: row,
    });
  }

  return events;
}

export function eventsOnDate(events: IEvent<BookingCalendarRow>[], day: Date): IEvent<BookingCalendarRow>[] {
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
  const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);
  return events
    .filter((event) => event.startDate <= dayEnd && event.endDate >= dayStart)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}
