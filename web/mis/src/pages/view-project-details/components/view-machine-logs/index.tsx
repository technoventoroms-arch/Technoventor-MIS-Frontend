import {
  MachineBookingSummary,
  ReservationStatusType,
} from "@/interfaces/reservation";
import { updateMachineReservations } from "@/services/machine.service";
import TablePagination from "@mono/shared_ui/components/shared/table-pagination";
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
import { Separator } from "@mono/shared_ui/components/ui/separator";
import { Skeleton } from "@mono/shared_ui/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@mono/shared_ui/components/ui/tooltip";
import { cn } from "@mono/shared_ui/lib/utils";
import { ColumnFiltersState, Table } from "@tanstack/react-table";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";

import {
  CheckCircle,
  Cpu,
  Info,
  Loader,
  Slash,
  ThumbsUp,
  UserCircle,
  X,
  XCircle,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { toast } from "sonner";
import MachineFilter from "./machine-filter";

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

type ViewMachineLogsProps = {
  requests: MachineBookingSummary[];
  loading?: boolean;
  projectId: number;
  updateRequest: (
    requestId: number,
    data: Partial<MachineBookingSummary>
  ) => void;
  table: Table<MachineBookingSummary>;
  filters: ColumnFiltersState;
};
const ViewMachineLogs = ({
  requests,
  loading,
  projectId,
  updateRequest,
  table,
  filters,
}: ViewMachineLogsProps) => {
  const [approveRequestModal, setApproveRequestModal] = useState<{
    requestId: number;
    status: ReservationStatusType;
  } | null>(null);

  const [orderApproveLoading, setOrderApproveLoading] = useState<number | null>(
    null
  );

  const handleUpdateRequestStatus = async (
    requestId: number,
    status: ReservationStatusType
  ) => {
    setOrderApproveLoading(requestId);
    toast.promise(updateMachineReservations(projectId, requestId, status), {
      loading: "Approving order...",
      success: (e) => {
        if (!e.error)
          updateRequest(requestId, {
            status: e.data.status,
            updated_at: e.data.updated_at,
          });
        return "Machine request approved successfully";
      },
      error: "Failed to approve machine request",
      finally: () => {
        setOrderApproveLoading(null);
        setApproveRequestModal(null);
      },
    });
  };

  return (
    <>
      <div>
        <div className="flex justify-between items-center my-2">
          <MachineFilter table={table} filters={filters} />
        </div>
        <ul className="flex flex-col ">
          {loading
            ? listSkeleton
            : requests.map((i) => (
                <MachineLogCard
                  key={i.id}
                  updateRequest={(requestId, status) =>
                    setApproveRequestModal({
                      requestId,
                      status,
                    })
                  }
                  request={i}
                  loading={orderApproveLoading}
                />
              ))}
          {!requests.length && !loading && (
            <div className="text-rose-700 bg-rose-500/15 p-4 my-4 rounded flex items-center gap-2">
              <Info /> No machine logs for this project.
            </div>
          )}
        </ul>
        <TablePagination table={table} className="ml-auto" />
      </div>
      <Dialog
        open={!!approveRequestModal}
        onOpenChange={() => {
          !loading && setApproveRequestModal(null);
        }}
      >
        <DialogContent
          disabled={loading}
          className="flex flex-col overflow-hidden p-0 max-h-[95vh] md:max-w-[500px] lg:max-w-[600px]"
        >
          <DialogTitle className="p-4">
            {approveRequestModal?.status == "APPROVED" ? "Approve" : "Reject"}{" "}
            Request
          </DialogTitle>
          <DialogDescription className="sr-only">
            Modal for{" "}
            {approveRequestModal?.status == "APPROVED"
              ? "approving"
              : "rejecting"}{" "}
            machine request .
          </DialogDescription>
          <div className="p-4 pt-0 text-center text-pretty">
            <div>
              Are you sure you want to{" "}
              {approveRequestModal?.status == "APPROVED" ? "approve" : "reject"}{" "}
              this request for machine{" "}
              <Badge variant={"red"}>
                {
                  requests.find((i) => i.id == approveRequestModal?.requestId)
                    ?.machine_name
                }
              </Badge>{" "}
              ?
            </div>
            <div className="flex justify-end">
              {orderApproveLoading != null ? (
                <Loader className="animate-spin" />
              ) : (
                <Button
                  onClick={() =>
                    handleUpdateRequestStatus(
                      approveRequestModal!.requestId,
                      approveRequestModal!.status
                    )
                  }
                  disabled={orderApproveLoading != null}
                  type="submit"
                  variant={
                    approveRequestModal?.status == "APPROVED" ? "green" : "red"
                  }
                >
                  {approveRequestModal?.status == "APPROVED"
                    ? "Approve"
                    : "Reject"}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ViewMachineLogs;

type MachineLogCardProps = {
  request: MachineBookingSummary;
  updateRequest: (requestId: number, status: ReservationStatusType) => void;
  loading: number | null;
};

const StatusIcons: Record<ReservationStatusType, ReactNode> = {
  NEW: <CheckCircle className="text-sidebar-border" />,
  APPROVED: <ThumbsUp className="text-sidebar-border" />,
  REJECTED: <XCircle className="text-sidebar-border" />,
  CANCELLED: <Slash className="text-sidebar-border" />,
};

const StatusColor: Record<
  ReservationStatusType,
  VariantProps<typeof badgeVariants>["variant"]
> = {
  NEW: "green",
  APPROVED: "blue",
  REJECTED: "red",
  CANCELLED: "red",
};

const MachineLogCard = ({
  request,
  updateRequest,
  loading,
}: MachineLogCardProps) => {
  const { id, booked_from, booked_till, status, machine_name, created_by } =
    request;

  return (
    <div className="grid grid-cols-[auto_1fr] gap-4">
      <div className="flex flex-col items-center">
        <div className="h-4 w-1 bg-sidebar-border"></div>
        <div>{StatusIcons[status]}</div>
        <div className="flex-1 w-1 bg-sidebar-border"></div>
      </div>
      <div className="shadow-sm p-4 my-2 bg-white dark:bg-accent rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">Request Id: {request.id}</span>
          <span className="space-x-2">
            {status === "NEW" && (
              <>
                <Button
                  disabled={loading !== null}
                  size={"sm"}
                  rounded={"sm"}
                  variant={"green"}
                  onClick={() => updateRequest(id, "APPROVED")}
                  title="Approve Request"
                  aria-description={`Approve this request. request id: ${request.id}`}
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
                  onClick={() => updateRequest(id, "REJECTED")}
                  title="Reject Request"
                  aria-description={`Reject this request. request id: ${request.id}`}
                >
                  {loading !== null && loading === id ? (
                    <Loader className="size-3 animate-spin" />
                  ) : (
                    <X className="size-3" />
                  )}
                </Button>
              </>
            )}
          </span>
        </div>

        <div className={cn("flex  items-center justify-between")}>
          <div className="mb-2 text-center flex items-center gap-2">
            <Cpu className="size-4" />
            {machine_name}
          </div>
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="grid grid-cols-[auto_1fr] items-center gap-2 flex-1 text-left text-sm leading-tight">
                  <UserCircle size={18} />
                  <span className="truncate text-sm font-medium">
                    {created_by?.first_name} {created_by?.last_name}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent
                variant={"outline"}
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
        </div>
        <div className="grid grid-cols-3 items-center mt-2">
          <div className="col-span-1 flex items-center gap-2">
            <div className="flex-1 text-sm text-nowrap">
              {format(new Date(booked_from), "PPP hh:mm aa")}
            </div>
            <Separator className="bg-amber-500  flex-auto" />
          </div>
          <div className="flex items-center">
            <Separator className="bg-amber-500 flex-auto" />
            <Badge className="mx-2" variant={StatusColor[status]}>
              {status}
            </Badge>
            <Separator className="bg-amber-500 flex-auto" />
          </div>
          <div className=" col-span-1  flex items-center gap-2">
            <Separator className="bg-amber-500 flex-auto" />
            <div className="flex-1 text-sm text-nowrap">
              {format(new Date(booked_till), "PPP hh:mm aa")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
