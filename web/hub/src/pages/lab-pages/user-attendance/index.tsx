import { routeConstants } from "@/constants/route.constants";
import { IAttendance } from "@/interfaces/attendance";
import { useLabContext } from "@/providers/lab-provider";
import { getLabUserById, getUserAttendanceById } from "@/services/user.service";
import { DataTable } from "@mono/shared_ui/components/shared/data-table";
import { SiteHeader } from "@mono/shared_ui/components/shared/site-header";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Skeleton } from "@mono/shared_ui/components/ui/skeleton";
import { IUser } from "@mono/shared_ui/interfaces/user";
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
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import UserAttendanceFilters, {
  AttendanceFilterSchema,
} from "./components/user-attendance-filters";

const columns: ColumnDef<IAttendance, any>[] = [
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
          {hours || "00"}: {minutes || "00"}:{seconds || "00"}
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
type AttendanceSearchQuery = {
  from?: Date | null;
  to?: Date | null;
  status?: string;
} & IGenericQueryParam;

const UserAttendance = () => {
  const { labData, baseUrl } = useLabContext();
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<AttendanceFilterSchema>({
    status: "",
    from: null,
    to: null,
  });
  const [userInfo, setUserInfo] = useState<IUser | null>(null);

  const param = useParams();
  const userId = param?.userId || "";

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [attendance, setAttendance] = useState<
    PaginatedDataWithLoading<IAttendance>
  >({
    records: [],
    loading: false,
    count: 0,
    skip: 0,
    take: 0,
  });
  const fetchUserAttendanceList = async (
    userId: string,
    param: AttendanceSearchQuery
  ) => {
    let res: PaginatedData<IAttendance> = {
      count: 0,
      records: [],
      skip: 0,
      take: 0,
    };
    try {
      const data = await getUserAttendanceById(userId, {
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

  const getUserAttendance = async (
    userId: string,
    param: AttendanceSearchQuery
  ) => {
    setAttendance({ count: 0, records: [], skip: 0, take: 0, loading: true });
    const data = await fetchUserAttendanceList(userId, param);
    setAttendance({ ...data, loading: false });
    setPagination({
      pageIndex: (data.skip && data.skip / data.take) || 0,
      pageSize: data.take,
    });
  };

  const getUserInfo = async () => {
    try {
      const res = await getLabUserById(userId);
      setUserInfo(res.data);
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
  };
  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    const newState =
      typeof updater === "function" ? updater({ ...pagination }) : updater;
    if (Number.parseInt(param?.userId || ""))
      getUserAttendance(param?.userId || "", {
        ...filters,
        skip: newState.pageIndex * newState.pageSize,
        take: newState.pageSize,
      });
  };

  const table = useReactTable({
    data: attendance.records,
    columns: columns,
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
  });

  const handleFilterChange = async (param: {
    from?: Date | null;
    to?: Date | null;
    status?: string;
  }) => {
    await getUserAttendance(userId, {
      skip: 0,
      take: pagination.pageSize,
      ...param,
      status: param.status,
    });
    setFilters(param as any);
  };
  useEffect(() => {
    if (labData?.lab_id && userId) {
      getUserAttendance(userId, {
        skip: pagination.pageIndex * pagination.pageSize,
        take: pagination.pageSize,
      });
      getUserInfo();
    }
  }, [labData?.lab_id, userId]);

  return (
    <>
      <SiteHeader
        breadCrumbs={[
          {
            title: "Users",
            url: `/${baseUrl}/${routeConstants.USERS}`,
          },
          {
            title: userInfo ? (
              <div>
                {userInfo.first_name} {userInfo.last_name}
              </div>
            ) : (
              <Skeleton className="h-6 w-40" />
            ),
            url: "",
          },
        ]}
      />
      <div className="@container/main flex flex-1 flex-col gap-2 p-2 overflow-hidden ">
        <DataTable
          table={table}
          loading={attendance.loading}
          tableBodyClassName="**:data-[slot=table-cell]:first:w-auto **:data-[slot=table-cell]:last:w-auto"
          filterComponent={
            filterOpen && (
              <UserAttendanceFilters
                defaultValue={filters}
                handleFilterClear={() => {
                  setFilterOpen(false);
                  handleFilterChange({});
                }}
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
      </div>
    </>
  );
};

export default UserAttendance;
