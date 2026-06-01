import { useEffect, useMemo } from "react";
import { addMonths, startOfYear } from "date-fns";
import { useCalendar } from "../../contexts/calendar-context";
import { IEvent } from "../../interfaces";
import { YearViewMonth } from "./year-view-month";

interface IProps {
  allEvents: IEvent[];
  handleMonthClick: (month: Date) => void;
  handleDateClick: (month: Date) => void;
}

export function CalendarYearView({
  allEvents,
  handleMonthClick,
  handleDateClick,
}: IProps) {
  const { selectedDate, getEventsForMonth } = useCalendar();

  const months = useMemo(() => {
    const yearStart = startOfYear(selectedDate);
    return Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i));
  }, [selectedDate]);
  useEffect(() => {
    if (months.length > 0) {
      getEventsForMonth(months);
    }
  }, [months]);
  return (
    <div className="flex-1 overflow-hidden">
      <div className="grid grid-cols-[1fr_auto] grid-rows-[1fr] h-full">
        <div className="p-4 h-full overflow-auto">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {months.map((month) => (
              <YearViewMonth
                key={month.toString()}
                month={month}
                events={allEvents}
                handleMonthClick={handleMonthClick}
                handleDateClick={handleDateClick}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
