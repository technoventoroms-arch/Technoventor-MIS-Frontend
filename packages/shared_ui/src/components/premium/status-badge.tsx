import { cn } from "@mono/shared_ui/lib/utils";

type StatusTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "premium";

const statusToneMap: Record<StatusTone, string> = {
  neutral:
    "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-white/10 dark:text-slate-300 dark:ring-white/10",
  success:
    "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-200 dark:ring-emerald-400/20",
  warning:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-200 dark:ring-amber-400/20",
  danger:
    "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-400/10 dark:text-rose-200 dark:ring-rose-400/20",
  info:
    "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-400/10 dark:text-blue-200 dark:ring-blue-400/20",
  premium:
    "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-400/10 dark:text-indigo-200 dark:ring-indigo-400/20",
};

export function statusToneFromValue(value: string): StatusTone {
  const normalized = value.toLowerCase();
  if (["active", "approved", "paid", "captured", "success"].includes(normalized)) {
    return "success";
  }
  if (["pending", "on_hold", "under_maintenance", "draft"].includes(normalized)) {
    return "warning";
  }
  if (["failed", "rejected", "cancelled", "retired", "faulty"].includes(normalized)) {
    return "danger";
  }
  if (["occupied", "processing"].includes(normalized)) {
    return "info";
  }
  return "neutral";
}

export function StatusBadge({
  children,
  tone,
  className,
}: {
  children: string;
  tone?: StatusTone;
  className?: string;
}) {
  const resolvedTone = tone ?? statusToneFromValue(children);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset",
        statusToneMap[resolvedTone],
        className
      )}
    >
      <span className="mr-1.5 size-1.5 rounded-full bg-current" />
      {children.replace(/_/g, " ")}
    </span>
  );
}
