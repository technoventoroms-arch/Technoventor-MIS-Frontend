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
import { format } from "date-fns";
import { CalendarIcon, Info } from "lucide-react";
import { ComponentProps } from "react";
import { DayPicker } from "react-day-picker";
import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import { Calendar } from "../ui/calendar";

type Props = {
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  datePickerProps?: ComponentProps<typeof DayPicker>;
};

const ControlledDatePicker = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  label,
  placeholder,
  disabled,
  description,
  datePickerProps = {},
  ...props
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & Props) => {
  return (
    <FormField
      {...props}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          {label && <FormLabel>{label}</FormLabel>}
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    format(field.value, "PPP")
                  ) : (
                    <span>{placeholder}</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                {...datePickerProps}
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage
            className="text-xs"
            startIcon={<Info className="size-3" />}
          />
        </FormItem>
      )}
    />
  );
};

export default ControlledDatePicker;
