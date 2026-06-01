import {
  addDays,
  addMonths,
  addWeeks,
  subDays,
  subMonths,
  subWeeks,
  isSameWeek,
  isSameDay,
  isSameMonth,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  format,
  differenceInMinutes,
  eachDayOfInterval,
  startOfDay,
  differenceInDays,
  endOfYear,
  startOfYear,
  subYears,
  addYears,
  isSameYear,
  isWithinInterval,
} from "date-fns";

import type { ICalendarCell, IEvent } from "./interfaces";
import type { TCalendarView, TVisibleHours, TWorkingHours } from "./types";

// ================ Header helper functions ================ //

export function rangeText(view: TCalendarView, date: Date) {
  const formatString = "MMM d, yyyy";
  let start: Date;
  let end: Date;

  switch (view) {
    case "agenda":
      start = startOfMonth(date);
      end = endOfMonth(date);
      break;
    case "year":
      start = startOfYear(date);
      end = endOfYear(date);
      break;
    case "month":
      start = startOfMonth(date);
      end = endOfMonth(date);
      break;
    case "week":
      start = startOfWeek(date);
      end = endOfWeek(date);
      break;
    case "day":
      return format(date, formatString);
    default:
      return "Error while formatting ";
  }

  return `${format(start, formatString)} - ${format(end, formatString)}`;
}

export function navigateDate(
  date: Date,
  view: TCalendarView,
  direction: "previous" | "next",
): Date {
  const operations = {
    agenda: direction === "next" ? addMonths : subMonths,
    year: direction === "next" ? addYears : subYears,
    month: direction === "next" ? addMonths : subMonths,
    week: direction === "next" ? addWeeks : subWeeks,
    day: direction === "next" ? addDays : subDays,
  };

  return operations[view](date, 1);
}

export function getEventsCount(
  events: IEvent[],
  date: Date,
  view: TCalendarView,
): number {
  const compareFns = {
    agenda: isSameMonth,
    year: isSameYear,
    day: isSameDay,
    week: isSameWeek,
    month: isSameMonth,
  };

  return events.filter((event) =>
    compareFns[view](new Date(event.startDate), date),
  ).length;
}

// ================ Week and day view helper functions ================ //

export function getCurrentEvents(events: IEvent[]) {
  const now = new Date();
  return (
    events.filter((event) =>
      isWithinInterval(now, {
        start: event.startDate,
        end: event.endDate,
      }),
    ) || null
  );
}

export function groupEvents(dayEvents: IEvent[]) {
  const sortedEvents = dayEvents.sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime(),
  );
  const groups: IEvent[][] = [];

  for (const event of sortedEvents) {
    const eventStart = event.startDate;

    let placed = false;
    for (const group of groups) {
      const lastEventInGroup = group[group.length - 1];
      const lastEventEnd = lastEventInGroup.endDate;

      if (eventStart >= lastEventEnd) {
        group.push(event);
        placed = true;
        break;
      }
    }

    if (!placed) groups.push([event]);
  }

  return groups;
}

export function getEventBlockStyle(
  event: IEvent,
  day: Date,
  groupIndex: number,
  groupSize: number,
  visibleHoursRange?: { from: number; to: number },
) {
  const startDate = event.startDate;
  const dayStart = new Date(day.setHours(0, 0, 0, 0));
  const eventStart = startDate < dayStart ? dayStart : startDate;
  const startMinutes = differenceInMinutes(eventStart, dayStart);

  let top;

  if (visibleHoursRange) {
    const visibleStartMinutes = visibleHoursRange.from * 60;
    const visibleEndMinutes = visibleHoursRange.to * 60;
    const visibleRangeMinutes = visibleEndMinutes - visibleStartMinutes;
    top = ((startMinutes - visibleStartMinutes) / visibleRangeMinutes) * 100;
  } else {
    top = (startMinutes / 1440) * 100;
  }

  const width = 100 / groupSize;
  const left = groupIndex * width;

  return { top: `${top}%`, width: `${width}%`, left: `${left}%` };
}

export function isWorkingHour(
  day: Date,
  hour: number,
  workingHours: TWorkingHours,
) {
  const dayIndex = day.getDay() as keyof typeof workingHours;
  const dayHours = workingHours[dayIndex];
  return hour >= dayHours.from && hour < dayHours.to;
}

export function getVisibleHours(
  visibleHours: TVisibleHours,
  singleDayEvents: IEvent[],
) {
  let earliestEventHour = visibleHours.from;
  let latestEventHour = visibleHours.to;

  singleDayEvents.forEach((event) => {
    const startHour = event.startDate.getHours();
    const endTime = event.endDate;
    const endHour = endTime.getHours() + (endTime.getMinutes() > 0 ? 1 : 0);
    if (startHour < earliestEventHour) earliestEventHour = startHour;
    if (endHour > latestEventHour) latestEventHour = endHour;
  });

  latestEventHour = Math.min(latestEventHour, 24);

  const hours = Array.from(
    { length: latestEventHour - earliestEventHour },
    (_, i) => i + earliestEventHour,
  );

  return { hours, earliestEventHour, latestEventHour };
}

// ================ Month view helper functions ================ //

