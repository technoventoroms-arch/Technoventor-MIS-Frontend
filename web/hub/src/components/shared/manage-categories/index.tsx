import { getInvCategories } from "@/services/inventory.service";
import { DataTable } from "@mono/shared_ui/components/shared/data-table";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Input } from "@mono/shared_ui/components/ui/input";
import { useIsMobile } from "@mono/shared_ui/hooks/use-mobile";
import { ICategory } from "@mono/shared_ui/interfaces/category";
import {
  IGenericQueryParam,
  PaginatedData,
  PaginatedDataWithLoading,
} from "@mono/shared_ui/interfaces/utils";
import { cn, debounce, getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import {
  ColumnDef,
  getCoreRowModel,
  PaginationState,
  Updater,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { XIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import CategoryTableAction from "./components/category-table-action";

const columns: ColumnDef<ICategory, any>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
];
const columnsWithActions: ColumnDef<ICategory, any>[] = [
  ...columns,
  {
    header: "Actions",
    size: 10,
    cell: (info) => <CategoryTableAction {...info} />,
  },
];
type Props = { labId: number; disabled: boolean };
const ManageCategories = ({ disabled }: Props) => {
  const isMobile = useIsMobile();
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [filters, setFilters] = useState<{ searchQuery: string }>({
    searchQuery: "",
  });

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [categories, setCategories] = useState<
    PaginatedDataWithLoading<ICategory>
  >({
    records: [],
    loading: false,
    count: 0,
    skip: 0,
    take: 0,
  });
  const fetchCategoriesList = async (param: IGenericQueryParam) => {
    let res: PaginatedData<ICategory> = {
      count: 0,
      records: [],
      skip: 0,
      take: 0,
    };
    try {
      const data = await getInvCategories(param);
      if (!data.error) {
        res = data.data as any;
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    }
    return res;
  };

  const getCategories = async (param: IGenericQueryParam) => {
    setCategories({ count: 0, records: [], skip: 0, take: 0, loading: true });
    const data = await fetchCategoriesList(param);
    setCategories({ ...data, records: data.records || [], loading: false });
    setPagination({
      pageIndex: (data.skip && data.skip / data.take) || 0,
      pageSize: data.take,
    });
  };

  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    const newState =
      typeof updater === "function" ? updater({ ...pagination }) : updater;

    getCategories({
      searchQuery: filters.searchQuery,
      skip: newState.pageIndex * newState.pageSize,
      take: newState.pageSize,
    });
  };

  const table = useReactTable({
    data: categories.records,
    columns: disabled ? columns : columnsWithActions,
    state: {
      columnVisibility,
      pagination,
    },
    rowCount: categories.count,
    getRowId: (row) => row!.id!.toString(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const searchHandle = (search: string) => {
    getCategories({ searchQuery: search, skip: 0, take: 10 });
  };
  const handleDebounceSearch = useMemo(() => {
    return debounce(searchHandle, 500);
  }, []);
  useEffect(() => {
    getCategories({
      searchQuery: filters.searchQuery,
      skip: pagination.pageIndex * pagination.pageSize,
      take: pagination.pageSize,
    });
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden gap-2">
      <DataTable
        table={table}
        hideColumnFilter
        loading={categories.loading}
        tableContainerClassname={cn(isMobile && "max-h-full overflow-auto")}
        tableBodyClassName="**:data-[slot=table-cell]:first:w-auto **:data-[slot=table-cell]:last:w-auto"
        extraTableContent={
          <>
            <div className="flex gap-2">
              <Input
                onChange={(e) => {
                  const search = e.target.value;
                  setFilters({ searchQuery: search });
                  handleDebounceSearch(search);
                }}
                className="h-8 w-auto ml-2"
                placeholder="Search category"
                value={filters.searchQuery}
              />
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

export default ManageCategories;
