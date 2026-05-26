import { ILabJoinRequest } from "@/interfaces/labs";
import { useLabContext } from "@/providers/lab-provider";
import {
  approveLabJoinRequestLab,
  getLabJoinRequestLab,
  rejectLabJoinRequestLab,
} from "@/services/labs.service";
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
import { format } from "date-fns";
import { Filter } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import JoinReqTableAction from "./components/join-req-table-action";
import UserAttendanceFilters from "./components/user-join-req-filters";

const columns: ColumnDef<ILabJoinRequest, any>[] = [
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
              {user.first_name} {user.last_name}
            </span>
            <span className="truncate text-sm">{user.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Requested At",
    cell: (info) => (
      <Badge variant={"green"}>{format(info.getValue(), "PPP hh:mm a")}</Badge>
    ),
  },

  {
    accessorKey: "status",
    header: "Type",
    cell: (info) => <Badge variant={"indigo"}>{info.getValue()}</Badge>,
  },
];

const columnsAction: ColumnDef<ILabJoinRequest, any>[] = [
  ...columns,
  {
    header: "Actions",
    size: 100,
    id: "actions",
    cell: (info) => <JoinReqTableAction {...info} />,
  },
];
export const filterSchema = z.object({
  searchQuery: z.string().optional(),
});

export type JoinReqFilterSchema = z.infer<typeof filterSchema>;

