import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CalendarDays, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { apiClient, endpoints, normalizeApiError, type ApiPage } from "@mono/api_client";
import { CalendarProvider } from "@mono/shared_ui/components/shared/event-calendar/contexts/calendar-context";
import { ClientContainer } from "@mono/shared_ui/components/shared/event-calendar/components/client-container";
import type { IEvent } from "@mono/shared_ui/components/shared/event-calendar/interfaces";
import { PremiumSurface } from "@mono/shared_ui/components/premium";
import { Button } from "@mono/shared_ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@mono/shared_ui/components/ui/dialog";
import { StatusBadge } from "@mono/shared_ui/components/premium/status-badge";
import { formatLocalDateTime } from "@mono/shared_ui/lib/format-datetime";

import {
  eventsOnDate,
  reservationsToCalendarEvents,
  type BookingCalendarRow,
} from "./booking-calendar-events";

export type BookingCalendarMode = "researcher" | "manager";

type BookingCalendarProps = {
  orgId: string;
  labId: string;
  mode: BookingCalendarMode;
};

async function fetchAllBookings(
  path: string,
  orgId: string,
  params: Record<string, string>
): Promise<BookingCalendarRow[]> {
  const rows: BookingCalendarRow[] = [];
  let page: ApiPage<BookingCalendarRow> = await apiClient.list(path, { orgId, params });
  rows.push(...page.results);
  while (page.next) {
    page = await apiClient.list(path, { orgId, pageUrl: page.next });
    rows.push(...page.results);
  }
  return rows;
}

