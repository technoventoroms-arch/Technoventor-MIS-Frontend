import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@mono/shared_ui/lib/utils";

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",

        // 🆕 Color-themed button variants with dark:bg-*/25
        gray: "bg-gray-100 text-gray-800 shadow-xs hover:bg-gray-200 dark:bg-gray-800/25 dark:text-gray-100 dark:hover:bg-gray-700/30",
        red: "bg-red-100 text-red-800 shadow-xs hover:bg-red-200 dark:bg-red-900/25 dark:text-red-200 dark:hover:bg-red-800/30",
        yellow:
          "bg-yellow-100 text-yellow-800 shadow-xs hover:bg-yellow-200 dark:bg-yellow-900/25 dark:text-yellow-200 dark:hover:bg-yellow-800/30",
        green:
          "bg-green-100 text-green-800 shadow-xs hover:bg-green-200 dark:bg-green-900/25 dark:text-green-200 dark:hover:bg-green-800/30",
        blue: "bg-blue-100 text-blue-800 shadow-xs hover:bg-blue-200 dark:bg-blue-900/25 dark:text-blue-200 dark:hover:bg-blue-800/30",
        indigo:
          "bg-indigo-100 text-indigo-800 shadow-xs hover:bg-indigo-200 dark:bg-indigo-900/25 dark:text-indigo-200 dark:hover:bg-indigo-800/30",
        purple:
          "bg-purple-100 text-purple-800 shadow-xs hover:bg-purple-200 dark:bg-purple-900/25 dark:text-purple-200 dark:hover:bg-purple-800/30",
        pink: "bg-pink-100 text-pink-800 shadow-xs hover:bg-pink-200 dark:bg-pink-900/25 dark:text-pink-200 dark:hover:bg-pink-800/30",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
      rounded: {
        sm: "rounded-sm",
        xs: "rounded-xs",
        md: "rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "sm",
    },
  }
);

function Button({
  className,
  variant,
  size,
  rounded,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className, rounded }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