export const useLabJoinRequest = () => {
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const { isLabActive } = useLabContext();
  const [approveRequestModel, setApproveJoinReqModal] = useState<{
    content: ILabJoinRequest | null;
    open: boolean;
  }>({ content: null, open: false });
  const [rejectJoinReqModal, setRejectJoinReqModal] = useState<{
    content: ILabJoinRequest | null;
    open: boolean;
  }>({ content: null, open: false });
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [attendance, setAttendance] = useState<
    PaginatedDataWithLoading<ILabJoinRequest>
  >({
    records: [],
    loading: false,
    count: 0,
    skip: 0,
    take: 0,
  });
  const getFilters = (filters: JoinReqFilterSchema) => {
    return {
      searchQuery: filters.searchQuery,
    };
  };

  const form = useForm<JoinReqFilterSchema>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      searchQuery: "",
    },
  });
  const fetchJoinLabList = async (param: AttendanceSearchQuery) => {
    let res: PaginatedData<ILabJoinRequest> = {
      count: 0,
      records: [],
      skip: 0,
      take: 0,
    };

    try {
      const data = await getLabJoinRequestLab({
        skip: param.skip,
        take: param.take,
        searchQuery: param.searchQuery,
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

  const getLabJoinRequest = async (param?: any) => {
    setAttendance({ count: 0, records: [], skip: 0, take: 0, loading: true });
    const data = await fetchJoinLabList(param || {});
    setAttendance({ ...data, loading: false });
    setPagination({
      pageIndex: (data.skip && data.skip / data.take) || 0,
      pageSize: data.take,
    });
  };

  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    const newState =
      typeof updater === "function" ? updater({ ...pagination }) : updater;

    getLabJoinRequest({
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
    getRowId: (row) => row!.request_id!.toString(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,

    meta: {
      rejectJoin: (data: ILabJoinRequest) =>
        setRejectJoinReqModal({ content: data, open: true }),
      approveJoin: (data: ILabJoinRequest) =>
        setApproveJoinReqModal({ content: data, open: true }),
    },
  });

  const handleApproveJoinReq = async () => {
    setLoading(true);
    try {
      const res = await approveLabJoinRequestLab(
        approveRequestModel.content!.request_id,
      );

      if (!res.error) {
        setAttendance({
          ...attendance,
          records: attendance.records.filter(
            (i) => i.request_id == approveRequestModel.content!.request_id,
          ),
        });
        getLabJoinRequest({
          ...getFilters(form.getValues()),
        });
        toast.success("Join request approved Successfully");
        setApproveJoinReqModal({ content: null, open: false });
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };
  const handleRejectJoinReq = async () => {
    if (!rejectJoinReqModal.content) return;
    setLoading(true);
    try {
      const res = await rejectLabJoinRequestLab(
        rejectJoinReqModal.content!.request_id,
      );
      if (!res.error) {
        setRejectJoinReqModal({ content: null, open: false });
        getLabJoinRequest({
          ...getFilters(form.getValues()),
        });
        toast.success("Join request rejected Successfully");
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };
  const handleFilterChange = async (param: JoinReqFilterSchema) => {
    await getLabJoinRequest({
      ...getFilters(param),
      skip: 0,
      take: pagination.pageSize,
    });
  };

  const handleClearFilter = async (isDirty: boolean) => {
    try {
      if (isDirty) {
        await getLabJoinRequest({ skip: 0, take: pagination.pageSize });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
  };

  return {
    table,
    handleFilterChange,
    handleRejectJoinReq,
    handleApproveJoinReq,
    setFilterOpen,
    filterOpen,
    attendance,
    form,
    approveRequestModel,
    setApproveJoinReqModal,
    rejectJoinReqModal,
    setRejectJoinReqModal,
    handleClearFilter,
    loading,
    getLabJoinRequest,
  };
};

type AttendanceSearchQuery = {
  searchQuery?: string;
} & IGenericQueryParam;
type Props = ReturnType<typeof useLabJoinRequest>;
const LabJoinRequest = ({
  table,
  filterOpen,
  setFilterOpen,
  attendance,
  form,
  approveRequestModel,
  setApproveJoinReqModal,
  rejectJoinReqModal,
  setRejectJoinReqModal,
  handleFilterChange,
  handleClearFilter,
  handleRejectJoinReq,
  handleApproveJoinReq,
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
        onOpenChange={(e) => setRejectJoinReqModal({ open: e, content: null })}
        open={rejectJoinReqModal.open}
        onConfirmClick={handleRejectJoinReq}
        title={"Reject Join Request"}
        variant="danger"
        desc={
          <div className="space-y-2">
            <div>Are you sure you want to reject join request for user</div>
            <div className="flex gap-2 items-center w-max">
              <Avatar className="size-8 rounded-full">
                <AvatarImage
                  src={(rejectJoinReqModal.content?.user as any)?.image_link}
                  alt={rejectJoinReqModal.content?.user?.first_name}
                />
                <AvatarFallback className="rounded-lg uppercase text-xs">
                  {rejectJoinReqModal.content?.user?.first_name?.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-sm font-medium">
                  {rejectJoinReqModal.content?.user?.first_name}{" "}
                  {rejectJoinReqModal.content?.user?.last_name}
                </span>
                <span className="truncate text-sm">
                  {rejectJoinReqModal.content?.user?.email}
                </span>
              </div>
            </div>
            for lab{" "}
            <Badge variant={"indigo"}>
              {rejectJoinReqModal.content?.lab_name}
            </Badge>
            ?
          </div>
        }
      />
      <GenericModal
        loading={loading}
        onOpenChange={(e) => setApproveJoinReqModal({ open: e, content: null })}
        open={approveRequestModel.open}
        onConfirmClick={handleApproveJoinReq}
        title={"Approve Join Request"}
        variant="success"
        desc={
          <div className="space-y-2">
            <div>Are you sure you want to approve join request for user</div>
            <div className="flex gap-2 items-center w-max">
              <Avatar className="size-8 rounded-full">
                <AvatarImage
                  src={(approveRequestModel.content?.user as any)?.image_link}
                  alt={approveRequestModel.content?.user?.first_name}
                />
                <AvatarFallback className="rounded-lg uppercase text-xs">
                  {approveRequestModel.content?.user?.first_name?.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-sm font-medium">
                  {approveRequestModel.content?.user?.first_name}{" "}
                  {approveRequestModel.content?.user?.last_name}
                </span>
                <span className="truncate text-sm">
                  {approveRequestModel.content?.user?.email}
                </span>
              </div>
            </div>
            for lab{" "}
            <Badge variant={"indigo"}>
              {approveRequestModel.content?.lab_name}
            </Badge>
            ?
          </div>
        }
      />
    </>
  );
};

export default LabJoinRequest;
