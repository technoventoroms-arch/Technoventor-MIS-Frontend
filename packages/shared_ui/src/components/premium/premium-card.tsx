import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { cn } from "@mono/shared_ui/lib/utils";

type TrendDirection = "up" | "down" | "flat";

export function PremiumSurface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-slate-200/80 bg-white/90 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/10 dark:bg-slate-950/70",
        className
      )}
    >
      {children}
    </section>
  );
}

export function KpiCard({
  label,
  value,
  helper,
  trend,
  direction = "flat",
  icon,
  className,
}: {
  label: string;
  value: string;
  helper?: string;
  trend?: string;
  direction?: TrendDirection;
  icon?: ReactNode;
  className?: string;
}) {
  const TrendIcon =
    direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;

  return (
    <PremiumSurface className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {value}
          </p>
        </div>
        {icon ? (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3 text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-200">
            {icon}
          </div>
        ) : null}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 text-sm">
        <span className="text-slate-500 dark:text-slate-400">{helper}</span>
        {trend ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              direction === "up" &&
                "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200",
              direction === "down" &&
                "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200",
              direction === "flat" &&
                "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
            )}
          >
            <TrendIcon className="size-3.5" />
            {trend}
          </span>
        ) : null}
      </div>
    </PremiumSurface>
  );
}

export function InsightCard({
  title,
  description,
  children,
  action,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <PremiumSurface className={className}>
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 dark:border-white/10">
        <div>
          <h3 className="text-base font-semibold text-slate-950 dark:text-white">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </PremiumSurface>
  );
}
