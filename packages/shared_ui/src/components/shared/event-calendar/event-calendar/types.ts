import { IEvent } from "./interfaces";

export type TCalendarView = "day" | "week" | "month" | "year" | "agenda";
export type TEventColor =
  | "blue"
  | "green"
  | "red"
  | "yellow"
  | "purple"
  | "orange"
  | "gray";
export type TBadgeVariant = "dot" | "colored" | "mixed";
export type TWorkingHours = { [key: number]: { from: number; to: number } };
export type TVisibleHours = { from: number; to: number };

export interface EventDialogProps<T> {
  event: IEvent<T> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: IEvent) => Promise<void>;
  onDelete: (eventId: string) => Promise<void>;
  allEvents: IEvent<T>[];
}
