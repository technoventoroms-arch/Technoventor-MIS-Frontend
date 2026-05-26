import { cn, debounce } from "@mono/shared_ui/lib/utils";
import { Check, Loader } from "lucide-react";
import { ReactNode, useMemo } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";

export type GenericComboBoxProps<O> = {
  placeholder?: string;
  disabled?: boolean;
  loading: boolean;
  options: O[];
  getItemLabel: (option: O) => string;
  getItemValue: (option: O) => string;
  onDebouncedChange?: (text: string) => void;
  onChange?: (data: O) => void;
  onTextChange?: (text: string) => void;
  emptyText: string;
  closeOnSelect?: (state: boolean) => void;
  value?: O | null;
  renderOptions?: RenderOption<O>;
  customFilter?: (option: O) => string;
};
type RenderOption<O> = (option: {
  item: O;
  value: GenericComboBoxProps<O>["value"];
  getItemLabel: GenericComboBoxProps<O>["getItemLabel"];
  getItemValue: GenericComboBoxProps<O>["getItemValue"];
}) => ReactNode;
const GenericCombobox = <O,>({
  emptyText,
  getItemLabel,
  getItemValue,
  value = null,
  loading,
  options,
  disabled,
  onTextChange,
  onDebouncedChange,
  placeholder,
  onChange,
  closeOnSelect,
  renderOptions,
  customFilter,
}: GenericComboBoxProps<O>) => {
  const debounceSearch = useMemo(
    () => onDebouncedChange && debounce(onDebouncedChange),
    []
  );
  const handleTextChange = (e: string) => {
    onTextChange?.(e);
    debounceSearch?.(e);
  };
  const lableValueMap = useMemo(() => {
    return options.reduce((prev, curr) => {
      prev[getItemValue(curr)] = customFilter
        ? customFilter(curr)
        : getItemLabel(curr);
      return prev;
    }, {} as Record<string, string>);
  }, [options]);

  return (
    <Command
      filter={(value, search) => {
        if (lableValueMap[value]?.toLowerCase().includes(search.toLowerCase()))
          return 1;
        return 0;
      }}
    >
      <CommandInput
        disabled={disabled}
        placeholder={placeholder}
        className="h-9"
        onValueChange={handleTextChange}
        autoFocus
      />
      <CommandList>
        {!loading && <CommandEmpty>{emptyText || placeholder}</CommandEmpty>}
        <CommandGroup>
          {loading ? (
            <CommandItem disabled>
              <Loader className="animate-spin" />
            </CommandItem>
          ) : (
            <>
              {options.map((item, index) => (
                <CommandItem
                  key={index}
                  value={getItemValue(item)}
                  onSelect={() => {
                    onChange?.(item);
                    closeOnSelect?.(false);
                  }}
                >
                  {renderOptions ? (
                    renderOptions({ item, value, getItemLabel, getItemValue })
                  ) : (
                    <>
                      {getItemLabel(item)}
                      <Check
                        className={cn(
                          "ml-auto",
                          value && getItemValue(value) === getItemValue(item)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </>
                  )}
                </CommandItem>
              ))}
            </>
          )}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

export default GenericCombobox;
