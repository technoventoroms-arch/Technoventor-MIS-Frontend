import { Button } from "@mono/shared_ui/components/ui/button";
import { IEvent } from "../interfaces";

export const AddEeventButton = ({
  className = "",
  selectedDate,
  handleAddEvent,
  minutes = 0,
  hour = 0,
  canCreateEvent,
  minAllowedDateTime,
  updateMinAllowedDateTime,
}: {
  className: string;
  selectedDate: Date;
  handleAddEvent: (event: IEvent) => void;
  minutes: number;
  hour: number;
  canCreateEvent?: boolean;
  minAllowedDateTime: Date;
  updateMinAllowedDateTime: () => void;
}) => {
  const n = new Date(selectedDate);
  n.setHours(hour, minutes, 0, 0);
  if (minAllowedDateTime && n < minAllowedDateTime) {
    return null;
  }
  return canCreateEvent ? (
    <Button
      type="button"
      variant={"link"}
      className={className}
      onPointerEnter={updateMinAllowedDateTime}
      onMouseEnter={updateMinAllowedDateTime}
      onFocus={updateMinAllowedDateTime}
      aria-label={`Reserve machine from ${n.toLocaleTimeString()}`}
      onClick={() =>
        handleAddEvent({
          startDate: n,
          endDate: new Date(n.getTime() + 1 * 60 * 1000), // Default to 1 minutes duration
        } as any)
      }
    />
  ) : null;
};
