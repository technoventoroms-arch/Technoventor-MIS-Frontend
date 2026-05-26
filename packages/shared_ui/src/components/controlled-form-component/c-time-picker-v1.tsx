"use client";

import { format } from "date-fns";
import {
  ControllerProps,
  FieldPath,
  FieldValues,
  useFormContext,
  useWatch,
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
import { cn } from "@mono/shared_ui/lib/utils";
import { ClockIcon } from "lucide-react";
import { useMemo } from "react";
import { DayPicker } from "react-day-picker";
import { Calendar } from "../ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@mono/shared_ui/components/ui/select";

type Props = {
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  minLimit?: Date;
  maxLimit?: Date;
  datePickerProps?: React.ComponentProps<typeof DayPicker>;
  enableDatePicker?: boolean;
  onTimeSelect?: (time: Date) => void;
  interval?:number
};

const ControlledTimePickerV1 = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  label,
  placeholder,
  disabled,
  description,
  name,
  minLimit,
  maxLimit,
  enableDatePicker = true,
  datePickerProps = {},
  onTimeSelect,interval,
  ...props
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & Props) => {
  const form = useFormContext();

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
  const value = useWatch({ control: form.control, name });

  const { amHours, pmHours } = useMemo(() => {
    const start = minLimit?.getHours() ?? 0;
    let end = 23;
    if (maxLimit?.toDateString() === value?.toDateString() && maxLimit) {
      end = maxLimit?.getHours();
    }

    const hours = Array.from(
      { length: (end <= 0 ? 23 : end) - start + 1 },
      (_, i) => start + i,
    );

    const amHours = hours.filter((h) => h < 12);
    const pmHours = hours.filter((h) => h >= 12);

    return { amHours, pmHours };
  }, [minLimit?.getHours(), maxLimit?.getHours()]);
const { minutes } = useMemo(() => {
  const selectedHour = value?.getHours();
  if (selectedHour == null) return { minutes: [] };

  const minHour = minLimit?.getHours();
  const maxHour = maxLimit?.getHours();

  let startMinute = 0;
  let endMinute = 59;

  const minuteStep = interval ?? 1; // 👈 pass this from props

  // If we're on the minimum hour, restrict start minute
  if (
    minLimit &&
    selectedHour === minHour &&
    minLimit.toDateString() === value.toDateString()
  ) {
    startMinute = minLimit.getMinutes();
  }

  // If we're on the maximum hour, restrict end minute
  if (
    maxLimit &&
    selectedHour === maxHour &&
    maxLimit.toDateString() === value.toDateString()
  ) {
    endMinute = maxLimit.getMinutes();
  }

  // Safety clamp
  startMinute = Math.max(0, startMinute);
  endMinute = Math.min(59, endMinute);

  if (endMinute < startMinute) return { minutes: [] };

  // 👇 Align start to nearest valid step
  const alignedStart =
    Math.ceil(startMinute / minuteStep) * minuteStep;

  const minutes = [];
  for (let m = alignedStart; m <= endMinute; m += minuteStep) {
    minutes.push(m);
  }

  return { minutes };
}, [
  value?.getHours(),
  minLimit?.getHours(),
  minLimit?.getMinutes(),
  maxLimit?.getHours(),
  maxLimit?.getMinutes(),
  interval, // 👈 important
]);

  const selectHour = (hour: string) => {
    const temp = value ? new Date(value) : new Date();
    temp.setHours(Number.parseInt(hour));
    if (
      temp.getHours() == maxLimit?.getHours() &&
      temp.getMinutes() > maxLimit?.getMinutes()
    ) {
      temp.setMinutes(maxLimit.getMinutes());
    }
    form.setValue(name, temp as any, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    onTimeSelect?.(temp);
  };
  const selectMinute = (hour: string) => {
    const temp = value ? new Date(value) : new Date();
    temp.setMinutes(Number.parseInt(hour));
    form.setValue(name, temp as any, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    onTimeSelect?.(temp);
  };
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
                  disabled={form.formState.disabled || disabled}
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  {field.value ? (
                    format(
                      field.value,
                      enableDatePicker ? "PPP hh:mm aa" : "hh:mm aa",
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
                      aria-description="Select to choose date"
                    />
                  )}
                  <div className="flex flex-col p-2 gap-4">
                    <div className="flex flex-col">
                      <div>Hour</div>
                      <Select
                        value={value ? value.getHours().toString() : ""}
                        onValueChange={selectHour}
                      >
                        <SelectTrigger
                          className="w-full mt-2"
                          aria-description="Select to choose hours"
                          id="start-time"
                        >
                          <SelectValue placeholder="Select Hour" />
                        </SelectTrigger>
                        <SelectContent>
                          {amHours.map((option) => (
                            <SelectItem key={option} value={option.toString()}>
                              {option == 0 ? 12 : option} AM
                            </SelectItem>
                          ))}
                          {pmHours.map((option) => (
                            <SelectItem key={option} value={option.toString()}>
                              {option == 12 ? 12 : option - 12} PM
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col">
                      <div>Minutes</div>
                      <Select
                        value={value ? value.getMinutes().toString() : ""}
                        onValueChange={selectMinute}
                      >
                        <SelectTrigger
                          className="w-full mt-2"
                          aria-description="Select to choose minutes"
                          id="end-time"
                        >
                          <SelectValue placeholder="Select Minute" />
                        </SelectTrigger>
                        <SelectContent>
                          {minutes.map((option) => (
                            <SelectItem key={option} value={option.toString()}>
                              {option < 10 ? `0${option}` : option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
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
export default ControlledTimePickerV1;
