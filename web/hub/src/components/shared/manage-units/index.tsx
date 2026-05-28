import { IUnit } from "@/interfaces/inventory";
import { useUnitsProvider } from "@/providers/units-provider";
import { DataTable } from "@mono/shared_ui/components/shared/data-table";
import { Button } from "@mono/shared_ui/components/ui/button";
import { useIsMobile } from "@mono/shared_ui/hooks/use-mobile";
import { cn, debounce } from "@mono/shared_ui/lib/utils";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { XIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import UnitsTableAction from "./components/units-table-action";

const columns: ColumnDef<IUnit, any>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: (prop) => <span className="capitalize">{prop.getValue()}</span>,
  },
  {
    accessorKey: "symbol",
    header: "Symbol",
    cell: (prop) => <span className="uppercase">{prop.getValue()}</span>,
  },
];

const columnsWithEdit: ColumnDef<IUnit, any>[] = [
  ...columns,
  {
    header: "Actions",
    size: 10,
    cell: (info) => <UnitsTableAction {...info} />,
  },
];
const ManageUnits = ({ disabled }: { disabled: boolean }) => {
  const { getUnitsList, units } = useUnitsProvider();
  const isMobile = useIsMobile();
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [filters, setFilters] = useState<{ searchQuery: string }>({
    searchQuery: "",
  });

  const table = useReactTable({
    data: units.data,
    columns: disabled ? columns : columnsWithEdit,
    state: {
      columnVisibility,
    },

    getRowId: (row) => row!.id!.toString(),
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const searchHandle = (search: string) => {
    getUnitsList({ searchQuery: search });
  };
  const handleDebounceSearch = useMemo(() => {
    return debounce(searchHandle, 500);
  }, []);
  useEffect(() => {
    getUnitsList({
      searchQuery: filters.searchQuery,
    });
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden gap-2">
      <DataTable
        table={table}
        hideColumnFilter
        loading={units.loading}
        tableContainerClassname={cn(isMobile && "max-h-full overflow-auto")}
        tableBodyClassName="**:data-[slot=table-cell]:first:w-auto **:data-[slot=table-cell]:last:w-auto"
        extraTableContent={
          <>
            <div className="flex gap-2">
              {filters.searchQuery && (
                <Button
                  onClick={() => {
                    setFilters({ searchQuery: "" });
                    handleDebounceSearch("");
                  }}
                  size={"sm"}
                  variant={"red"}
                >
                  <XIcon />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>
            <div className="ml-auto pl-2"></div>
          </>
        }
      />
    </div>
  );
};

export default ManageUnits;
