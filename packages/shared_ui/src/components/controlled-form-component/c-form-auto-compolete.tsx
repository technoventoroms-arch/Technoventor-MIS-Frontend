import { Button } from "@mono/shared_ui/components/ui/button";
import {
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
import { ChevronsUpDown, Info, X } from "lucide-react";
import { useState } from "react";
import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import GenericCombobox, {
  GenericComboBoxProps,
} from "../shared/generic-combobox";

interface Props<O> {
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  loading: boolean;
  options: O[];
  getItemLabel: (option: O) => string;
  getItemValue: (option: O) => string;
  onDebouncedChange?: (text: string) => void;
  onChange?: (text: string) => void;
  emptyText: string;
  formItemClassName?: string;
  popoverTriggerClassname?: string;
  comboboxProps?: Partial<GenericComboBoxProps<O>>;
  showClearBtn?: boolean;
}

const ControlledAutocomplete = <
  O,
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  label,
  placeholder,
  disabled,
  loading,
  getItemLabel,
  getItemValue,
  options,
  onDebouncedChange,
  onChange,
  emptyText,
  formItemClassName,
  comboboxProps,
  popoverTriggerClassname,
  showClearBtn = true,
  ...props
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & Props<O>) => {
  const [open, setOpen] = useState(false);

  const handleTextChange = (e: string) => {
    onChange?.(e);
  };

  return (
    <FormField
      {...props}
      render={({ field }) => (
        <>
          <FormItem className={cn("h-8", formItemClassName)}>
            {label && <FormLabel>{label}</FormLabel>}
            <Popover open={open} onOpenChange={setOpen}>
              <div
                className={cn(
                  "w-full text-left font-normal flex items-center",
                  !field.value && "text-muted-foreground"
                )}
              >
                <PopoverTrigger asChild>
                  <Button
                    disabled={field.disabled}
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-auto flex-1 flex justify-between",
                      popoverTriggerClassname
                    )}
                  >
                    {(field?.value && getItemLabel(field?.value)) ||
                      placeholder ||
                      "Type to search"}
                    <ChevronsUpDown className="opacity-50 justify-self-end" />
                  </Button>
                </PopoverTrigger>
                {!!field.value && showClearBtn && (
                  <Button
                    disabled={field.disabled}
                    type="button"
                    variant={"outline"}
                    className="ml-2"
                    onClick={() => field.onChange(null)}
                  >
                    <X />
                  </Button>
                )}
              </div>
              <PopoverContent className="w-auto p-0">
                <GenericCombobox
                  {...comboboxProps}
                  loading={loading}
                  options={options}
                  getItemLabel={getItemLabel}
                  getItemValue={getItemValue}
                  emptyText={emptyText}
                  onTextChange={handleTextChange}
                  onChange={(item) => {
                    field.onChange(item);
                    setOpen(false);
                  }}
                  onDebouncedChange={onDebouncedChange}
                  disabled={disabled}
                  placeholder={placeholder}
                  value={field.value}
                />
              </PopoverContent>
            </Popover>
            <FormMessage
              className="text-xs"
              startIcon={<Info className="size-3" />}
            />
          </FormItem>
        </>
      )}
    />
  );
};

export default ControlledAutocomplete;