export function getCalendarCells(selectedDate: Date): ICalendarCell[] {
  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();

  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  const daysInPrevMonth = getDaysInMonth(currentYear, currentMonth - 1);
  const totalDays = firstDayOfMonth + daysInMonth;

  const prevMonthCells = Array.from({ length: firstDayOfMonth }, (_, i) => ({
    day: daysInPrevMonth - firstDayOfMonth + i + 1,
    currentMonth: false,
    date: new Date(
      currentYear,
      currentMonth - 1,
      daysInPrevMonth - firstDayOfMonth + i + 1,
    ),
  }));

  const currentMonthCells = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    currentMonth: true,
    date: new Date(currentYear, currentMonth, i + 1),
  }));

  const nextMonthCells = Array.from(
    { length: (7 - (totalDays % 7)) % 7 },
    (_, i) => ({
      day: i + 1,
      currentMonth: false,
      date: new Date(currentYear, currentMonth + 1, i + 1),
    }),
  );

  return [...prevMonthCells, ...currentMonthCells, ...nextMonthCells];
}

export function calculateMonthEventPositions(
  multiDayEvents: IEvent[],
  singleDayEvents: IEvent[],
  selectedDate: Date,
) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);

  const eventPositions: { [key: string]: number } = {};
  const occupiedPositions: { [key: string]: boolean[] } = {};

  eachDayOfInterval({ start: monthStart, end: monthEnd }).forEach((day) => {
    occupiedPositions[day.toISOString()] = [false, false, false];
  });

  const sortedEvents = [
    ...multiDayEvents.sort((a, b) => {
      const aDuration = differenceInDays(a.endDate, a.startDate);
      const bDuration = differenceInDays(b.endDate, b.startDate);
      return (
        bDuration - aDuration || a.startDate.getTime() - b.startDate.getTime()
      );
    }),
    ...singleDayEvents.sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime(),
    ),
  ];

  sortedEvents.forEach((event) => {
    const eventStart = event.startDate;
    const eventEnd = event.endDate;
    const eventDays = eachDayOfInterval({
      start: eventStart < monthStart ? monthStart : eventStart,
      end: eventEnd > monthEnd ? monthEnd : eventEnd,
    });

    let position = -1;

    for (let i = 0; i < 3; i++) {
      if (
        eventDays.every((day) => {
          const dayPositions = occupiedPositions[startOfDay(day).toISOString()];
          return dayPositions && !dayPositions[i];
        })
      ) {
        position = i;
        break;
      }
    }

    if (position !== -1) {
      eventDays.forEach((day) => {
        const dayKey = startOfDay(day).toISOString();
        occupiedPositions[dayKey][position] = true;
      });
      eventPositions[event.id] = position;
    }
  });

  return eventPositions;
}

export function getMonthCellEvents(
  date: Date,
  events: IEvent[],
  eventPositions: Record<string, number>,
) {
  const eventsForDate = events.filter((event) => {
    const eventStart = event.startDate;
    const eventEnd = event.endDate;
    return (
      (date >= eventStart && date <= eventEnd) ||
      isSameDay(date, eventStart) ||
      isSameDay(date, eventEnd)
    );
  });

  return eventsForDate
    .map((event) => ({
      ...event,
      position: eventPositions[event.id] ?? -1,
      isMultiDay: event.startDate !== event.endDate,
    }))
    .sort((a, b) => {
      if (a.isMultiDay && !b.isMultiDay) return -1;
      if (!a.isMultiDay && b.isMultiDay) return 1;
      return a.position - b.position;
    });
}

export function getBlockedSlots(start: Date, end: Date, interval = 15) {
  const result: Record<number, Record<number, boolean>> = {};

  const startDate = new Date(start);
  const endDate = new Date(end);

  // ⬇️ round start DOWN (8:12 → 8:00)
  startDate.setMinutes(
    Math.floor(startDate.getMinutes() / interval) * interval,
    0,
    0,
  );

  // ⬇️ round end DOWN (10:50 → 10:45)
  endDate.setMinutes(
    Math.floor(endDate.getMinutes() / interval) * interval,
    0,
    0,
  );

  const current = new Date(startDate);

  while (current < endDate) {
    const hour = current.getHours();
    const minute = current.getMinutes();

    if (!result[hour]) result[hour] = {};
    result[hour][minute] = true;

    current.setMinutes(current.getMinutes() + interval);
  }

  return result;
}

export function isInCurrentSlot(eventDateISOString: Date, interval = 15) {
  const now = new Date();
  const eventDate = new Date(eventDateISOString);

  // Must be same date
  if (
    now.getFullYear() !== eventDate.getFullYear() ||
    now.getMonth() !== eventDate.getMonth() ||
    now.getDate() !== eventDate.getDate()
  ) {
    return false;
  }

  // Must be same hour
  if (now.getHours() !== eventDate.getHours()) {
    return false;
  }

  // Get current 15-min slot start
  const currentMinutes = now.getMinutes();
  const slotStart = Math.floor(currentMinutes / interval) * interval;
  const slotEnd = slotStart + interval;

  const eventMinutes = eventDate.getMinutes();

  return eventMinutes >= slotStart && eventMinutes < slotEnd;
}
