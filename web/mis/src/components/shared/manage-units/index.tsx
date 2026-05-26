import { IUnit } from "@/interfaces/inventory";
import { useUnitsProvider } from "@/providers/units-provider";
import { addNewUnit, deleteInvUnits } from "@/services/inventory.service";
import { DataTable } from "@mono/shared_ui/components/shared/data-table";
import GenericModal from "@mono/shared_ui/components/shared/generic-modal";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@mono/shared_ui/components/ui/popover";
import { useIsMobile } from "@mono/shared_ui/hooks/use-mobile";
import { ICategory } from "@mono/shared_ui/interfaces/category";
import { cn, debounce, getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { PlusIcon, XIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import AddNewUnit from "./components/add-new-unit";
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
  const { getUnitsList, units, updateUnitsList } = useUnitsProvider();
  const isMobile = useIsMobile();
  const [unitDetailModal, setUnitDetailModalOpen] = useState(false);
  const [unitSubmitting, setUnitSubmitting] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [filters, setFilters] = useState<{ searchQuery: string }>({
    searchQuery: "",
  });
  const [deleteUnitModal, setDeleteUnitModal] = useState<{
    content: ICategory | null;
    open: boolean;
  }>({ content: null, open: false });

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

    meta: {
      deleteUnit: (data: ICategory) =>
        setDeleteUnitModal({ content: data, open: true }),
    },
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

  const handleCreateNewCategory = async (data: IUnit) => {
    setUnitSubmitting(true);
    try {
      const res = await addNewUnit({
        name: data.name?.toLowerCase(),
        symbol: data.symbol?.toLowerCase(),
      });

      if (!res.error) {
        updateUnitsList({
          ...units,
          data: [res.data, ...units.data],
        });
        setUnitDetailModalOpen(false);
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setUnitSubmitting(false);
    }
  };
  const handleDeleteUnit = async () => {
    if (!deleteUnitModal.content) return;
    setUnitSubmitting(true);
    try {
      await deleteInvUnits(deleteUnitModal.content?.id);
      toast.success("Inventory item deleted successfully");
      getUnitsList({
        searchQuery: filters.searchQuery,
      });
      setDeleteUnitModal({ content: null, open: false });
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setUnitSubmitting(false);
    }
  };
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
            <div className="ml-auto pl-2">
              {!disabled && (
                <Popover
                  open={unitDetailModal}
                  onOpenChange={setUnitDetailModalOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      className="mr-2"
                      variant="green"
                      size="sm"
                      onClick={() => setUnitDetailModalOpen(true)}
                      title="Add new unit"
                      rounded={"xs"}
                    >
                      <PlusIcon />
                      <span className="hidden lg:inline">Add New Unit</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <AddNewUnit
                      loading={unitSubmitting}
                      onSubmit={handleCreateNewCategory}
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </>
        }
      />

      <GenericModal
        open={deleteUnitModal.open}
        onOpenChange={(e) => setDeleteUnitModal({ content: null, open: e })}
        onConfirmClick={handleDeleteUnit}
        loading={unitSubmitting}
        title={"Delete Category"}
        confirmButtonText="Delete"
        variant="danger"
        desc={
          <>
            Are you sure you want to delete{" "}
            <Badge variant={"blue"}>{deleteUnitModal.content?.name}</Badge>?
          </>
        }
      />
    </div>
  );
};

export default ManageUnits;
