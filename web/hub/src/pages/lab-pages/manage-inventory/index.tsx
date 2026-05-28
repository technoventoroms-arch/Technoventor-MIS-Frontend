import { useCanIUse } from "@/components/shared/can-i-use";
import ManageCategories from "@/components/shared/manage-categories";
import ManageUnits from "@/components/shared/manage-units";
import { routeConstants } from "@/constants/route.constants";
import { IInvntoryItem } from "@/interfaces/inventory";
import { ProjectSearchQuery } from "@/interfaces/projects";
import { useUser } from "@/providers/user-info-provider";
import { getInventoryList } from "@/services/inventory.service";
import { DataTable } from "@mono/shared_ui/components/shared/data-table";
import ResponsiveDrawer from "@mono/shared_ui/components/shared/responsive-drawer";
import { SiteHeader } from "@mono/shared_ui/components/shared/site-header";
import TableCellWithTooltip from "@mono/shared_ui/components/shared/table-cell-with-tooltip";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import { DrawerContent } from "@mono/shared_ui/components/ui/drawer";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@mono/shared_ui/components/ui/hover-card";
import { PERMISSIONS } from "@mono/shared_ui/interfaces/permissions";
import {
  PaginatedData,
  PaginatedDataWithLoading,
} from "@mono/shared_ui/interfaces/utils";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import {
  ColumnDef,
  getCoreRowModel,
  PaginationState,
  Updater,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { Clock, ClockPlus, Filter, Layers, Ruler } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import InventoryFilters, {
  InventoryFilterSchema,
} from "./components/inventory-filters";
import { useLabContext } from "@/providers/lab-provider";

const columns: ColumnDef<IInvntoryItem, any>[] = [
  {
    accessorKey: "name",
    header: "Name",
    enableHiding: false,
    cell: (info) => (
      <div
        className="max-w-48 text-ellipsis overflow-hidden"
        title={info.getValue()}
      >
        {info.getValue()}
      </div>
    ),
  },
  {
    accessorKey: "image_link",
    header: "",
    enableHiding: false,
    cell: (info) => (
      <div>
        {info.getValue() ? (
          <HoverCard>
            <HoverCardTrigger>
              <img src={info.getValue()} className="w-8 h-8 rounded" />
            </HoverCardTrigger>
            <HoverCardContent className="p-1">
              <img src={info.getValue()} className="  rounded" />
            </HoverCardContent>
          </HoverCard>
        ) : (
          <div className="w-8 h-8 rounded" />
        )}
      </div>
    ),
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: (info) => <TableCellWithTooltip data={info.getValue()} />,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: (info) => <Badge variant={"pink"}>{info.getValue().name}</Badge>,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: (info) => <Badge variant={"indigo"}>{info.getValue()}</Badge>,
  },
  {
    accessorKey: "unit",
    header: "Unit",
    cell: (info) => <Badge variant={"yellow"}>{info.getValue().symbol}</Badge>,
  },
  {
    accessorKey: "quantity",
    header: "Qunatity",
    cell: (info) => <Badge variant={"indigo"}>{info.getValue()}</Badge>,
  },
  {
    accessorKey: "threshold",
    header: "Min Threshold",
    cell: (info) => <Badge variant={"red"}>{info.getValue()}</Badge>,
  },

  {
    accessorKey: "created_at",
    header: "Created At",
    cell: (info) => (
      <Badge variant={"green"}>
        <ClockPlus className="mr-1" />
        {format(info.getValue(), "PPP")}
      </Badge>
    ),
  },

  {
    accessorKey: "updated_at",
    header: "Last Updated",
    cell: (info) => (
      <Badge variant={"yellow"}>
        <Clock className="mr-1" />
        {format(info.getValue(), "PPP")}
      </Badge>
    ),
  },
];

const ManageInventoryPage = () => {
  const [filterOpen, setFiltrOpen] = useState(false);
  const [filters, setFilters] = useState<InventoryFilterSchema>({
    searchQuery: "",
    category: "",
    type: "",
    unit: "",
  });
  const { labData, baseUrl } = useLabContext();
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [unitsModalOpen, setUnitsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const canEditItem = useCanIUse(PERMISSIONS.UPDATE_INVENTORY);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [inventory, setInventory] = useState<
    PaginatedDataWithLoading<IInvntoryItem>
  >({
    records: [],
    loading: false,
    count: 0,
    skip: 0,
    take: 0,
  });
  const fetchInvList = async (param: ProjectSearchQuery) => {
    let res: PaginatedData<IInvntoryItem> = {
      count: 0,
      records: [],
      skip: 0,
      take: 0,
    };
    try {
      const data = await getInventoryList(param);
      if (!data.error) {
        if (!data.data.records) {
          data.data.records = [];
        }
        res = data.data as any;
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    }
    return res;
  };

  const getInventory = async (
    param: ProjectSearchQuery & InventoryFilterSchema
  ) => {
    setInventory({ count: 0, records: [], skip: 0, take: 0, loading: true });
    const data = await fetchInvList(param);
    setInventory({ ...data, loading: false });
    setPagination({
      pageIndex: (data.skip && data.skip / data.take) || 0,
      pageSize: data.take,
    });
  };

  const handleFilterChange = async (data: InventoryFilterSchema) => {
    try {
      setFilters(data);
      await getInventory({
        ...data,
        skip: 0,
        take: pagination.pageSize,
        lab_id: user!.lab_id,
      });
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
  };
  const handleClearFilter = async (isDirty: boolean) => {
    try {
      setFilters({
        searchQuery: "",
        category: "",
        type: "",
        unit: "",
      });
      setFiltrOpen(false);
      if (isDirty) {
        await getInventory({
          skip: 0,
          take: pagination.pageSize,
          lab_id: user!.lab_id,
        });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
  };
  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    const newState =
      typeof updater === "function" ? updater({ ...pagination }) : updater;
    getInventory({
      searchQuery: filters.searchQuery,
      skip: newState.pageIndex * newState.pageSize,
      take: newState.pageSize,
      lab_id: user!.lab_id,
    });
  };

  const table = useReactTable({
    data: inventory.records,
    columns: columns,
    state: {
      columnVisibility,
      pagination,
      columnPinning: {
        right: ["actions"],
      },
    },

    rowCount: inventory.count,
    getRowId: (row) => row!.id!.toString(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  useEffect(() => {
    if (labData?.lab_id) {
      getInventory({
        searchQuery: filters.searchQuery,
        skip: pagination.pageIndex * pagination.pageSize,
        take: pagination.pageSize,
        lab_id: labData.lab_id,
      });
    }
  }, [labData]);

  return (
    <>
      <SiteHeader title="Manage Inventory" />
      <div className="@container/main flex flex-1 flex-col gap-2 p-2 overflow-hidden ">
        <DataTable
          handleOnRowClick={(data) =>
            navigate(`/${baseUrl}/${routeConstants.INVENTORY}/${data.id}`)
          }
          table={table}
          loading={inventory.loading}
          tableBodyClassName="**:data-[slot=table-cell]:first:w-auto **:data-[slot=table-cell]:last:w-auto"
          filterComponent={
            filterOpen && (
              <InventoryFilters
                handleFilterClear={handleClearFilter}
                handleFilterSubmit={handleFilterChange}
              />
            )
          }
          extraTableContent={
            <>
              <div className="ml-auto pl-2">
                <Button
                  className="mr-2"
                  variant="gray"
                  size="sm"
                  onClick={() => setFiltrOpen(!filterOpen)}
                  title="Filter User"
                  rounded={"xs"}
                >
                  <Filter />
                  <span className="sr-only">Open Filter</span>
                </Button>
                <Button
                  className="mr-2"
                  variant="yellow"
                  size="sm"
                  onClick={() => setUnitsModalOpen(true)}
                  title="View Units"
                  rounded={"xs"}
                >
                  <Ruler />
                  <span className="hidden lg:inline">View Units</span>
                </Button>
                <Button
                  className="mr-2"
                  variant="indigo"
                  size="sm"
                  onClick={() => setCategoryModalOpen(true)}
                  title="View Categories"
                  rounded={"xs"}
                >
                  <Layers />
                  <span className="hidden lg:inline">View Categories</span>
                </Button>
              </div>
            </>
          }
        />
      </div>

      <ResponsiveDrawer
        open={categoryModalOpen}
        onOpenChange={() => {
          setCategoryModalOpen(false);
        }}
      >
        <DrawerContent className="pt-0 px-2 pb-2 data-[vaul-drawer-direction=right]:min-w-2xl data-[vaul-drawer-direction=bottom]:max-h-[90vh] data-[vaul-drawer-direction=bottom]:mt-4!">
          <ResponsiveDrawer.Header
            title="Manage Categories"
            description="Modal for managing categories."
          />

          {labData?.lab_id && (
            <ManageCategories labId={labData?.lab_id} disabled />
          )}
        </DrawerContent>
      </ResponsiveDrawer>
      <ResponsiveDrawer
        open={unitsModalOpen}
        onOpenChange={() => {
          setUnitsModalOpen(false);
        }}
      >
        <DrawerContent className="pt-0 px-2 pb-2 data-[vaul-drawer-direction=right]:min-w-2xl data-[vaul-drawer-direction=bottom]:max-h-[90vh] data-[vaul-drawer-direction=bottom]:mt-4!">
          <ResponsiveDrawer.Header
            title="Manage Units"
            description="Modal for managing material units."
          />

          <ManageUnits disabled={!canEditItem} />
        </DrawerContent>
      </ResponsiveDrawer>
    </>
  );
};

export default ManageInventoryPage;
