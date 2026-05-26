import { useMemo } from "react";

import { format, getDaysInMonth, isSameDay, startOfMonth } from "date-fns";
import { Loader2 } from "lucide-react";
import { useCalendar } from "../../contexts/calendar-context";
import { IEvent } from "../../interfaces";
import { YearViewDayCell } from "./year-view-day-cell";

interface IProps {
  month: Date;
  events: IEvent[];
  handleMonthClick: (month: Date) => void;
  handleDateClick: (month: Date) => void;
}

export function YearViewMonth({
  month,
  events,
  handleMonthClick,
  handleDateClick,
}: IProps) {
  const { loading, setSelectedDate } = useCalendar();

  const monthName = format(month, "MMMM");

  const daysInMonth = useMemo(() => {
    const totalDays = getDaysInMonth(month);
    const firstDay = startOfMonth(month).getDay();

    const days = Array.from({ length: totalDays }, (_, i) => i + 1);
    const blanks = Array(firstDay).fill(null);

    return [...blanks, ...days];
  }, [month]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleClick = () => {
    const d = new Date(month.getFullYear(), month.getMonth(), 1);
    setSelectedDate(d);
    handleMonthClick(d);
  };

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={handleClick}
        className="w-full rounded-t-lg border px-3 py-2 text-sm font-semibold hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {monthName}
      </button>

      <div className="flex-1 space-y-2 rounded-b-lg border border-t-0 p-3 relative">
        <div className="grid grid-cols-7 gap-x-0.5 text-center">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className="text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-x-0.5 gap-y-2 relative">
          {daysInMonth.map((day, index) => {
            if (day === null)
              return <div key={`blank-${index}`} className="h-10" />;

            const date = new Date(month.getFullYear(), month.getMonth(), day);
            const dayEvents = events.filter(
              (event) =>
                isSameDay(event.startDate, date) ||
                isSameDay(event.endDate, date),
            );

            return (
              <YearViewDayCell
                key={`day-${day}`}
                day={day}
                date={date}
                events={dayEvents}
                handleDateClick={handleDateClick}
              />
            );
          })}
        </div>
        {loading && (
          <div className="absolute inset-0 bg-background opacity-30 rounded flex items-center justify-center">
            <Loader2 className="animate-spin " size={40} />
          </div>
        )}
      </div>
    </div>
  );
}
