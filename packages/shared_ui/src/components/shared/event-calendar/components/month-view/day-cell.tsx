import { cn } from "@mono/shared_ui/lib/utils";
import { isToday, startOfDay } from "date-fns";
import { useMemo } from "react";
import { useCalendar } from "../../contexts/calendar-context";
import { getMonthCellEvents } from "../../helpers";
import { ICalendarCell, IEvent } from "../../interfaces";
import { EventBullet } from "./event-bullet";
import { MonthEventBadge } from "./month-event-badge";

interface IProps {
  cell: ICalendarCell;
  events: IEvent[];
  eventPositions: Record<string, number>;
  handleCellClick: () => void;
  isLastWeek: boolean;
}

const MAX_VISIBLE_EVENTS = 3;

export function DayCell({
  cell,
  events,
  eventPositions,
  handleCellClick,
  isLastWeek,
}: IProps) {
  const { setSelectedDate } = useCalendar();

  const { day, currentMonth, date } = cell;

  const cellEvents = useMemo(
    () => getMonthCellEvents(date, events, eventPositions),
    [date, events, eventPositions],
  );
  const isSunday = date.getDay() === 0;

  const handleClick = () => {
    handleCellClick();
    setSelectedDate(date);
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col gap-1 border-l border-t py-1.5 lg:pb-2 lg:pt-1 min-h-[90px]",
        isSunday && "border-l-0",
        isLastWeek && "border-b",
      )}
    >
      <button
        onClick={handleClick}
        className={cn(
          "flex size-6 translate-x-1 items-center justify-center rounded-full text-xs font-semibold hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring lg:px-2 cursor-pointer",
          !currentMonth && "opacity-20",
          isToday(date) &&
            "bg-primary font-bold text-primary-foreground hover:bg-primary",
        )}
      >
        {day}
      </button>

      <div
        className={cn(
          "flex h-6 gap-1 px-2 lg:h-[94px] lg:flex-col lg:gap-2 lg:px-0",
          !currentMonth && "opacity-50",
        )}
      >
        {[0, 1, 2].map((position) => {
          const event = cellEvents.find((e) => e.position === position);
          const eventKey = event
            ? `event-${event.id}-${position}`
            : `empty-${position}`;

          return (
            <div key={eventKey} className="">
              {event && (
                <>
                  <EventBullet className="lg:hidden" color={event.color} />
                  <MonthEventBadge
                    className="hidden lg:flex"
                    event={event}
                    cellDate={startOfDay(date)}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>

      {cellEvents.length > MAX_VISIBLE_EVENTS && (
        <div
          className={cn(
            "h-4.5 px-1.5 text-xs font-semibold text-muted-foreground",
            !currentMonth && "opacity-50",
          )}
        >
          <span className="sm:hidden">
            +{cellEvents.length - MAX_VISIBLE_EVENTS}
          </span>
          <span className="hidden sm:inline">
            {" "}
            {cellEvents.length - MAX_VISIBLE_EVENTS} more...
          </span>
        </div>
      )}
    </div>
  );
}
