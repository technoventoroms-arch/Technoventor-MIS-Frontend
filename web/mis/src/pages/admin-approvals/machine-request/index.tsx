import {
  IUserMacReservationQueryParams,
  MachineBookingSummary,
  ReservationStatusType,
} from "@/interfaces/reservation";
import { MachineReqFilterSchema } from "@/pages/my-orders/machine-request/filter";
import { getMachineReservationsForAdmin } from "@/services/admin.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataTable } from "@mono/shared_ui/components/shared/data-table";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import { PaginatedDataWithLoading } from "@mono/shared_ui/interfaces/utils";
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
import MachineRequestFilters from "./filter";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@mono/shared_ui/components/ui/avatar";
import MachineTableAction from "./machine-table-action";
import { updateMachineReservations } from "@/services/machine.service";
import GenericModal from "@mono/shared_ui/components/shared/generic-modal";

const columns: ColumnDef<MachineBookingSummary, any>[] = [
  {
    accessorKey: "created_by",
    header: "Requested By",
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
    accessorKey: "status",
    header: "Status",
    cell: (info) => <Badge variant={"blue"}>{info.getValue()}</Badge>,
  },

  {
    accessorKey: "machine_name",
    header: "Machine Name",
  },
  {
    accessorKey: "booked_from",
    header: "Booked From",
    cell: (info) => (
      <Badge variant={"green"}>
        <ClockPlus className="mr-1" />
        {format(info.getValue(), "PPP hh:mm aa")}
      </Badge>
    ),
  },
  {
    accessorKey: "booked_till",
    header: "Booked Till",
    cell: (info) => (
      <Badge variant={"yellow"}>
        <ClockPlus className="mr-1" />
        {format(info.getValue(), "PPP hh:mm aa")}
      </Badge>
    ),
  },

  {
    accessorKey: "created_at",
    header: "Requested At",
    cell: (info) => (
      <Badge variant={"green"}>
        <ClockPlus className="mr-1" />
        {format(info.getValue(), "PPP")}
      </Badge>
    ),
  },
  {
    header: "Actions",
    size: 100,
    id: "actions",
    cell: (info) => <MachineTableAction {...info} />,
  },
];

export const filterSchema = z.object({
  searchQuery: z.string(),
  status: z.string(),
  from: z.date().nullable(),
  to: z.date().nullable(),
});

