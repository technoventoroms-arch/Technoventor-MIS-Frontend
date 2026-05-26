import { useMemo } from "react";
import { CalendarX2 } from "lucide-react";
import { format, endOfDay, startOfDay, isSameMonth } from "date-fns";
import { useCalendar } from "../../contexts/calendar-context";
import { IEvent } from "../../interfaces";
import { AgendaDayGroup } from "./agenda-day-group";
import { ScrollArea } from "@mono/shared_ui/components/ui/scroll-area";

interface IProps {
  singleDayEvents: IEvent[];
  multiDayEvents: IEvent[];
}

export function CalendarAgendaView({
  singleDayEvents,
  multiDayEvents,
}: IProps) {
  const { selectedDate } = useCalendar();

  const eventsByDay = useMemo(() => {
    const allDates = new Map<
      string,
      { date: Date; events: IEvent[]; multiDayEvents: IEvent[] }
    >();

    singleDayEvents.forEach((event) => {
      const eventDate = event.startDate;
      if (!isSameMonth(eventDate, selectedDate)) return;

      const dateKey = format(eventDate, "yyyy-MM-dd");

      if (!allDates.has(dateKey)) {
        allDates.set(dateKey, {
          date: startOfDay(eventDate),
          events: [],
          multiDayEvents: [],
        });
      }

      allDates.get(dateKey)?.events.push(event);
    });

    multiDayEvents.forEach((event) => {
      const eventStart = event.startDate;
      const eventEnd = event.endDate;

      let currentDate = startOfDay(eventStart);
      const lastDate = endOfDay(eventEnd);

      while (currentDate <= lastDate) {
        if (isSameMonth(currentDate, selectedDate)) {
          const dateKey = format(currentDate, "yyyy-MM-dd");

          if (!allDates.has(dateKey)) {
            allDates.set(dateKey, {
              date: new Date(currentDate),
              events: [],
              multiDayEvents: [],
            });
          }

          allDates.get(dateKey)?.multiDayEvents.push(event);
        }
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
      }
    });

    return Array.from(allDates.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
  }, [singleDayEvents, multiDayEvents, selectedDate]);

  const hasAnyEvents = singleDayEvents.length > 0 || multiDayEvents.length > 0;

  return (
    <div className="flex-1 overflow-hidden">
      <div className="grid grid-cols-[1fr] grid-rows-[1fr] h-full">
        <div className="flex flex-1 overflow-hidden ">
          <ScrollArea className="h-full w-full" type="always">
            <div className="space-y-6 p-4">
              {eventsByDay.map((dayGroup) => (
                <AgendaDayGroup
                  key={format(dayGroup.date, "yyyy-MM-dd")}
                  date={dayGroup.date}
                  events={dayGroup.events}
                  multiDayEvents={dayGroup.multiDayEvents}
                />
              ))}

              {!hasAnyEvents && (
                <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
                  <CalendarX2 className="size-10" />
                  <p className="text-sm md:text-base">
                    No reservation scheduled for the selected month
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
