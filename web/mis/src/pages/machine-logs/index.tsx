import { machineStatusToVariant } from "@/constants/machine-status.constants";
import { routeConstants } from "@/constants/route.constants";
import { IMachine, MachineLog } from "@/interfaces/machines";
import { useLabContext } from "@/providers/lab-provider";
import { getMachineById, getMachineLogsList } from "@/services/machine.service";
import { DataTable } from "@mono/shared_ui/components/shared/data-table";
import { SiteHeader } from "@mono/shared_ui/components/shared/site-header";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mono/shared_ui/components/ui/avatar";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Input } from "@mono/shared_ui/components/ui/input";
import {
  DataWithLoading,
  IGenericQueryParam,
  PaginatedData,
  PaginatedDataWithLoading,
} from "@mono/shared_ui/interfaces/utils";
import { debounce, getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import {
  ColumnDef,
  getCoreRowModel,
  PaginationState,
  Updater,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { MoveRight } from "lucide-react";
import React, { BaseSyntheticEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const columns: ColumnDef<MachineLog, any>[] = [
  {
    accessorKey: "created_by",
    header: "Triggered By",
    enableHiding: false,
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
    accessorKey: "name",
    header: "Status Change",
    enableHiding: false,
    cell: (info) => (
      <div className="flex gap-2 items-center w-max">
        <Badge
          variant={
            machineStatusToVariant[info.row.original.previous_status] as any
          }
        >
          {info.row.original.previous_status}
        </Badge>
        <MoveRight />
        <Badge
          variant={machineStatusToVariant[info.row.original.new_status] as any}
        >
          {info.row.original.new_status}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "reference",
    header: "Reference",
    cell: (info) => info.getValue() || "--",
  },
  {
    accessorKey: "created_at",
    header: "Logged On",
    enableHiding: false,
    cell: (info) => (
      <Badge variant={"yellow"}>
        {info.getValue() && format(info.getValue(), "PPP hh:mm a")}
      </Badge>
    ),
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: (info) => info.getValue() || "--",
  },
];

const MachineLogsPage = () => {
  const params = useParams();
  const { baseUrl } = useLabContext();

  const machineId = Math.abs(Number.parseInt(params.machineId || ""));
  const [machineDetails, setMachineDetails] = useState<
    DataWithLoading<IMachine | null>
  >({ data: null, loading: false });

  const [machine, setMachines] = useState<PaginatedDataWithLoading<MachineLog>>(
    {
      records: [],
      loading: false,
      count: 0,
      skip: 0,
      take: 0,
    }
  );

  const [filters, setFilters] = useState<IGenericQueryParam>({
    searchQuery: "",
  });

  const fetchMachineLogsList = async (params: IGenericQueryParam) => {
    let res: PaginatedData<MachineLog> = {
      count: 0,
      records: [],
      skip: 0,
      take: 0,
    };
    try {
      const data = await getMachineLogsList(machineId, params);
      if (!data.error) {
        res = data.data;
        res.records = res.records || [];
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    }
    return res;
  };

  const getMachineLogs = async (
    param: IGenericQueryParam & { status?: string }
  ) => {
    setMachines({ count: 0, records: [], skip: 0, take: 0, loading: true });
    const data = await fetchMachineLogsList(param);
    setMachines({ ...data, loading: false });
    setPagination({
      pageIndex: (data.skip && data.skip / data.take) || 0,
      pageSize: data.take,
    });
  };
  const searchHandle = (e: BaseSyntheticEvent) => {
    const search = e.target.value.trim();
    setFilters({ searchQuery: search });
    getMachineLogs({
      searchQuery: search,
      skip: 0,
      take: 10,
    });
  };
  const handleDebounceSearch = useMemo(() => {
    return debounce(searchHandle);
  }, []);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    const newState =
      typeof updater === "function" ? updater({ ...pagination }) : updater;
    getMachineLogs({
      ...filters,
      skip: newState.pageIndex * newState.pageSize,
      take: newState.pageSize,
    });
  };
  const table = useReactTable({
    data: machine.records,
    columns: columns,
    state: {
      columnVisibility,
      pagination,
      columnPinning: { right: ["actions"] },
    },
    rowCount: machine.count,
    getRowId: (row) => row!.id!.toString(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    meta: {},
  });

  const getMachineInfo = async () => {
    setMachineDetails({
      data: null,
      loading: true,
    });
    try {
      const res = await getMachineById(machineId);
      if (!res.error) {
        setMachineDetails({
          data: res.data,
          loading: false,
        });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
  };

  useEffect(() => {
    getMachineInfo();
    getMachineLogs({
      searchQuery: filters.searchQuery,
      skip: pagination.pageIndex * pagination.pageSize,
      take: pagination.pageSize,
    });
  }, []);

  return (
    <>
      <SiteHeader
        breadCrumbs={[
          {
            title: "Manage Machine",
            url: `/${baseUrl}/${routeConstants.MACHINES}`,
          },
          {
            title: `Logs - ${machineDetails.data?.name}`,
            url: "",
            loading: machineDetails.loading,
          },
        ]}
      />
      <div className="@container/main flex flex-1 flex-col gap-2 p-2 overflow-hidden ">
        <DataTable
          table={table}
          loading={machine.loading}
          tableBodyClassName="**:data-[slot=table-cell]:first:w-auto **:data-[slot=table-cell]:last:w-auto"
          extraTableContent={
            <>
              <Input
                onChange={handleDebounceSearch}
                type="search"
                className="h-8 w-auto ml-2"
                placeholder="Search logs"
              />
              <div className="ml-auto "></div>
            </>
          }
        />
      </div>
    </>
  );
};

export default MachineLogsPage;
