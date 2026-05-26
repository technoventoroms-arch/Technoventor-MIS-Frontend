import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@mono/shared_ui/components/ui/form";
import { Input } from "@mono/shared_ui/components/ui/input";
import { Info } from "lucide-react";
import { HTMLInputTypeAttribute, ReactNode } from "react";
import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";

type Props = {
  label?: string;
  placeholder?: string;
  className?: string;
  type?: HTMLInputTypeAttribute;
  inputStartAdornment?: ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const ControlledFormInput = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  label,
  placeholder,
  className,
  type = "text",
  disabled,
  inputStartAdornment,
  onChange,
  ...props
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & Props) => {
  return (
    <FormField
      {...props}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            {disabled ? (
              <Input
                placeholder={placeholder}
                type={type}
                disabled
                value={field.value}
                autoComplete="off"
                className={className}
              />
            ) : (
              <Input
                placeholder={placeholder}
                type={type}
                {...field}
                onChange={(e) => (onChange ? onChange(e) : field.onChange(e))}
                checked={field.value}
                autoComplete="off"
                className={className}
              />
            )}
          </FormControl>
          <FormMessage
            className="text-xs"
            startIcon={<Info className="size-3" />}
          />
        </FormItem>
      )}
    />
  );
};

export default ControlledFormInput;
