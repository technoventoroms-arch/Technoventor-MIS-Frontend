"use client";

import { useMemo, useState } from "react";
import { isSameDay } from "date-fns";
import { useCalendar } from "../contexts/calendar-context";
import { TCalendarView } from "../types";
import { CalendarAgendaView } from "./agenda-view/calendar-agenda-view";
import { CalendarHeader } from "./header/calendar-header";
import { CalendarMonthView } from "./month-view/calendar-month-view";
import { CalendarDayView } from "./week-and-day-view/calendar-day-view";
import { CalendarWeekView } from "./week-and-day-view/calendar-week-view";
import { CalendarYearView } from "./year-view/calendar-year-view";

interface IProps {
  eventName?: string;
  showBookNow?: boolean;
  /** Fired when a day is chosen in month/year view (before switching to day timeline). */
  onDateSelect?: (date: Date) => void;
}

export function ClientContainer({ eventName, showBookNow, onDateSelect }: IProps) {
  const { selectedDate, events, handleBookNow } = useCalendar();
  const [view, setView] = useState<TCalendarView>("month");
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const eventStartDate = event.startDate;
      const eventEndDate = event.endDate;

      if (view === "year") {
        const yearStart = new Date(selectedDate.getFullYear(), 0, 1);
        const yearEnd = new Date(
          selectedDate.getFullYear(),
          11,
          31,
          23,
          59,
          59,
          999,
        );
        const isInSelectedYear =
          eventStartDate <= yearEnd && eventEndDate >= yearStart;

        return isInSelectedYear;
      }

      if (view === "month" || view === "agenda") {
        const monthStart = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          1,
        );
        const monthEnd = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        );
        const isInSelectedMonth =
          eventStartDate <= monthEnd && eventEndDate >= monthStart;

        return isInSelectedMonth;
      }

      if (view === "week") {
        const dayOfWeek = selectedDate.getDay();

        const weekStart = new Date(selectedDate);
        weekStart.setDate(selectedDate.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const isInSelectedWeek =
          eventStartDate <= weekEnd && eventEndDate >= weekStart;

        return isInSelectedWeek;
      }

      if (view === "day") {
        const dayStart = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          0,
          0,
          0,
        );
        const dayEnd = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          23,
          59,
          59,
        );
        const isInSelectedDay =
          eventStartDate <= dayEnd && eventEndDate >= dayStart;

        return isInSelectedDay;
      }
    });
  }, [selectedDate, events, view]);

  const singleDayEvents = filteredEvents.filter((event) => {
    const startDate = event.startDate;
    const endDate = event.endDate;
    return isSameDay(startDate, endDate);
  });

  const multiDayEvents = filteredEvents.filter((event) => {
    const startDate = event.startDate;
    const endDate = event.endDate;
    return !isSameDay(startDate, endDate);
  });

  // For year view, we only care about the start date
  // by using the same date for both start and end,
  // we ensure only the start day will show a dot
  const eventStartDates = useMemo(() => {
    return filteredEvents.map((event) => ({
      ...event,
      endDate: event.startDate,
    }));
  }, [filteredEvents]);

  const ongoingEvent = useMemo(() => {
    const now = new Date();
    return events.find(
      (event) => event.startDate <= now && event.endDate >= now,
    );
  }, [events]);

  return (
    <div className="overflow-hidden flex h-full flex-col rounded-xl border">
      <CalendarHeader
        view={view}
        events={filteredEvents}
        setView={setView}
        eventName={eventName}
        bookNowHandler={() =>
          handleBookNow({
            startDate: new Date(),
            endDate: new Date(new Date().getTime() + 1 * 60 * 1000), // Default to 1 minutes duration
          } as any)
        }
        canBookNow={!ongoingEvent}
        showBookNow={showBookNow}
      />

      {view === "day" && (
        <CalendarDayView
          singleDayEvents={singleDayEvents}
          multiDayEvents={multiDayEvents}
        />
      )}
      {view === "month" && (
        <CalendarMonthView
          singleDayEvents={singleDayEvents}
          multiDayEvents={multiDayEvents}
          handleDateClick={(date) => {
            onDateSelect?.(date);
            setView("day");
          }}
        />
      )}
      {view === "week" && (
        <CalendarWeekView
          singleDayEvents={singleDayEvents}
          multiDayEvents={multiDayEvents}
        />
      )}
      {view === "year" && (
        <CalendarYearView
          handleMonthClick={() => setView("month")}
          allEvents={eventStartDates}
          handleDateClick={(date) => {
            onDateSelect?.(date);
            setView("day");
          }}
        />
      )}
      {view === "agenda" && (
        <CalendarAgendaView
          singleDayEvents={singleDayEvents}
          multiDayEvents={multiDayEvents}
        />
      )}
    </div>
  );
}
