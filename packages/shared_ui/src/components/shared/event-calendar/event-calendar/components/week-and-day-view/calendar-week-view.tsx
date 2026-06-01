import { cn } from "@mono/shared_ui/lib/utils";
import {
  startOfWeek,
  addDays,
  format,
  isSameDay,
  areIntervalsOverlapping,
} from "date-fns";
import { useCalendar } from "../../contexts/calendar-context";
import {
  getVisibleHours,
  groupEvents,
  isWorkingHour,
  getEventBlockStyle,
} from "../../helpers";
import { IEvent } from "../../interfaces";
import { CalendarTimeline } from "./calendar-time-line";
import { EventBlock } from "./event-block";
import { WeekViewMultiDayEventsRow } from "./week-view-multi-day-events-row";
import { ScrollArea } from "@mono/shared_ui/components/ui/scroll-area";
import { AddEeventButton } from "../add-event-button";

interface IProps {
  singleDayEvents: IEvent[];
  multiDayEvents: IEvent[];
}

export function CalendarWeekView({ singleDayEvents, multiDayEvents }: IProps) {
  const {
    selectedDate,
    workingHours,
    visibleHours,
    handleAddEvent,
    canCreateEvent,
    minAllowedDateTime,
    updateMinAllowedDateTime,
  } = useCalendar();

  const { hours, earliestEventHour, latestEventHour } = getVisibleHours(
    visibleHours,
    singleDayEvents,
  );

  const weekStart = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="flex-1 overflow-hidden">
      <div className="grid grid-cols-[1fr_auto] grid-rows-[1fr] h-full">
        <div className="flex flex-col items-center justify-center border-b py-4 text-sm text-muted-foreground sm:hidden">
          <p>Weekly view is not available on smaller devices.</p>
          <p>Please switch to daily or monthly view.</p>
        </div>

        <div className="flex-1 hidden flex-col sm:flex overflow-hidden">
          <div>
            <WeekViewMultiDayEventsRow
              selectedDate={selectedDate}
              multiDayEvents={multiDayEvents}
            />

            {/* Week header */}
            <div className="relative z-20 flex border-b">
              <div className="w-18"></div>
              <div className="grid flex-1 grid-cols-7 divide-x border-l">
                {weekDays.map((day, index) => (
                  <span
                    key={index}
                    className="py-2 text-center text-xs font-medium text-muted-foreground"
                  >
                    {format(day, "EE")}{" "}
                    <span className="ml-1 font-semibold text-foreground">
                      {format(day, "d")}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-1 overflow-hidden">
            <ScrollArea key={"week"} className="h-full w-full" type="always">
              <div className="flex overflow-hidden">
                {/* Hours column */}
                <div className="relative w-18">
                  {hours.map((hour, index) => (
                    <div
                      key={hour}
                      className="relative"
                      style={{ height: "96px" }}
                    >
                      <div className="absolute -top-3 right-2 flex h-6 items-center">
                        {index !== 0 && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date().setHours(hour, 0, 0, 0), "hh a")}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Week grid */}
                <div className="relative flex-1 border-l">
                  <div className="grid grid-cols-7 divide-x">
                    {weekDays.map((day, dayIndex) => {
                      const dayEvents = singleDayEvents.filter(
                        (event) =>
                          isSameDay(event.startDate, day) ||
                          isSameDay(event.endDate, day),
                      );
                      const groupedEvents = groupEvents(dayEvents);

                      return (
                        <div key={dayIndex} className="relative">
                          {hours.map((hour, index) => {
                            const isDisabled = !isWorkingHour(
                              day,
                              hour,
                              workingHours,
                            );

                            return (
                              <div
                                key={hour}
                                className={cn(
                                  "relative",
                                  isDisabled && "bg-calendar-disabled-hour",
                                )}
                                style={{ height: "96px" }}
                              >
                                {index !== 0 && (
                                  <div className="pointer-events-none absolute inset-x-0 top-0 border-b"></div>
                                )}

                                <AddEeventButton
                                  canCreateEvent={canCreateEvent}
                                  hour={hour}
                                  minutes={0}
                                  handleAddEvent={handleAddEvent}
                                  selectedDate={day}
                                  className="absolute inset-x-0 top-0 h-[24px] cursor-pointer transition-colors hover:bg-accent"
                                  minAllowedDateTime={minAllowedDateTime}
                                  updateMinAllowedDateTime={
                                    updateMinAllowedDateTime
                                  }
                                />

                                <AddEeventButton
                                  canCreateEvent={canCreateEvent}
                                  hour={hour}
                                  minutes={15}
                                  handleAddEvent={handleAddEvent}
                                  selectedDate={day}
                                  className="absolute inset-x-0 top-[24px] h-[24px] cursor-pointer transition-colors hover:bg-accent"
                                  minAllowedDateTime={minAllowedDateTime}
                                  updateMinAllowedDateTime={
                                    updateMinAllowedDateTime
                                  }
                                />
                                <div className="pointer-events-none absolute inset-x-0 top-1/2 border-b border-dashed"></div>

                                <AddEeventButton
                                  canCreateEvent={canCreateEvent}
                                  hour={hour}
                                  minutes={30}
                                  handleAddEvent={handleAddEvent}
                                  selectedDate={day}
                                  className="absolute inset-x-0 top-[48px] h-[24px] cursor-pointer transition-colors hover:bg-accent"
                                  minAllowedDateTime={minAllowedDateTime}
                                  updateMinAllowedDateTime={
                                    updateMinAllowedDateTime
                                  }
                                />

                                <AddEeventButton
                                  canCreateEvent={canCreateEvent}
                                  hour={hour}
                                  minutes={45}
                                  handleAddEvent={handleAddEvent}
                                  selectedDate={day}
                                  className="absolute inset-x-0 top-[72px] h-[24px] cursor-pointer transition-colors hover:bg-accent"
                                  minAllowedDateTime={minAllowedDateTime}
                                  updateMinAllowedDateTime={
                                    updateMinAllowedDateTime
                                  }
                                />
                              </div>
                            );
                          })}

                          {groupedEvents.map((group, groupIndex) =>
                            group.map((event) => {
                              let style = getEventBlockStyle(
                                event,
                                day,
                                groupIndex,
                                groupedEvents.length,
                                {
                                  from: earliestEventHour,
                                  to: latestEventHour,
                                },
                              );
                              const hasOverlap = groupedEvents.some(
                                (otherGroup, otherIndex) =>
                                  otherIndex !== groupIndex &&
                                  otherGroup.some((otherEvent) =>
                                    areIntervalsOverlapping(
                                      {
                                        start: event.startDate,
                                        end: event.endDate,
                                      },
                                      {
                                        start: otherEvent.startDate,
                                        end: otherEvent.endDate,
                                      },
                                    ),
                                  ),
                              );

                              if (!hasOverlap)
                                style = { ...style, width: "100%", left: "0%" };

                              return (
                                <div
                                  key={event.id}
                                  className="absolute p-1"
                                  style={style}
                                >
                                  <EventBlock event={event} />
                                </div>
                              );
                            }),
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <CalendarTimeline
                    firstVisibleHour={earliestEventHour}
                    lastVisibleHour={latestEventHour}
                  />
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
