import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@mono/shared_ui/lib/utils";
import { cva, VariantProps } from "class-variance-authority";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

const tooltipVariants = cva(" ", {
  variants: {
    variant: {
      default: "bg-primary",
      destructive: "bg-destructive",
      outline: "border bg-background",
      secondary: "bg-secondary text-secondary-foreground ",
      gray: "bg-gray-100 text-gray-800 ",
      red: "bg-red-100 text-red-800  ",
      yellow: "bg-yellow-100 text-yellow-800",
      green: "bg-green-100 text-green-800",
      blue: "bg-blue-100 text-blue-800",
      indigo: "bg-indigo-100 text-indigo-800",
      purple: "bg-purple-100 text-purple-800",
      pink: "bg-pink-100 text-pink-800",
    },
    arrowVariant: {
      default: "bg-primary fill-primary",
      destructive: "bg-destructive fill-destructive",
      outline: "border bg-background fill-background",
      secondary: "bg-secondary fill-secondary",
      gray: "bg-gray-100 fill-gray-100",
      red: "bg-red-100 fill-red-100",
      yellow: "bg-yellow-100 fill-yellow-100",
      green: "bg-green-100 fill-green-100",
      blue: "bg-blue-100 fill-blue-100",
      indigo: "bg-indigo-100 fill-indigo-100",
      purple: "bg-purple-100 fill-purple-100",
      pink: "bg-pink-100 fill-pink-100",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
function TooltipContent({
  className,
  sideOffset = 0,
  children,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> &
  VariantProps<typeof tooltipVariants>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          tooltipVariants({ variant }),
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow
          className={cn(
            " z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]",
            tooltipVariants({ arrowVariant: variant })
          )}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
