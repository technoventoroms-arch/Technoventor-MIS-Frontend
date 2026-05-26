import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@mono/shared_ui/components/ui/form";
import { Info } from "lucide-react";
import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import { Textarea } from "../ui/textarea";

type Props = {
  label?: string;
  placeholder?: string;
  className?: string;
};

const ControlledFormTextArea = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  label,
  placeholder,
  className,
  ...props
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & Props) => {
  return (
    <FormField
      {...props}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Textarea
              {...field}
              placeholder={placeholder}
              autoComplete="off"
              className={className}
            />
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

export default ControlledFormTextArea;
