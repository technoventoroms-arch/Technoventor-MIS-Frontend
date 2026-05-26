import { cn } from "@mono/shared_ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import React from "react";

const textWithIndicatorVariants = cva("size-2 rounded-full", {
  variants: {
    variant: {
      default: "bg-primary",
      secondary: "bg-secondary",
      destructive: "bg-destructive dark:bg-destructive",
      gray: "bg-gray-500 dark:bg-gray-800",
      red: "bg-red-500 dark:bg-red-500",
      yellow: "bg-yellow-500 dark:bg-yellow-500",
      green: "bg-green-500 dark:bg-green-500",
      blue: "bg-blue-500 dark:bg-blue-500",
      indigo: "bg-indigo-500 dark:bg-indigo-500",
      purple: "bg-purple-500 dark:bg-purple-500 ",
      pink: "bg-pink-500 dark:bg-pink-500",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const TextWithIndicator = ({
  className,
  variant,
  children,
  containerClassName = "",
  ...props
}: React.ComponentProps<"span"> & {
  containerClassName?: string;
} & VariantProps<typeof textWithIndicatorVariants>) => {
  return (
    <span
      data-slot="text-with-indicator"
      className={cn("flex gap-2 px-2 items-center", containerClassName)}
      {...props}
    >
      <span className={cn(textWithIndicatorVariants({ variant }), className)} />
      {children}
    </span>
  );
};

export { TextWithIndicator };
