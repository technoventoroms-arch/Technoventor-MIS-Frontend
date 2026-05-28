import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@mono/shared_ui/lib/utils";
import { Button } from "@mono/shared_ui/components/ui/button";
import { EmptyState } from "./empty-state";
import { PremiumSurface } from "./premium-card";

export type PremiumColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

export function PremiumDataTable<T>({
  title,
  description,
  columns,
  rows,
  getRowKey,
  actions,
  emptyTitle = "No records yet",
  emptyDescription = "When data is available, it will appear here.",
  next,
  previous,
  onNext,
  onPrevious,
  className,
}: {
  title: string;
  description?: string;
  columns: PremiumColumn<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => string;
  actions?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  next?: string | null;
  previous?: string | null;
  onNext?: () => void;
  onPrevious?: () => void;
  className?: string;
}) {
  return (
    <PremiumSurface className={cn("overflow-hidden", className)}>
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center dark:border-white/10">
        <div>
          <h2 className="text-base font-semibold text-slate-950 dark:text-white">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          ) : null}
        </div>
        {actions}
      </div>
      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-white/[0.03] dark:text-slate-400">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className={cn("px-6 py-3", column.className)}>
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {rows.map((row, index) => (
                <tr
                  key={getRowKey(row, index)}
                  className="bg-white transition hover:bg-blue-50/50 dark:bg-transparent dark:hover:bg-white/[0.03]"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn("px-6 py-4 align-middle", column.className)}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6">
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      )}
      {(next || previous || onNext || onPrevious) && (
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
          <span>More records</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!previous || !onPrevious}
              onClick={onPrevious}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!next || !onNext}
              onClick={onNext}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </PremiumSurface>
  );
}
