import type { TEventColor } from "./types";

export interface IEvent<T = any> {
  id: number;
  startDate: Date;
  endDate: Date;
  title: string;
  color: TEventColor;
  description: string;
  meta?: T;
}

export interface ICalendarCell {
  day: number;
  currentMonth: boolean;
  date: Date;
}
