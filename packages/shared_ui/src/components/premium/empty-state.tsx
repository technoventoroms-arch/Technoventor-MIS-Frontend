import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

import { cn } from "@mono/shared_ui/lib/utils";

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center dark:border-white/15 dark:bg-white/[0.03]",
        className
      )}
    >
      <div className="mb-5 rounded-3xl border border-blue-100 bg-white p-4 text-blue-700 shadow-sm dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-200">
        {icon ?? <Sparkles className="size-7" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