export type zodFilterSchema = z.infer<typeof filterSchema>;
export const useAdminMachineRequest = () => {
  const [loading, setLoading] = useState(false);
  const form = useForm<zodFilterSchema>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      searchQuery: "",
      status: "",
      from: null,
      to: null,
    },
  });
  const [approveRequestModel, setApproveRequestModel] = useState<{
    content: MachineBookingSummary | null;
    open: boolean;
  }>({ content: null, open: false });
  const [rejectRequestModal, setRejectRequestModal] = useState<{
    content: MachineBookingSummary | null;
    open: boolean;
  }>({ content: null, open: false });
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [machineRequest, setMachineRequest] = useState<
    PaginatedDataWithLoading<MachineBookingSummary>
  >({
    count: 0,
    records: [],
    skip: 0,
    take: 0,
    loading: false,
  });
  const [filterOpen, setFiltrOpen] = useState(false);

  const getFilters = (filters: MachineReqFilterSchema) => {
    return {
      fromDate: filters?.fromDate?.toISOString(),
      status: (filters.status == "ALL"
        ? ""
        : filters.status) as ReservationStatusType,
      toDate: filters?.toDate?.toISOString(),
    };
  };

  const fetchMachineRequest = async (
    params?: IUserMacReservationQueryParams
  ) => {
    setMachineRequest((prev) => ({ ...prev, loading: true, records: [] }));
    try {
      const data = await getMachineReservationsForAdmin(params);
      if (!data.error) {
        setMachineRequest({
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
      setMachineRequest((prev) => ({ ...prev, records: [], loading: false }));
    }
  };

  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    const newState =
      typeof updater === "function" ? updater({ ...pagination }) : updater;

    fetchMachineRequest({
      ...getFilters(form.getValues()),
      skip: newState.pageIndex * newState.pageSize,
      take: newState.pageSize,
    });
  };

  const handleFilterChange = async (data: MachineReqFilterSchema) => {
    try {
      await fetchMachineRequest({
        ...getFilters(data as any),
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
        await fetchMachineRequest({ skip: 0, take: pagination.pageSize });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
  };
  const approveRequest = async () => {
    setLoading(true);
    const item = approveRequestModel.content!;
    try {
      await updateMachineReservations(item.project_id, item.id, "APPROVED");
      toast.success("Request approved successfully");
      fetchMachineRequest({
        ...getFilters(form.getValues()),
      });
      setApproveRequestModel({ content: null, open: false });
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
      await updateMachineReservations(item.project_id, item.id, "REJECTED");
      fetchMachineRequest({
        ...getFilters(form.getValues()),
      });
      setRejectRequestModal({ content: null, open: false });
      toast.success("Request approved successfully");
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };
  const table = useReactTable({
    data: machineRequest.records,
    columns: columns,
    state: {
      pagination,
      columnPinning: { right: ["actions"] },
    },
    rowCount: machineRequest.count,
    getRowId: (row) => row.id.toString(),
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    meta: {
      approveRequest: (e: any) =>
        setApproveRequestModel({ content: e, open: true }),
      rejectRequest: (e: any) =>
        setRejectRequestModal({ content: e, open: true }),
    },
  });

  return {
    machineRequest,
    table,
    fetchMachineRequest,
    handleFilterChange,
    handleClearFilter,
    filterOpen,
    setFiltrOpen,
    form,
    setApproveRequestModel,
    setRejectRequestModal,
    approveRequestModel,
    rejectRequestModal,
    approveRequest,
    rejectRequest,
    loading,
  };
};
type Props = ReturnType<typeof useAdminMachineRequest>;
const MachineRequests = ({
  machineRequest,
  table,
  handleFilterChange,
  handleClearFilter,
  filterOpen,
  setFiltrOpen,
  form,
  approveRequestModel,
  setApproveRequestModel,
  rejectRequestModal,
  setRejectRequestModal,
  approveRequest,
  rejectRequest,
  loading,
}: Props) => {
  return (
    <>
      <DataTable
        table={table}
        loading={machineRequest.loading}
        tableBodyClassName="**:data-[slot=table-cell]:first:w-auto **:data-[slot=table-cell]:last:w-auto"
        filterComponent={
          filterOpen && (
            <FormProvider {...form}>
              <MachineRequestFilters
                handleFilterClear={(e) => {
                  setFiltrOpen(false);
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
      <GenericModal
        loading={loading}
        onOpenChange={(e) => setRejectRequestModal({ open: e, content: null })}
        open={rejectRequestModal.open}
        onConfirmClick={rejectRequest}
        title={"Reject Request"}
        variant="danger"
        desc={
          <>
            Are you sure you want to reject machine reservation request for
            machine{" "}
            <Badge variant={"blue"}>
              {rejectRequestModal.content?.machine_name}
            </Badge>{" "}
            from{" "}
            <Badge variant={"yellow"}>
              {rejectRequestModal.content &&
                format(rejectRequestModal.content.booked_from, "PPP hh:mm aa")}
            </Badge>
            to
            <Badge variant={"yellow"}>
              {rejectRequestModal.content &&
                format(rejectRequestModal.content.booked_till, "PPP hh:mm aa")}
            </Badge>{" "}
            for the project{" "}
            <Badge variant={"blue"}>
              {rejectRequestModal.content?.project_title}
            </Badge>{" "}
            ?
          </>
        }
      />

      <GenericModal
        loading={loading}
        onOpenChange={(e) => setApproveRequestModel({ open: e, content: null })}
        open={approveRequestModel.open}
        onConfirmClick={approveRequest}
        title={"Approve Request"}
        variant="success"
        desc={
          <>
            Are you sure you want to approve machine reservation request for
            machine{" "}
            <Badge variant={"blue"}>
              {approveRequestModel.content?.machine_name}
            </Badge>{" "}
            from{" "}
            <Badge variant={"yellow"}>
              {approveRequestModel.content &&
                format(approveRequestModel.content.booked_from, "PPP hh:mm aa")}
            </Badge>
            to
            <Badge variant={"yellow"}>
              {approveRequestModel.content &&
                format(approveRequestModel.content.booked_till, "PPP hh:mm aa")}
            </Badge>{" "}
            for the project{" "}
            <Badge variant={"blue"}>
              {approveRequestModel.content?.project_title}
            </Badge>{" "}
            ?
          </>
        }
      />
    </>
  );
};

export default MachineRequests;
