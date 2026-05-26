import { cn } from "@mono/shared_ui/lib/utils";
import { areIntervalsOverlapping, format } from "date-fns";

import { useCalendar } from "../../contexts/calendar-context";
import {
  getBlockedSlots,
  getEventBlockStyle,
  getVisibleHours,
  groupEvents,
  isWorkingHour,
} from "../../helpers";
import { IEvent } from "../../interfaces";

import { Calendar as SCalender } from "@mono/shared_ui/components/ui/calendar";
import { ScrollArea } from "@mono/shared_ui/components/ui/scroll-area";
import { AddEeventButton } from "../add-event-button";
import { CalendarTimeline } from "./calendar-time-line";
import { DayViewMultiDayEventsRow } from "./day-view-multi-day-events-row";
import { EventBlock } from "./event-block";
import { useMemo } from "react";

interface IProps {
  singleDayEvents: IEvent[];
  multiDayEvents: IEvent[];
}

export function CalendarDayView({ singleDayEvents, multiDayEvents }: IProps) {
  const {
    selectedDate,
    setSelectedDate,
    visibleHours,
    workingHours,
    handleAddEvent,
    minAllowedDateTime,
    canCreateEvent,
    updateMinAllowedDateTime,
  } = useCalendar();

  const { hours, earliestEventHour, latestEventHour } = getVisibleHours(
    visibleHours,
    singleDayEvents,
  );

  const dayEvents = singleDayEvents.filter((event) => {
    const eventDate = event.startDate;
    return (
      eventDate.getDate() === selectedDate.getDate() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  const groupedEvents = groupEvents(dayEvents);
  const reserveredHours = useMemo(() => {
    const result: any[] = [];
    dayEvents.forEach((e) => {
      result.push(getBlockedSlots(e.startDate, e.endDate));
    });
    return result.reduce((prev, curr) => {
      return { ...prev, ...curr };
    }, {});
  }, [workingHours, selectedDate, hours]);

  return (
    <div className="flex-1 overflow-hidden">
      <div className="grid grid-cols-[1fr_auto] grid-rows-[1fr] h-full">
        <div className="flex-1 h-full flex-col flex overflow-hidden">
          <div>
            <DayViewMultiDayEventsRow
              selectedDate={selectedDate}
              multiDayEvents={multiDayEvents}
            />

            {/* Day header */}
            <div className="relative z-20 flex border-b">
              <div className="w-18"></div>
              <span className="flex-1 border-l py-2 text-center text-xs font-medium text-muted-foreground">
                {format(selectedDate, "MMM EE")}{" "}
                <span className="font-semibold text-foreground">
                  {format(selectedDate, "d")}
                </span>
              </span>
            </div>
          </div>
          <div className="flex flex-1 overflow-hidden">
            <ScrollArea className="h-full w-full" type="always">
              <div className="flex">
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

                {/* Day grid */}
                <div className="relative flex-1 border-l">
                  <div className="relative">
                    {hours.map((hour, index) => {
                      const isDisabled = !isWorkingHour(
                        selectedDate,
                        hour,
                        workingHours,
                      );
                      const isReserved = reserveredHours[hour] || {};
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

                          {!isReserved[0] && (
                            <AddEeventButton
                              canCreateEvent={canCreateEvent}
                              className="absolute inset-x-0 top-0 h-[24px] cursor-pointer transition-colors hover:bg-accent"
                              hour={hour}
                              minutes={0}
                              handleAddEvent={handleAddEvent}
                              selectedDate={selectedDate}
                              minAllowedDateTime={minAllowedDateTime}
                              updateMinAllowedDateTime={
                                updateMinAllowedDateTime
                              }
                            ></AddEeventButton>
                          )}

                          {!isReserved[15] && (
                            <AddEeventButton
                              canCreateEvent={canCreateEvent}
                              hour={hour}
                              minutes={15}
                              handleAddEvent={handleAddEvent}
                              selectedDate={selectedDate}
                              className="absolute inset-x-0 top-[24px] h-[24px] cursor-pointer transition-colors hover:bg-accent"
                              minAllowedDateTime={minAllowedDateTime}
                              updateMinAllowedDateTime={
                                updateMinAllowedDateTime
                              }
                            />
                          )}
                          <div className="pointer-events-none absolute inset-x-0 top-1/2 border-b border-dashed"></div>

                          {!isReserved[30] && (
                            <AddEeventButton
                              canCreateEvent={canCreateEvent}
                              hour={hour}
                              minutes={30}
                              handleAddEvent={handleAddEvent}
                              selectedDate={selectedDate}
                              className="absolute inset-x-0 top-[48px] h-[24px] cursor-pointer transition-colors hover:bg-accent"
                              minAllowedDateTime={minAllowedDateTime}
                              updateMinAllowedDateTime={
                                updateMinAllowedDateTime
                              }
                            />
                          )}

                          {!isReserved[45] && (
                            <AddEeventButton
                              canCreateEvent={canCreateEvent}
                              hour={hour}
                              minutes={45}
                              handleAddEvent={handleAddEvent}
                              selectedDate={selectedDate}
                              className="absolute inset-x-0 top-[72px] h-[24px] cursor-pointer transition-colors hover:bg-accent"
                              minAllowedDateTime={minAllowedDateTime}
                              updateMinAllowedDateTime={
                                updateMinAllowedDateTime
                              }
                            />
                          )}
                        </div>
                      );
                    })}

                    {groupedEvents.map((group, groupIndex) =>
                      group.map((event) => {
                        let style = getEventBlockStyle(
                          event,
                          selectedDate,
                          groupIndex,
                          groupedEvents.length,
                          { from: earliestEventHour, to: latestEventHour },
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

                  <CalendarTimeline
                    firstVisibleHour={earliestEventHour}
                    lastVisibleHour={latestEventHour}
                  />
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="hidden w-64 divide-y border-l md:block">
          <SCalender
            className="mx-auto w-fit"
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            initialFocus
          />
        </div>
      </div>
    </div>
  );
}
