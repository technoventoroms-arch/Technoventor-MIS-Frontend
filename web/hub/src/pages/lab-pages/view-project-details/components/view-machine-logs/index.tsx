import {
  MachineBookingSummary,
  ReservationStatusType,
} from "@/interfaces/reservation";
import TablePagination from "@mono/shared_ui/components/shared/table-pagination";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mono/shared_ui/components/ui/avatar";
import { Badge, badgeVariants } from "@mono/shared_ui/components/ui/badge";
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
  Slash,
  ThumbsUp,
  UserCircle,
  XCircle,
} from "lucide-react";
import { ReactNode } from "react";
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
  table: Table<MachineBookingSummary>;
  filters: ColumnFiltersState;
};
const ViewMachineLogs = ({
  requests,
  loading,
  table,
  filters,
}: ViewMachineLogsProps) => {
  return (
    <>
      <div>
        <div className="flex justify-between items-center my-2">
          <MachineFilter table={table} filters={filters} />
        </div>
        <ul className="flex flex-col ">
          {loading
            ? listSkeleton
            : requests.map((i) => <MachineLogCard key={i.id} request={i} />)}
          {!requests.length && !loading && (
            <div className="text-rose-700 bg-rose-500/15 p-4 my-4 rounded flex items-center gap-2">
              <Info /> No machine logs for this project.
            </div>
          )}
        </ul>
        <TablePagination table={table} className="ml-auto" />
      </div>
    </>
  );
};

export default ViewMachineLogs;

type MachineLogCardProps = {
  request: MachineBookingSummary;
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

const MachineLogCard = ({ request }: MachineLogCardProps) => {
  const { booked_from, booked_till, status, machine_name, created_by } =
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
              {booked_from && format(new Date(booked_from), "PPP hh:mm aa")}
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
              {booked_till && format(new Date(booked_till), "PPP hh:mm aa")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
