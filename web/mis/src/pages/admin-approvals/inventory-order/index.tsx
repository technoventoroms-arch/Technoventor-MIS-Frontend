import { IAdminOrderLog, IOrderLog, OrderItem } from "@/interfaces/order";
import { adminOrderLogs } from "@/services/admin.service";
import {
  approveProjectOrderLogs,
  getProjectOrderItems,
  updateOrderStatus,
} from "@/services/projects.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataTable } from "@mono/shared_ui/components/shared/data-table";
import ResponsiveDrawer from "@mono/shared_ui/components/shared/responsive-drawer";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mono/shared_ui/components/ui/avatar";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import { DrawerContent } from "@mono/shared_ui/components/ui/drawer";
import { Skeleton } from "@mono/shared_ui/components/ui/skeleton";
import {
  DataWithLoading,
  IGenericQueryParam,
  PaginatedDataWithLoading,
} from "@mono/shared_ui/interfaces/utils";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import {
  ColumnDef,
  getCoreRowModel,
  PaginationState,
  Updater,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { ClockPlus, Filter } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import OrderFilters, { InventoryFilterSchema } from "./filter";
import InventoryTableAction from "./inventory-table-action";
import GenericModal from "@mono/shared_ui/components/shared/generic-modal";
import { useLabContext } from "@/providers/lab-provider";

const listSkeleton = (
  <>
    <li>
      <Skeleton className="w-full h-18 bg-neutral-200 dark:bg-accent " />
    </li>
    <li>
      <Skeleton className="w-full h-18 bg-neutral-200 dark:bg-accent " />
    </li>
    <li>
      <Skeleton className="w-full h-18 bg-neutral-200 dark:bg-accent " />
    </li>
    <li>
      <Skeleton className="w-full h-18 bg-neutral-200 dark:bg-accent " />
    </li>
  </>
);
const columns: ColumnDef<IOrderLog, any>[] = [
  {
    accessorKey: "number",
    header: "Order No.",
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (info) => <Badge variant={"blue"}>{info.getValue()}</Badge>,
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
    accessorKey: "created_by",
    header: "Created By",
    cell: (info) => {
      const { created_by } = info.row.original;
      return (
        <div className="flex gap-2 items-center w-max">
          <Avatar className="size-10 rounded-full">
            <AvatarImage
              src={created_by?.image_link}
              alt={created_by?.first_name}
            />
            <AvatarFallback className="rounded-lg uppercase">
              {created_by?.first_name?.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-xs leading-tight">
            <span className="truncate text-sm font-medium">
              {created_by?.first_name}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {created_by?.email}
            </span>
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "updated_at",
    header: "Updated At",
    cell: (info) => (
      <Badge variant={"indigo"}>
        <ClockPlus className="mr-1" />
        {format(info.getValue(), "PPP")}
      </Badge>
    ),
  },
];

const columnWithActions: ColumnDef<IOrderLog, any>[] = [
  ...columns,
  {
    header: "Actions",
    size: 100,
    id: "actions",
    cell: (info) => <InventoryTableAction {...info} />,
  },
];
export const filterSchema = z.object({
  searchQuery: z.string(),
  status: z.string(),
  fromDate: z.date().nullable(),
  toDate: z.date().nullable(),
});

export type zodFilterSchema = z.infer<typeof filterSchema>;
export const useAdminOrderLogs = () => {
  const form = useForm<zodFilterSchema>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      searchQuery: "",
      status: "ALL",
      fromDate: null,
      toDate: null,
    },
  });
  const [loading, setLoading] = useState(false);
  const { isLabActive } = useLabContext();
  const [approveRequestModal, setApproveRequestModal] = useState<{
    content: IAdminOrderLog | null;
    open: boolean;
  }>({ content: null, open: false });
  const [rejectRequestModal, setRejectRequestModal] = useState<{
    content: IAdminOrderLog | null;
    open: boolean;
  }>({ content: null, open: false });
  const [filterOpen, setFiltrOpen] = useState(false);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [orderLogs, setOrderLogs] = useState<
    PaginatedDataWithLoading<IAdminOrderLog>
  >({
    count: 0,
    records: [],
    skip: 0,
    take: 0,
    loading: false,
  });

  const getFilters = (filters: InventoryFilterSchema) => {
    return {
      searchQuery: filters?.searchQuery,
      fromDate: filters?.fromDate?.toISOString(),
      status: filters.status == "ALL" ? "" : filters.status,
      toDate: filters?.toDate?.toISOString(),
    };
  };

  const fetchOrderLogs = async (params?: IGenericQueryParam) => {
    setOrderLogs((prev) => ({ ...prev, loading: true, records: [] }));
    try {
      const data = await adminOrderLogs(params);
      if (!data.error) {
        setOrderLogs({
          ...data.data,
          records: data.data.records || [],
          loading: false,
        });
        setPagination({
          pageIndex: (data.data.skip && data.data.skip / data.data.take) || 0,
          pageSize: data.data.take,
        });
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
      setOrderLogs((prev) => ({ ...prev, records: [], loading: false }));
    }
  };

  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    const newState =
      typeof updater === "function" ? updater({ ...pagination }) : updater;

    fetchOrderLogs({
      ...getFilters(form.getValues()),
      skip: newState.pageIndex * newState.pageSize,
      take: newState.pageSize,
    });
  };

  const handleFilterChange = async (data: InventoryFilterSchema) => {
    try {
      await fetchOrderLogs({
        ...getFilters(data),
        skip: 0,
        take: pagination.pageSize,
      });
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
  };
  const handleClearFilter = async (isDirty: boolean) => {
    try {
      if (isDirty) {
        await fetchOrderLogs({ skip: 0, take: pagination.pageSize });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
  };
  const approveRequest = async () => {
    setLoading(true);
    const item = approveRequestModal.content!;
    try {
      await approveProjectOrderLogs(item.project_id, item.id);
      fetchOrderLogs({ ...getFilters(form.getValues()) });
      toast.success("Request approved successfully");
      setApproveRequestModal({ open: false, content: null });
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };
  const rejectRequest = async () => {
    setLoading(true);
    const item = rejectRequestModal.content!;
    try {
      await updateOrderStatus(item.project_id, item.id, "REJECTED");
      fetchOrderLogs({ ...getFilters(form.getValues()) });
      setRejectRequestModal({ open: false, content: null });

      toast.success("Request rejected successfully");
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };
  const table = useReactTable({
    data: orderLogs.records,
    columns: isLabActive ? columnWithActions : columns,
    state: {
      pagination,
      columnPinning: {
        right: ["actions"],
      },
    },
    rowCount: orderLogs.count,
    getRowId: (row) => row.id.toString(),
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    meta: {
      approveRequest: (e: any) =>
        setApproveRequestModal({ content: e, open: true }),
      rejectRequest: (e: any) =>
        setRejectRequestModal({ content: e, open: true }),
    },
  });

  return {
    orderLogs,
    table,
    fetchOrderLogs,
    handleFilterChange,
    handleClearFilter,
    filterOpen,
    setFiltrOpen,
    form,
    setApproveRequestModal,
    setRejectRequestModal,
    approveRequestModal,
    rejectRequestModal,
    rejectRequest,
    approveRequest,
    loading,
  };
};
type Props = ReturnType<typeof useAdminOrderLogs>;

const InventoryOrders = ({
  filterOpen,
  table,
  setFiltrOpen,
  orderLogs,
  handleClearFilter,
  handleFilterChange,
  form,
  approveRequest,
  approveRequestModal,

  loading,
  rejectRequest,
  rejectRequestModal,
  setApproveRequestModal,
  setRejectRequestModal,
}: Props) => {
  const [selectedOrder, setSelectedOrder] = useState<IOrderLog | null>(null);

  const [viewOrderItems, setViewOrderItems] = useState<
    DataWithLoading<OrderItem[]>
  >({
    data: [],
    loading: false,
  });
  const handleViewOrderItems = async (orderId: number) => {
    setViewOrderItems({
      data: [],
      loading: true,
    });

    try {
      const res = await getProjectOrderItems(orderId);
      if (!res.error) {
        setViewOrderItems({
          data: res.data,
          loading: false,
        });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
      setViewOrderItems({
        data: [],
        loading: false,
      });
    }
  };

  return (
    <>
      <DataTable
        handleOnRowClick={(data) => {
          setSelectedOrder(data);
          handleViewOrderItems(data.id);
        }}
        table={table}
        loading={orderLogs.loading}
        tableBodyClassName="**:data-[slot=table-cell]:first:w-auto **:data-[slot=table-cell]:last:w-auto"
        filterComponent={
          filterOpen && (
            <FormProvider {...form}>
              <OrderFilters
                handleFilterClear={(d) => {
                  handleClearFilter(d);
                }}
                handleFilterSubmit={handleFilterChange}
              />
            </FormProvider>
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
            </div>
          </>
        }
      />

      <ResponsiveDrawer
        open={!!viewOrderItems.data.length}
        onClose={() => {
          setViewOrderItems({ data: [], loading: false });
          setSelectedOrder(null);
        }}
      >
        <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[90vh] data-[vaul-drawer-direction=bottom]:mt-4!">
          <ResponsiveDrawer.Header
            title={`Order Items - ${selectedOrder?.number || ""}`}
            description={`Modal to view order items for order number ${
              selectedOrder?.number || ""
            }`}
          />
          <div className="overflow-auto">
            <ViewOrderItems
              itemsList={viewOrderItems.data}
              loading={viewOrderItems.loading}
            />
          </div>
        </DrawerContent>
      </ResponsiveDrawer>
      <GenericModal
        loading={loading}
        onOpenChange={(e) => setRejectRequestModal({ open: e, content: null })}
        open={rejectRequestModal.open}
        onConfirmClick={rejectRequest}
        title={"Reject Order Request"}
        variant="danger"
        desc={
          <>
            Are you sure you want to reject order request{" "}
            <Badge variant={"blue"}>{rejectRequestModal.content?.number}</Badge>{" "}
            for project{" "}
            <Badge variant={"yellow"}>
              {rejectRequestModal.content?.project_title}
            </Badge>
            ?
          </>
        }
      />
      <GenericModal
        loading={loading}
        onOpenChange={(e) => setApproveRequestModal({ open: e, content: null })}
        open={approveRequestModal.open}
        onConfirmClick={approveRequest}
        title={"Approve Order Request"}
        variant="success"
        desc={
          <>
            Are you sure you want to approve order request{" "}
            <Badge variant={"blue"}>
              {approveRequestModal.content?.number}
            </Badge>{" "}
            for project{" "}
            <Badge variant={"yellow"}>
              {approveRequestModal.content?.project_title}
            </Badge>
            ?
          </>
        }
      />
    </>
  );
};

export default InventoryOrders;

type ViewOrderItemsProps = {
  itemsList: OrderItem[];
  loading?: boolean;
};
const ViewOrderItems = ({ itemsList, loading }: ViewOrderItemsProps) => {
  return (
    <ul className="px-4 py-2">
      {loading
        ? listSkeleton
        : itemsList.map((item) => (
            <li
              key={item.id}
              className="grid grid-cols-[auto_1fr_auto] gap-4 not-last:border-b my-2 pb-2"
            >
              <div>
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={item.item.image_link}
                    alt={item.item.name}
                  />
                  <AvatarFallback className="rounded-lg">
                    {item.item.name?.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <div>{item.item.name}</div>

                <div className="ml-2 text-sm text-gray-500 mb-2">
                  Quantity:{" "}
                  <span className="font-semibold">
                    {item.ordered_quantity} {item.item.unit.symbol}
                  </span>
                </div>

                <div className="grid grid-cols-2">
                  <Badge className="col-span-1" variant={"red"}>
                    {item.item.type}
                  </Badge>
                  <Badge className="col-span-1" variant={"indigo"}>
                    {item.item.category.name}
                  </Badge>
                </div>
              </div>
            </li>
          ))}
    </ul>
  );
};
