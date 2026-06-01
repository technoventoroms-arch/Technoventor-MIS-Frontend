import { useMemo } from "react";
import { useCalendar } from "../../contexts/calendar-context";
import { getCalendarCells, calculateMonthEventPositions } from "../../helpers";
import { IEvent } from "../../interfaces";
import { DayCell } from "./day-cell";
import { cn } from "@mono/shared_ui/lib/utils";
import { ScrollArea } from "@mono/shared_ui/components/ui/scroll-area";

interface IProps {
  singleDayEvents: IEvent[];
  multiDayEvents: IEvent[];
  handleDateClick: (date: Date) => void;
}

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarMonthView({
  singleDayEvents,
  multiDayEvents,
  handleDateClick,
}: IProps) {
  const { selectedDate } = useCalendar();

  const allEvents = [...multiDayEvents, ...singleDayEvents];

  const cells = useMemo(() => getCalendarCells(selectedDate), [selectedDate]);

  const eventPositions = useMemo(
    () =>
      calculateMonthEventPositions(
        multiDayEvents,
        singleDayEvents,
        selectedDate,
      ),
    [multiDayEvents, singleDayEvents, selectedDate],
  );
  const isLastWeek = cells?.length ? cells?.length - 7 : 0;
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="grid grid-cols-7  ">
        {WEEK_DAYS.map((day, idx) => (
          <div
            key={day}
            className={cn(
              "flex items-center border-l border-b justify-center py-2",
              !idx && "border-l-0",
            )}
          >
            <span className="text-xs font-medium text-muted-foreground">
              {day}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full" type="always">
          <div className="grid grid-cols-7 overflow-hidden">
            {cells.map((cell, idx) => (
              <DayCell
                isLastWeek={idx >= isLastWeek}
                key={cell.date.toISOString()}
                cell={cell}
                events={allEvents}
                eventPositions={eventPositions}
                handleCellClick={handleDateClick}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
