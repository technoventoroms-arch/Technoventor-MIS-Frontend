import ReturnInvItemForm, {
  ReturnItemType,
} from "@/components/shared/return-inv-item-form";
import TablePagination from "@mono/shared_ui/components/shared/table-pagination";

import { IOrderLog, OrderItem, OrderStatus } from "@/interfaces/order";
import {
  approveProjectOrderLogs,
  getProjectOrderItems,
  returnInventoryItem,
  updateOrderStatus,
} from "@/services/projects.service";
import { getUsersList } from "@/services/user.service";
import ResponsiveDrawer from "@mono/shared_ui/components/shared/responsive-drawer";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mono/shared_ui/components/ui/avatar";
import { Badge, badgeVariants } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@mono/shared_ui/components/ui/dialog";
import { DrawerContent } from "@mono/shared_ui/components/ui/drawer";
import { Input } from "@mono/shared_ui/components/ui/input";
import { Skeleton } from "@mono/shared_ui/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@mono/shared_ui/components/ui/tooltip";
import { DataWithLoading } from "@mono/shared_ui/interfaces/utils";
import { cn, getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { Table } from "@tanstack/react-table";
import { VariantProps } from "class-variance-authority";

import {
  CheckCircle,
  Clock,
  Info,
  ListRestart,
  Loader,
  Package,
  ShoppingCart,
  Slash,
  ThumbsUp,
  X,
  XCircle,
} from "lucide-react";
import { BaseSyntheticEvent, ReactNode, useState } from "react";
import { toast } from "sonner";
import CanIUse from "@/components/shared/can-i-use";
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

type ViewInventoryLogsProps = {
  orders: IOrderLog[];
  loading?: boolean;
  projectId: number;
  labId: number;
  orgId: number;
  updateOrder: (orderId: number, data: Partial<IOrderLog>) => void;
  table: Table<IOrderLog>;
  handleOrderLogSearch: (e: BaseSyntheticEvent) => void;
  searchFilter: string;
};
const ViewInventoryLogs = ({
  orders,
  loading,
  projectId,
  updateOrder,
  table,
  handleOrderLogSearch,
  searchFilter,
  labId,
  orgId,
}: ViewInventoryLogsProps) => {
  const [viewOrderItems, setViewOrderItems] = useState<
    DataWithLoading<{ items: OrderItem[]; order: IOrderLog } | null>
  >({
    data: null,
    loading: false,
  });
  const [returningOrderItems, setReturningOrderItems] = useState(false);
  const [returnOrderItems, setReturnOrderItems] = useState<
    DataWithLoading<OrderItem | null>
  >({
    data: null,
    loading: false,
  });
  const [orderApproveLoading, setOrderApproveLoading] = useState<number | null>(
    null
  );
  const handleViewOrderItems = async (order: IOrderLog) => {
    setViewOrderItems({
      data: null,
      loading: true,
    });

    try {
      const res = await getProjectOrderItems(order.id);
      if (!res.error) {
        setViewOrderItems({
          data: { items: res.data || [], order },
          loading: false,
        });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
      setViewOrderItems({
        data: null,
        loading: false,
      });
    }
  };
  const handleReturnItems = async (item: ReturnItemType) => {
    setReturningOrderItems(true);
    try {
      const orderId = viewOrderItems.data!.order.id;

      const res = await returnInventoryItem(projectId, orderId, item);
      if (!res.error) {
        setReturnOrderItems({
          data: null,
          loading: false,
        });
        setReturningOrderItems(false);
        setViewOrderItems({
          data: null,
          loading: false,
        });
        toast.success(`Item returned successfully.`);
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
      setReturningOrderItems(false);
    }
  };

  const handleApproveOrder = async (orderId: number) => {
    setOrderApproveLoading(orderId);
    toast.promise(approveProjectOrderLogs(projectId, orderId), {
      loading: "Approving order...",
      success: (e) => {
        if (!e.error)
          updateOrder(orderId, {
            status: e.data.status,
            updated_at: e.data.updated_at,
          });
        return "Order approved successfully";
      },
      error: "Failed to approve order",
      finally: () => setOrderApproveLoading(null),
    });
  };
  const handleCancelOrder = async (orderId: number) => {
    setOrderApproveLoading(orderId);
    toast.promise(updateOrderStatus(projectId, orderId, "REJECTED"), {
      loading: "Approving order...",
      success: (e) => {
        if (!e.error)
          updateOrder(orderId, {
            status: e.data.status,
            updated_at: e.data.updated_at,
          });
        return "Order approved successfully";
      },
      error: "Failed to approve order",
      finally: () => setOrderApproveLoading(null),
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <Input
          onChange={handleOrderLogSearch}
          type="search"
          className="  w-auto md:w-sm"
          placeholder="Search inventory log"
          defaultValue={searchFilter}
        />{" "}
      </div>
      <ul className="flex flex-col ">
        {loading
          ? listSkeleton
          : orders.map((i) => (
              <OrderLogCard
                approveOrder={handleApproveOrder}
                cancelOrder={handleCancelOrder}
                order={i}
                onViewOrderItems={handleViewOrderItems}
                loading={orderApproveLoading}
              />
            ))}
        {!orders.length && !loading && (
          <div className="text-rose-700 bg-rose-500/15 p-4 my-4 rounded flex items-center gap-2">
            <Info /> No order logs for this project.
          </div>
        )}
      </ul>

      <TablePagination table={table} className="ml-auto" />

      <ResponsiveDrawer
        open={!!viewOrderItems.data}
        onClose={() => setViewOrderItems({ data: null, loading: false })}
      >
        <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[90vh] data-[vaul-drawer-direction=bottom]:mt-4!">
          <ResponsiveDrawer.Header
            title={`Order Item - ${viewOrderItems.data?.order.id}`}
            description={`Modal to view order items for order number ${viewOrderItems.data?.order.number}`}
          />
          <div className="overflow-auto">
            <ViewOrderItems
              itemsList={viewOrderItems.data?.items || []}
              loading={viewOrderItems.loading}
              returnInventoryItem={(e) =>
                setReturnOrderItems({ data: e, loading: false })
              }
              orderStatus={viewOrderItems.data?.order.status}
            />
          </div>
        </DrawerContent>
      </ResponsiveDrawer>
      <Dialog
        open={!!returnOrderItems.data}
        onOpenChange={() => {
          !loading && setReturnOrderItems({ data: null, loading: false });
        }}
      >
        <DialogContent
          disabled={loading}
          className="flex flex-col overflow-hidden p-0 max-h-[95vh] md:max-w-[500px] lg:max-w-[600px]"
        >
          <DialogTitle className="p-4">
            Return Item -{" "}
            <Badge variant={"indigo"}>{returnOrderItems.data?.item.name}</Badge>
            {"  "}
            for order{" "}
            <Badge variant={"red"}>{viewOrderItems.data?.order.number}</Badge>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Modal for Return Item - {returnOrderItems.data?.item.name}
            {"  "}
            for order {viewOrderItems.data?.order.number}
          </DialogDescription>
          {returnOrderItems?.data && viewOrderItems.data && (
            <ReturnInvItemForm
              handleSubmit={handleReturnItems}
              item={returnOrderItems?.data as OrderItem}
              loading={returningOrderItems}
              getUsersOnSearch={async (search: string) => {
                const res = await getUsersList(orgId, labId, {
                  searchQuery: search,
                });
                return {
                  error: res.error,
                  data: res.data?.records || [],
                } as any;
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewInventoryLogs;

type OrderLogCardProps = {
  order: IOrderLog;
  onViewOrderItems: (order: IOrderLog) => void;
  approveOrder: (orderId: number) => void;
  cancelOrder: (orderId: number) => void;
  loading: number | null;
};

const StatusIcons: Record<OrderStatus, ReactNode> = {
  NEW: <CheckCircle className="text-sidebar-border" />,
  APPROVED: <ThumbsUp className="text-sidebar-border" />,
  REJECTED: <XCircle className="text-sidebar-border" />,
  FULFILLED: <Package className="text-sidebar-border" />,
  PARTIALLY_FULFILLED: <Package className="text-sidebar-border" />,
  CANCELLED: <Slash className="text-sidebar-border" />,
  EXPIRED: <Clock className="text-sidebar-border" />,
};

const StatusColor: Record<
  OrderStatus,
  VariantProps<typeof badgeVariants>["variant"]
> = {
  NEW: "green",
  APPROVED: "blue",
  REJECTED: "red",
  FULFILLED: "yellow",
  PARTIALLY_FULFILLED: "yellow",
  CANCELLED: "red",
  EXPIRED: "gray",
};

const OrderLogCard = ({
  order,
  onViewOrderItems,
  approveOrder,
  cancelOrder,
  loading,
}: OrderLogCardProps) => {
  const { id, created_at, status, created_by, updated_by } = order;

  return (
    <div className="grid grid-cols-[auto_1fr] gap-4 max-w-full overflow-hidden">
      <div className="flex flex-col items-center">
        <div className="h-4 w-1 bg-sidebar-border"></div>
        <div>{StatusIcons[status]}</div>
        <div className="flex-1 w-1 bg-sidebar-border"></div>
      </div>
      <div className="shadow-sm p-4 my-2 bg-white dark:bg-secondary/20 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">
            <Badge variant={StatusColor[status]}>{status}</Badge> #
            {order.number}
          </span>
          <span className="space-x-2">
            {status === "NEW" && (
              <CanIUse action={(a) => a.APPROVE_INVENTORY}>
                <Button
                  disabled={loading !== null}
                  size={"sm"}
                  rounded={"sm"}
                  variant={"green"}
                  onClick={() => approveOrder(id)}
                  title="Approve Order"
                  aria-description={`Approve this order. Order Number: ${order.number}`}
                >
                  {loading !== null && loading === id ? (
                    <Loader className="size-3 animate-spin" />
                  ) : (
                    <ThumbsUp className="size-3" />
                  )}
                </Button>
                <Button
                  disabled={loading !== null}
                  size={"sm"}
                  rounded={"sm"}
                  variant={"red"}
                  onClick={() => cancelOrder(id)}
                  title="Cancel Order"
                  aria-description={`Cancel this order. Order Number: ${order.number}`}
                >
                  {loading !== null && loading === id ? (
                    <Loader className="size-3 animate-spin" />
                  ) : (
                    <X className="size-3" />
                  )}
                </Button>
              </CanIUse>
            )}
            <Button
              disabled={loading !== null}
              size={"sm"}
              rounded={"sm"}
              variant={"indigo"}
              onClick={() => onViewOrderItems(order)}
              title="View Order Items"
              aria-description={`View items in this order. Order Number: ${order.number}`}
            >
              <ShoppingCart className="size-3" />
            </Button>
          </span>
        </div>

        <div
          className={cn(
            "text-sm sm:grid flex flex-col mb-2 gap-2",
            "grid-cols-3"
          )}
        >
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="grid grid-cols-[auto_1fr] gap-2 flex-1 text-left text-sm leading-tight">
                  Created By :
                  <span className="truncate text-sm font-medium">
                    {created_by?.first_name} {created_by?.last_name}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent
                variant={"secondary"}
                className="flex gap-2 items-center w-max"
              >
                <Avatar className="size-8 rounded-full">
                  <AvatarImage
                    src={created_by?.image_link}
                    alt={created_by?.first_name}
                  />
                  <AvatarFallback className="rounded-lg uppercase text-xs">
                    {created_by?.first_name?.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-sm font-medium">
                    {created_by?.first_name}
                  </span>
                  <span className="truncate text-sm">{created_by?.email}</span>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <div>
            {status !== "NEW" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="grid grid-cols-[auto_1fr] gap-2 flex-1 text-left text-sm leading-tight">
                    Updated By :
                    <span className="truncate text-sm font-medium">
                      {updated_by?.first_name} {updated_by?.last_name}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  variant={"secondary"}
                  className="flex gap-2 items-center w-max"
                >
                  <Avatar className="size-8 rounded-full">
                    <AvatarImage
                      src={updated_by?.image_link}
                      alt={updated_by?.first_name}
                    />
                    <AvatarFallback className="rounded-lg uppercase text-xs">
                      {updated_by?.first_name?.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate text-sm font-medium">
                      {updated_by?.first_name}
                    </span>
                    <span className="truncate text-sm">
                      {updated_by?.email}
                    </span>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <div>
            Ordered at{" "}
            <Badge variant={"yellow"}>
              {new Date(created_at).toLocaleDateString()}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

type ViewOrderItemsProps = {
  itemsList: OrderItem[];
  loading?: boolean;
  returnInventoryItem?: (item: OrderItem) => void;
  orderStatus?: OrderStatus;
};
const ViewOrderItems = ({
  itemsList,
  loading,
  returnInventoryItem,
  orderStatus,
}: ViewOrderItemsProps) => {
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

              {returnInventoryItem &&
                item.item.type == "REUSABLE" &&
                orderStatus == "APPROVED" &&
                item.returned_quantity !== item.ordered_quantity && (
                  <Button
                    variant={"blue"}
                    size={"sm"}
                    onClick={() => returnInventoryItem(item)}
                    title="Return Item"
                  >
                    <ListRestart />
                  </Button>
                )}
            </li>
          ))}
    </ul>
  );
};
