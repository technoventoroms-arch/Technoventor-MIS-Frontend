"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { differenceInMinutes, subMinutes } from "date-fns";
import type { Dispatch, SetStateAction } from "react";
import type { IEvent } from "../interfaces";
import type { TBadgeVariant, TVisibleHours, TWorkingHours } from "../types";

interface ICalendarContext {
  selectedDate: Date;
  setSelectedDate: (date: Date | undefined) => void;

  badgeVariant: TBadgeVariant;
  setBadgeVariant: (variant: TBadgeVariant) => void;
  workingHours: TWorkingHours;
  setWorkingHours: Dispatch<SetStateAction<TWorkingHours>>;
  visibleHours: TVisibleHours;
  setVisibleHours: Dispatch<SetStateAction<TVisibleHours>>;
  events: IEvent[];

  handleAddEvent: (event: IEvent) => void;
  handleBookNow: (event: IEvent) => void;
  handleEditEvent: (event: IEvent) => void;
  canCreateEvent?: boolean;
  getEventsForMonth: (date: Date[]) => Promise<void>;
  loading: boolean;
  minAllowedDateTime: Date;
  updateMinAllowedDateTime: () => void;
}

const CalendarContext = createContext({} as ICalendarContext);

const WORKING_HOURS = {
  0: { from: 0, to: 0 },
  1: { from: 8, to: 17 },
  2: { from: 8, to: 17 },
  3: { from: 8, to: 17 },
  4: { from: 8, to: 17 },
  5: { from: 8, to: 17 },
  6: { from: 8, to: 17 },
};

const VISIBLE_HOURS = { from: 0, to: 24 };

export function CalendarProvider({
  children,
  events,
  handleCurrentDateChange,
  handleAddEvent,
  handleEditEvent,
  canCreateEvent = false,
  handleGetMonthsEvents,
  loading,
  handleBookNow,
}: {
  children: React.ReactNode;
  events: IEvent[];
  handleCurrentDateChange: (date: Date) => void;
  handleAddEvent: (event: IEvent) => void;
  handleEditEvent: (event: IEvent) => void;
  canCreateEvent?: boolean;
  handleGetMonthsEvents: (date: Date[]) => Promise<void>;
  loading: boolean;
  handleBookNow: (event: IEvent) => void;
}) {
  const [minAllowedDateTime, setMinAllowedDateTime] = useState<Date>(
    subMinutes(new Date(), 15),
  );
  const [badgeVariant, setBadgeVariant] = useState<TBadgeVariant>("colored");
  const [visibleHours, setVisibleHours] =
    useState<TVisibleHours>(VISIBLE_HOURS);
  const [workingHours, setWorkingHours] =
    useState<TWorkingHours>(WORKING_HOURS);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
  };

  useEffect(() => {
    handleCurrentDateChange(selectedDate);
  }, [selectedDate]);

  const updateMinAllowedDateTime = () => {
    if (differenceInMinutes(minAllowedDateTime, new Date()) < 15) return;
    setMinAllowedDateTime(subMinutes(new Date(), 15));
  };
  return (
    <CalendarContext.Provider
      value={{
        selectedDate,
        setSelectedDate: handleSelectDate,
        badgeVariant,
        setBadgeVariant,
        visibleHours,
        setVisibleHours,
        workingHours,
        setWorkingHours,

        events: events,
        handleAddEvent,
        handleEditEvent,
        canCreateEvent,
        getEventsForMonth: handleGetMonthsEvents,
        loading: loading,
        handleBookNow,
        minAllowedDateTime: minAllowedDateTime,
        updateMinAllowedDateTime,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar(): ICalendarContext {
  const context = useContext(CalendarContext);
  if (!context)
    throw new Error("useCalendar must be used within a CalendarProvider.");
  return context;
}
