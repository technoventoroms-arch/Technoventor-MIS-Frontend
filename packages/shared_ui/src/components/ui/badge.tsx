import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@mono/shared_ui/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md dark:border px-2 py-0.5 text-sm font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",

        // 🌗 Custom badge color variants with light & dark theme support
        gray: "bg-gray-50 text-gray-600 dark:ring-1 ring-inset ring-gray-500/10 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:ring-gray-700/20",
        red: "bg-red-50 text-red-700 dark:ring-1 ring-inset ring-red-600/10 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-800 dark:ring-red-800/20",
        yellow:
          "bg-yellow-50 text-yellow-800 dark:ring-1 ring-inset ring-yellow-600/20 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 dark:hover:bg-yellow-800 dark:ring-yellow-800/20",
        green:
          "bg-green-50 text-green-700 dark:ring-1 ring-inset ring-green-600/20 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-800 dark:ring-green-800/20",
        blue: "bg-blue-50 text-blue-700 dark:ring-1 ring-inset ring-blue-700/10 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800 dark:ring-blue-800/20",
        indigo:
          "bg-indigo-50 text-indigo-700 dark:ring-1 ring-inset ring-indigo-700/10 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-800 dark:ring-indigo-800/20",
        purple:
          "bg-purple-50 text-purple-700 dark:ring-1 ring-inset ring-purple-700/10 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-800 dark:ring-purple-800/20",
        pink: "bg-pink-50 text-pink-700 dark:ring-1 ring-inset ring-pink-700/10 hover:bg-pink-100 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-800 dark:ring-pink-800/20",
      },
      fontWeight: {
        normal: "font-normal",
        semibold: "font-semibold",
      },
      fontSize: {
        normal: "text-sm",
        small: "text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      fontWeight: "normal",
      fontSize: "normal",
    },
  }
);

function Badge({
  className,
  variant,
  fontWeight,
  fontSize,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(
        badgeVariants({ variant, fontWeight, fontSize }),
        className
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
