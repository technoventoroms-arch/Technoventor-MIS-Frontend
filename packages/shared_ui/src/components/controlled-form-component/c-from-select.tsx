import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@mono/shared_ui/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@mono/shared_ui/components/ui/select";
import clsx from "clsx";
import { Info } from "lucide-react";
import { ReactNode } from "react";
import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";

type Props<O> = {
  label?: string;
  placeholder?: string;
  options: O[];
  disabled?: boolean;

  className?: string;
  renderSelectOption?: (props: PropHelpers<O> & { option: O }) => ReactNode;
} & PropHelpers<O>;

type PropHelpers<O> = {
  getItemLabel: (option: O) => ReactNode;
  getItemValue: (option: O) => string;
};
const ControlledFormSelect = <
  O,
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  label,
  placeholder,
  options,
  disabled,
  getItemLabel,
  getItemValue,
  className,
  renderSelectOption,
  ...props
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & Props<O>) => {
  return (
    <FormField
      {...props}
      render={({ field }) => {
        return (
          <FormItem className="flex flex-col">
            {label && <FormLabel>{label}</FormLabel>}
            <Select
              onValueChange={(val) => {
                if (val) {
                  field.onChange(val?.toLowerCase() == "all" ? "" : val);
                }
              }}
              value={`${field.value}`}
            >
              <FormControl>
                <SelectTrigger
                  className="w-full"
                  disabled={field.disabled || disabled}
                >
                  <SelectValue
                    className={clsx("capitalize", className)}
                    placeholder={placeholder}
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {options.map((item) =>
                  renderSelectOption ? (
                    renderSelectOption({
                      getItemLabel,
                      getItemValue,
                      option: item,
                    })
                  ) : (
                    <SelectItem
                      className="capitalize"
                      value={getItemValue(item)}
                    >
                      {getItemLabel(item)}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <FormMessage
              className="text-xs"
              startIcon={<Info className="size-3" />}
            />
          </FormItem>
        );
      }}
    />
  );
};

export default ControlledFormSelect;