export function BookingCalendar({ orgId, labId, mode }: BookingCalendarProps) {
  const [events, setEvents] = useState<IEvent<BookingCalendarRow>[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchedRanges, setFetchedRanges] = useState<Set<string>>(new Set());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [detailEvent, setDetailEvent] = useState<IEvent<BookingCalendarRow> | null>(null);

  const listPath =
    mode === "manager"
      ? endpoints.machines.labReservations(labId)
      : endpoints.machines.userReservations;

  const loadRange = useCallback(
    async (anchor: Date) => {
      const from = startOfWeek(startOfMonth(anchor), { weekStartsOn: 0 }).toISOString();
      const to = endOfWeek(endOfMonth(anchor), { weekStartsOn: 0 }).toISOString();
      const rangeKey = `${from}|${to}`;
      if (fetchedRanges.has(rangeKey)) return;

      setLoading(true);
      try {
        const params: Record<string, string> = { from, to };
        if (mode === "researcher") {
          params.lab_id = labId;
        }
        const rows = await fetchAllBookings(listPath, orgId, params);
        const mapped = reservationsToCalendarEvents(rows);

        setEvents((current) => {
          const byId = new Map(current.map((event) => [String(event.id), event]));
          for (const event of mapped) {
            byId.set(String(event.id), event);
          }
          return Array.from(byId.values());
        });
        setFetchedRanges((prev) => new Set(prev).add(rangeKey));
      } catch (error) {
        toast.error(normalizeApiError(error).message);
      } finally {
        setLoading(false);
      }
    },
    [fetchedRanges, labId, listPath, mode, orgId]
  );

  const handleCurrentDateChange = useCallback(
    (date: Date) => {
      void loadRange(date);
    },
    [loadRange]
  );

  const handleGetMonthsEvents = useCallback(
    async (dates: Date[]) => {
      for (const date of dates) {
        await loadRange(date);
      }
    },
    [loadRange]
  );

  const daySchedule = useMemo(() => {
    if (!selectedDay) return [];
    return eventsOnDate(events, selectedDay);
  }, [events, selectedDay]);

  const machinesPath = `/${orgId}/lab/${labId}/machine`;
  const approvalsPath = `/${orgId}/lab/${labId}/approval`;

  return (
    <div className="space-y-4">
      <PremiumSurface className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
        <div className="flex items-start gap-3">
          <CalendarDays className="mt-0.5 size-5 text-teal-600" />
          <div>
            <p className="font-medium text-slate-900 dark:text-white">
              {mode === "manager" ? "Lab booking calendar" : "My booking calendar"}
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              Month view shows all bookings. Click a date for the day list and timeline below.
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <LegendDot color="green" label="Approved" />
              <LegendDot color="yellow" label="Pending" />
              <LegendDot color="red" label="Rejected" />
              <LegendDot color="gray" label="Cancelled" />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {mode === "researcher" ? (
            <Button asChild>
              <Link to={machinesPath}>Book a slot</Link>
            </Button>
          ) : (
            <Button asChild variant="secondary">
              <Link to={approvalsPath}>Pending approvals</Link>
            </Button>
          )}
        </div>
      </PremiumSurface>

      <div className="relative min-h-[640px] rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        {loading ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-slate-950/60">
            <Loader2 className="size-8 animate-spin text-teal-600" />
          </div>
        ) : null}
        <CalendarProvider
          events={events}
          handleCurrentDateChange={handleCurrentDateChange}
          handleAddEvent={() => {}}
          handleEditEvent={setDetailEvent}
          canCreateEvent={false}
          handleGetMonthsEvents={handleGetMonthsEvents}
          loading={loading}
          handleBookNow={() => {}}
        >
          <div className="h-[min(72vh,720px)] p-2">
            <ClientContainer
              eventName={mode === "manager" ? "Lab bookings" : "My bookings"}
              showBookNow={false}
              onDateSelect={setSelectedDay}
            />
          </div>
        </CalendarProvider>
      </div>

      <Dialog open={Boolean(selectedDay)} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedDay ? format(selectedDay, "EEEE, MMMM d, yyyy") : "Day schedule"}
            </DialogTitle>
            <DialogDescription>
              {daySchedule.length === 0
                ? "No bookings on this day."
                : `${daySchedule.length} booking(s) scheduled.`}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {daySchedule.map((event) => (
              <button
                key={`${event.id}-${event.startDate.toISOString()}`}
                type="button"
                className="w-full rounded-xl border border-slate-200 p-3 text-left transition hover:border-teal-300 hover:bg-teal-50/50 dark:border-slate-700 dark:hover:border-teal-800 dark:hover:bg-teal-950/20"
                onClick={() => {
                  setDetailEvent(event);
                  setSelectedDay(null);
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-slate-900 dark:text-white">{event.title}</p>
                  <StatusBadge>{String(event.meta?.status ?? "")}</StatusBadge>
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {formatLocalDateTime(event.startDate.toISOString())} –{" "}
                  {formatLocalDateTime(event.endDate.toISOString())}
                </p>
                {event.description ? (
                  <p className="mt-1 text-xs text-slate-500">{event.description}</p>
                ) : null}
              </button>
            ))}
          </div>
          {mode === "researcher" && selectedDay ? (
            <Button asChild className="w-full">
              <Link to={machinesPath}>Book another slot</Link>
            </Button>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(detailEvent)} onOpenChange={(open) => !open && setDetailEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{detailEvent?.title}</DialogTitle>
            <DialogDescription>Booking details</DialogDescription>
          </DialogHeader>
          {detailEvent?.meta ? (
            <dl className="space-y-2 text-sm">
              <DetailRow label="Status" value={String(detailEvent.meta.status ?? "—")} />
              <DetailRow
                label="From"
                value={formatLocalDateTime(String(detailEvent.meta.booked_from))}
              />
              <DetailRow
                label="Till"
                value={formatLocalDateTime(String(detailEvent.meta.booked_till))}
              />
              <DetailRow label="Notes" value={String(detailEvent.meta.notes ?? "—")} />
            </dl>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
      <span
        className="size-2 rounded-full"
        style={{
          background:
            color === "green"
              ? "#16a34a"
              : color === "yellow"
                ? "#ca8a04"
                : color === "red"
                  ? "#dc2626"
                  : "#94a3b8",
        }}
      />
      {label}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-900 dark:text-white">{value}</dd>
    </div>
  );
}
