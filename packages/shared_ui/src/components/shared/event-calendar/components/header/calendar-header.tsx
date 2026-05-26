// import Link from "next/link";
import {
  CalendarRange,
  Columns,
  Grid2x2,
  Grid3x3,
  List,
  PlusCircle,
} from "lucide-react";

import { Button } from "@mono/shared_ui/components/ui/button";
import { IEvent } from "../../interfaces";
import { TCalendarView } from "../../types";
import { DateNavigator } from "./date-navigator";
import { TodayButton } from "./today-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@mono/shared_ui/components/ui/tooltip";

interface IProps {
  view: TCalendarView;
  events: IEvent[];
  setView: (view: TCalendarView) => void;
  eventName?: string;
  bookNowHandler: () => void;
  canBookNow: boolean;
  showBookNow?: boolean;
}

export function CalendarHeader({
  view,
  events,
  setView,
  eventName = "Events",
  bookNowHandler,
  canBookNow,
  showBookNow,
}: IProps) {
  return (
    <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <TodayButton />
        <DateNavigator view={view} events={events} eventName={eventName} />
      </div>

      <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:justify-between">
        <div className="flex w-full items-center gap-1.5">
          {showBookNow && (
            <div>
              {canBookNow ? (
                <Button
                  aria-label="Book now"
                  variant={"green"}
                  className="rounded-r-none [&_svg]:size-5"
                  onClick={bookNowHandler}
                  disabled={!canBookNow}
                >
                  <PlusCircle strokeWidth={1.8} /> Book Now
                </Button>
              ) : (
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          aria-label="Book now"
                          variant={"green"}
                          className="rounded-r-none [&_svg]:size-5  "
                          disabled
                        >
                          <PlusCircle strokeWidth={1.8} /> Book Now
                        </Button>
                      </span>
                    </TooltipTrigger>

                    <TooltipContent
                      side="bottom"
                      variant={"yellow"}
                      className="max-w-80 text-balance font-semibold"
                    >
                      This machine has an active reservation. <br />
                      If it hasn't been used within 15 minutes of the start
                      time, you can cancel it and book now. <br />
                      Otherwise, please wait or select a future time.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}

          <div className="inline-flex first:rounded-r-none last:rounded-l-none [&:not(:first-child):not(:last-child)]:rounded-none">
            <Button
              aria-label="View by day"
              size="icon"
              variant={view === "day" ? "secondary" : "outline"}
              className="rounded-r-none [&_svg]:size-5"
              onClick={() => setView("day")}
            >
              <List strokeWidth={1.8} />
            </Button>

            <Button
              aria-label="View by week"
              size="icon"
              variant={view === "week" ? "secondary" : "outline"}
              className="-ml-px rounded-none [&_svg]:size-5"
              onClick={() => setView("week")}
            >
              <Columns strokeWidth={1.8} />
            </Button>

            <Button
              aria-label="View by month"
              size="icon"
              variant={view === "month" ? "secondary" : "outline"}
              className="-ml-px rounded-none [&_svg]:size-5"
              onClick={() => setView("month")}
            >
              <Grid2x2 strokeWidth={1.8} />
            </Button>

            <Button
              aria-label="View by year"
              size="icon"
              variant={view === "year" ? "secondary" : "outline"}
              className="-ml-px rounded-none [&_svg]:size-5"
              onClick={() => setView("year")}
            >
              <Grid3x3 strokeWidth={1.8} />
            </Button>

            <Button
              aria-label="View by agenda"
              size="icon"
              variant={view === "agenda" ? "secondary" : "outline"}
              className="-ml-px rounded-l-none [&_svg]:size-5"
              onClick={() => setView("agenda")}
            >
              <CalendarRange strokeWidth={1.8} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
