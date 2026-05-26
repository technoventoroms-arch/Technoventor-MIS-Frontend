import { ICheckInRecords } from "@/interfaces/attendance";
import { useLabContext } from "@/providers/lab-provider";
import { getAdminAttendance } from "@/services/admin.service";
import { updateAttendanceStatus } from "@/services/user.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataTable } from "@mono/shared_ui/components/shared/data-table";
import GenericModal from "@mono/shared_ui/components/shared/generic-modal";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mono/shared_ui/components/ui/avatar";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import {
  IGenericQueryParam,
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
import { format, intervalToDuration } from "date-fns";
import { Filter } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import UserAttendanceFilters from "./components/user-attendance-filters";
import UserAttendanceTableAction from "./components/user-attendance-table-action";

const columns: ColumnDef<ICheckInRecords, any>[] = [
  {
    accessorKey: "user",
    header: "User",
    cell: (info) => {
      const user = info.getValue();
      return (
        <div className="flex gap-2 items-center w-max">
          <Avatar className="size-8 rounded-full">
            <AvatarImage src={user.image_link} alt={user.first_name} />
            <AvatarFallback className="rounded-lg uppercase text-xs">
              {user.first_name?.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate text-sm font-medium">
              {user.first_name}
            </span>
            <span className="truncate text-sm">{user.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "check_in_at",
    header: "Check-in At",
    cell: (info) => (
      <Badge variant={"green"}>{format(info.getValue(), "PPP hh:mm a")}</Badge>
    ),
  },
  {
    accessorKey: "check_out_at",
    header: "Check-Out At",
    cell: (info) => (
      <Badge variant={"yellow"}>
        {info.getValue() && format(info.getValue(), "PPP hh:mm a")}
      </Badge>
    ),
  },
  {
    header: "Clocked Time",
    cell: (info) => {
      const { hours, minutes, seconds } = intervalToDuration({
        end: info.row.original.check_out_at
          ? new Date(info.row.original.check_out_at).toISOString()
          : new Date().toISOString(),
        start: new Date(info.row.original.check_in_at).toISOString(),
      });
      return (
        <Badge variant={"default"}>
          {`${hours || "00"}`.padStart(2, "0")}:{" "}
          {`${minutes || "00"}`.padStart(2, "0")}:
          {`${seconds || "00"}`.padStart(2, "0")}
        </Badge>
      );
    },
  },

  {
    accessorKey: "status",
    header: "Type",
    cell: (info) => <Badge variant={"indigo"}>{info.getValue()}</Badge>,
  },
];

const columnsAction: ColumnDef<ICheckInRecords, any>[] = [
  ...columns,
  {
    header: "Actions",
    size: 100,
    id: "actions",
    cell: (info) => <UserAttendanceTableAction {...info} />,
  },
];
export const filterSchema = z.object({
  from: z.date().nullable().optional(),
  to: z.date().nullable().optional(),
  status: z.string().optional(),
});

export type AttendanceFilterSchema = z.infer<typeof filterSchema>;

export const useAdminAttendanceRequest = () => {
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const { isLabActive } = useLabContext();
  const [approveRequestModel, setApproveRequestModel] = useState<{
    content: ICheckInRecords | null;
    open: boolean;
  }>({ content: null, open: false });
  const [rejectAttendanceModal, setRejectAttendanceModal] = useState<{
    content: ICheckInRecords | null;
    open: boolean;
  }>({ content: null, open: false });
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [attendance, setAttendance] = useState<
    PaginatedDataWithLoading<ICheckInRecords>
  >({
    records: [],
    loading: false,
    count: 0,
    skip: 0,
    take: 0,
  });
  const getFilters = (filters: AttendanceFilterSchema) => {
    return {
      from: filters?.from?.toISOString(),
      to: filters?.to?.toISOString(),
    };
  };

  const form = useForm<AttendanceFilterSchema>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      status: "",
      from: null,
      to: null,
    },
  });
  const fetchUserAttendanceList = async (param: AttendanceSearchQuery) => {
    let res: PaginatedData<ICheckInRecords> = {
      count: 0,
      records: [],
      skip: 0,
      take: 0,
    };
    try {
      const data = await getAdminAttendance({
        skip: param.skip,
        take: param.take,
        fromDate: param.from,
        toDate: param.to,
        status: param.status,
      });
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

  const getAllAttendance = async (param?: any) => {
    setAttendance({ count: 0, records: [], skip: 0, take: 0, loading: true });
    const data = await fetchUserAttendanceList(param || {});
    setAttendance({ ...data, loading: false });
    setPagination({
      pageIndex: (data.skip && data.skip / data.take) || 0,
      pageSize: data.take,
    });
  };

  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    const newState =
      typeof updater === "function" ? updater({ ...pagination }) : updater;

    getAllAttendance({
      ...getFilters(form.getValues()),
      skip: newState.pageIndex * newState.pageSize,
      take: newState.pageSize,
    });
  };

  const table = useReactTable({
    data: attendance.records,
    columns: isLabActive ? columnsAction : columns,
    state: {
      columnVisibility,
      pagination,
      columnPinning: {
        right: ["actions"],
      },
    },

    rowCount: attendance.count,
    getRowId: (row) => row!.id!.toString(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,

    meta: {
      rejectAttendance: (data: ICheckInRecords) =>
        setRejectAttendanceModal({ content: data, open: true }),
      approveAttendance: (data: ICheckInRecords) =>
        setApproveRequestModel({ content: data, open: true }),
    },
  });

  const handleApproveRequest = async () => {
    setLoading(true);
    try {
      const res = await updateAttendanceStatus(
        approveRequestModel.content!.user!.identity_provider_id,
        approveRequestModel.content!.id,
        "APPROVED"
      );

      if (!res.error) {
        setAttendance({
          ...attendance,
          records: attendance.records.filter((i) => i.id == res.data.id),
        });
        getAllAttendance({
          ...getFilters(form.getValues()),
        });
        toast.success("Attendance approved Successfully");
        setApproveRequestModel({ content: null, open: false });
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };
  const handleRejectAttendance = async () => {
    if (!rejectAttendanceModal.content) return;
    setLoading(true);
    try {
      const res = await updateAttendanceStatus(
        rejectAttendanceModal.content!.user.identity_provider_id,
        rejectAttendanceModal.content!.id,
        "REJECTED"
      );
      if (!res.error) {
        setRejectAttendanceModal({ content: null, open: false });
        getAllAttendance({
          ...getFilters(form.getValues()),
        });
        toast.success("Attendance rejected Successfully");
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };
  const handleFilterChange = async (param: {
    from?: Date | null;
    to?: Date | null;
  }) => {
    await getAllAttendance({
      ...getFilters(param),
      skip: 0,
      take: pagination.pageSize,
    });
  };

  const handleClearFilter = async (isDirty: boolean) => {
    try {
      if (isDirty) {
        await getAllAttendance({ skip: 0, take: pagination.pageSize });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
  };
  return {
    table,
    handleFilterChange,
    handleRejectAttendance,
    handleApproveRequest,
    setFilterOpen,
    filterOpen,
    attendance,
    form,
    approveRequestModel,
    setApproveRequestModel,
    rejectAttendanceModal,
    setRejectAttendanceModal,
    handleClearFilter,
    loading,
    getAllAttendance,
  };
};

type AttendanceSearchQuery = {
  from?: Date | null;
  to?: Date | null;
  status?: string;
} & IGenericQueryParam;
type Props = ReturnType<typeof useAdminAttendanceRequest>;
const AttendanceRequest = ({
  table,
  filterOpen,
  setFilterOpen,
  attendance,
  form,
  approveRequestModel,
  setApproveRequestModel,
  rejectAttendanceModal,
  setRejectAttendanceModal,
  handleFilterChange,
  handleClearFilter,
  handleRejectAttendance,
  handleApproveRequest,
  loading,
}: Props) => {
  return (
    <>
      <DataTable
        table={table}
        loading={attendance.loading}
        tableBodyClassName="**:data-[slot=table-cell]:first:w-auto **:data-[slot=table-cell]:last:w-auto"
        filterComponent={
          filterOpen && (
            <FormProvider {...form}>
              <UserAttendanceFilters
                handleFilterClear={(e) => {
                  setFilterOpen(false);
                  handleClearFilter(e);
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
                onClick={() => setFilterOpen(!filterOpen)}
                title="Filter Attendance"
                rounded={"xs"}
              >
                <Filter />
                <span className="sr-only">Open Filter</span>
              </Button>
            </div>
          </>
        }
      />
      <GenericModal
        loading={loading}
        onOpenChange={(e) =>
          setRejectAttendanceModal({ open: e, content: null })
        }
        open={rejectAttendanceModal.open}
        onConfirmClick={handleRejectAttendance}
        title={"Reject Attendance"}
        variant="danger"
        desc={
          <>
            Are you sure you want to reject attendance{" "}
            <Badge variant={"blue"}>
              {rejectAttendanceModal.content?.check_in_at &&
                format(rejectAttendanceModal.content?.check_in_at, "PPP")}
            </Badge>
            ?
          </>
        }
      />
      <GenericModal
        loading={loading}
        onOpenChange={(e) => setApproveRequestModel({ open: e, content: null })}
        open={approveRequestModel.open}
        onConfirmClick={handleApproveRequest}
        title={"Approve Attendance"}
        variant="success"
        desc={
          <>
            Are you sure you want to approve attendance{" "}
            <Badge variant={"blue"}>
              {approveRequestModel.content?.check_in_at &&
                format(approveRequestModel.content?.check_in_at, "PPP")}
            </Badge>
            ?
          </>
        }
      />
    </>
  );
};

export default AttendanceRequest;
