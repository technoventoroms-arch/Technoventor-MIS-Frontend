import {
  Column,
  Row,
  Table as TanstackTable,
  flexRender,
} from "@tanstack/react-table";

import { Button } from "@mono/shared_ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@mono/shared_ui/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@mono/shared_ui/components/ui/table";
import { cn } from "@mono/shared_ui/lib/utils";
import clsx from "clsx";
import { ChevronDown, Columns3Cog, Loader } from "lucide-react";
import { CSSProperties, ReactNode } from "react";
import TablePagination from "./table-pagination";

function DraggableRow<T>({
  row,
  handleOnRowClick,
}: {
  row: Row<T>;
  handleOnRowClick?: (data: T) => void;
}) {
  return (
    <TableRow
      onClick={() => handleOnRowClick?.(row.original)}
      data-state={row.getIsSelected() && "selected"}
      className={clsx(
        "relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80",
        !!handleOnRowClick && "cursor-pointer hover:opacity-90"
      )}
    >
      {row.getVisibleCells().map((cell) => {
        const { className, style } = getCommonPinningStyles(cell.column);
        return (
          <TableCell
            key={cell.id}
            style={
              cell.column.getSize()
                ? {
                    width: cell.column.getSize(),
                    ...style,
                  }
                : style
            }
            className={className}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        );
      })}
    </TableRow>
  );
}

type DataTableProp<T> = {
  table: TanstackTable<T>;
  loading: boolean;
  showSelection?: boolean;
  hideColumnFilter?: boolean;
  hidePagination?: boolean;
  extraTableContent?: ReactNode | null;
  tableBodyClassName?: string;
  tableContainerClassname?: string;
  noContentText?: string;
  handleOnRowClick?: (data: T) => void;
  filterComponent?: ReactNode;
};
const getCommonPinningStyles = <T,>(
  column: Column<T>,
  isHeader: boolean = false
): { style: CSSProperties; className: string } => {
  const isPinned = column.getIsPinned();
  let className = "";
  if (isPinned == "left") {
    className = `${
      isHeader ? "bg-muted" : "bg-background"
    } border-r border-r-[var(--sidebar-border)] shadow-lg`;
  }
  if (isPinned == "right") {
    className = `${
      isHeader ? "bg-muted" : "bg-background"
    } border-l border-l-[var(--sidebar-border)] shadow-lg`;
  }
  const style: CSSProperties = {
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    opacity: isPinned ? 0.95 : 1,
    minWidth: column.getSize(),
    zIndex: isPinned ? 4 : 0,
    position: isPinned ? "sticky" : "relative",
  };
  return { style, className };
};
export function DataTable<T>({
  table,
  showSelection,
  loading,
  extraTableContent = null,
  hideColumnFilter = false,
  hidePagination = false,
  tableBodyClassName,
  noContentText,
  tableContainerClassname,
  handleOnRowClick,
  filterComponent = null,
}: DataTableProp<T>) {
  return (
    <>
      <div className="flex items-center justify-between">
        {!hideColumnFilter && (
          <div className="flex items-center gap-2 justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Columns3Cog />
                  <span className="hidden lg:inline">Customize Columns</span>
                  <span className="lg:hidden">Columns</span>
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide()
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        {extraTableContent}
      </div>
      {filterComponent}
      <div
        className={cn(
          "flex-1 rounded-lg border overflow-hidden",
          tableContainerClassname
        )}
      >
        <Table containerClassName={"h-full"}>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const { style, className } = getCommonPinningStyles(
                    header.column,
                    true
                  );
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={style as any}
                      className={className}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody
            className={clsx(
              "**:data-[slot=table-cell]:first:w-8",
              tableBodyClassName
            )}
          >
            {table.getRowModel().rows?.length ? (
              table
                .getRowModel()
                .rows.map((row) => (
                  <DraggableRow
                    handleOnRowClick={handleOnRowClick}
                    key={row.id}
                    row={row}
                  />
                ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  {loading ? (
                    <div className="flex justify-center">
                      <Loader className="animate-spin" />
                    </div>
                  ) : (
                    noContentText || "No results."
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-4">
        {showSelection ? (
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
        ) : (
          <div></div>
        )}
        {!hidePagination && <TablePagination table={table} />}
      </div>
    </>
  );
}
