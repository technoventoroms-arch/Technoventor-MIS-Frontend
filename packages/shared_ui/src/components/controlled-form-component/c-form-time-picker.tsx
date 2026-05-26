"use client";

import { format } from "date-fns";
import {
  ControllerProps,
  FieldPath,
  FieldValues,
  useFormContext,
} from "react-hook-form";

import { Button } from "@mono/shared_ui/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@mono/shared_ui/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@mono/shared_ui/components/ui/popover";
import {
  ScrollArea,
  ScrollBar,
} from "@mono/shared_ui/components/ui/scroll-area";
import { cn } from "@mono/shared_ui/lib/utils";
import { ClockIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { DayPicker } from "react-day-picker";

type Props = {
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  minHour?: number;
  minMinute?: number;
  maxHour?: number;
  maxMinute?: number;
  ampm?: "AM" | "PM";
  datePickerProps?: React.ComponentProps<typeof DayPicker>;
  enableDatePicker?: boolean;
  minutesList?: number[];
};

const ControlledTimePickerForm = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  label,
  placeholder,
  disabled,
  description,
  name,
  minHour,
  minMinute,
  maxHour,
  maxMinute,
  ampm,
  enableDatePicker = true,
  datePickerProps = {},
  minutesList = Array.from({ length: 12 }, (_, i) => i * 5),
  ...props
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & Props) => {
  const form = useFormContext();
  function handleTimeChange(type: "hour" | "minute" | "ampm", value: string) {
    const temp = new Date();
    temp.setMinutes(0);

    const currentDate = form.getValues(name)
      ? new Date(form.getValues(name))
      : temp;
    let newDate = new Date(currentDate);

    if (type === "hour") {
      const hour = parseInt(value, 10);

      newDate.setHours(newDate.getHours() >= 12 ? hour + 12 : hour);
      if (newDate.getDate() != currentDate.getDate()) {
        newDate.setDate(currentDate.getDate());
      }
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value, 10));
    } else if (type === "ampm") {
      const hours = newDate.getHours();
      if (value === "AM" && hours >= 12) {
        newDate.setHours(hours - 12);
      } else if (value === "PM" && hours < 12) {
        newDate.setHours(hours + 12);
      }
    }
    form.setValue(name, newDate as any, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }
  function handleDateSelect(date: Date | undefined) {
    const temp = new Date();
    temp.setMinutes(0);

    const currentDate = form.getValues(name) || temp;

    if (date) {
      date.setHours(currentDate.getHours());
      date.setMinutes(currentDate.getMinutes());
      form.setValue(name, date as any, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }
  return (
    <FormField
      name={name}
      {...props}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label || "Enter your time (12h)"}</FormLabel>
          <Popover modal>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  disabled={form.formState.disabled}
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    format(
                      field.value,
                      enableDatePicker ? "PPP hh:mm aa" : "hh:mm aa"
                    )
                  ) : (
                    <span>hh:mm aa</span>
                  )}
                  <ClockIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <div className="sm:flex">
                <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                  {enableDatePicker && (
                    <Calendar
                      {...datePickerProps}
                      mode="single"
                      selected={field.value}
                      onSelect={handleDateSelect}
                    />
                  )}
                  <ScrollArea className="w-64 sm:w-auto">
                    <div className="flex sm:flex-col p-2">
                      {field?.value?.getHours() >= 12
                        ? Array.from({ length: 12 }, (_, i) => 12 + i + 1)
                            .reverse()
                            .map((hour) => (
                              <Button
                                key={hour}
                                size="icon"
                                variant={
                                  field.value &&
                                  field.value?.getHours() % 12 === hour % 12
                                    ? "default"
                                    : "ghost"
                                }
                                disabled={
                                  !!(minHour && hour < minHour) ||
                                  !!(maxHour && hour > maxHour)
                                }
                                className="sm:w-full shrink-0 aspect-square"
                                onClick={() =>
                                  handleTimeChange(
                                    "hour",
                                    (hour - 12).toString()
                                  )
                                }
                              >
                                {hour - 12}
                              </Button>
                            ))
                        : Array.from({ length: 12 }, (_, i) => i + 1)
                            .reverse()
                            .map((hour) => (
                              <Button
                                key={hour}
                                size="icon"
                                variant={
                                  field.value &&
                                  field.value?.getHours() % 12 === hour % 12
                                    ? "default"
                                    : "ghost"
                                }
                                disabled={
                                  !!(minHour && hour < minHour) ||
                                  !!(maxHour && hour > maxHour)
                                }
                                className="sm:w-full shrink-0 aspect-square"
                                onClick={() =>
                                  handleTimeChange("hour", hour.toString())
                                }
                              >
                                {hour}
                              </Button>
                            ))}
                    </div>
                    <ScrollBar orientation="horizontal" className="sm:hidden" />
                  </ScrollArea>
                  <ScrollArea className="w-64 sm:w-auto">
                    <div className="flex sm:flex-col p-2">
                      {minutesList.map((minute) => (
                        <Button
                          key={minute}
                          size="icon"
                          variant={
                            field.value && field.value.getMinutes() === minute
                              ? "default"
                              : "ghost"
                          }
                          className="sm:w-full shrink-0 aspect-square"
                          onClick={() =>
                            handleTimeChange("minute", minute.toString())
                          }
                          disabled={
                            !!(minHour && minute <= minHour) ||
                            !!(maxHour && minute >= maxHour)
                          }
                        >
                          {minute.toString().padStart(2, "0")}
                        </Button>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" className="sm:hidden" />
                  </ScrollArea>
                  <ScrollArea className="">
                    <div className="flex sm:flex-col p-2">
                      {["AM", "PM"].map((ampm) => (
                        <Button
                          key={ampm}
                          size="icon"
                          variant={
                            field.value &&
                            ((ampm === "AM" && field.value.getHours() < 12) ||
                              (ampm === "PM" && field.value.getHours() >= 12))
                              ? "default"
                              : "ghost"
                          }
                          className="sm:w-full shrink-0 aspect-square"
                          onClick={() => handleTimeChange("ampm", ampm)}
                        >
                          {ampm}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <FormDescription>Please select your preferred time.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
export default ControlledTimePickerForm;
