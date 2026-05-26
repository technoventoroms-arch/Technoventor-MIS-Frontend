import { IAttendance } from "@/interfaces/attendance";
import { useLabContext } from "@/providers/lab-provider";
import { useUser } from "@/providers/user-info-provider";
import {
  addNewAttendance,
  getUsersAttendance,
  regularizeAttendance,
} from "@/services/user.service";
import { DataTable } from "@mono/shared_ui/components/shared/data-table";
import ResponsiveDrawer from "@mono/shared_ui/components/shared/responsive-drawer";
import { SiteHeader } from "@mono/shared_ui/components/shared/site-header";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import { DrawerContent } from "@mono/shared_ui/components/ui/drawer";
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
import { Filter, UserCheck2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AttendanceFilters, {
  AttendanceFilterSchema,
} from "./components/attendance-filters";
import AttendanceTableAction from "./components/attendance-table-action";
import RegularizeForm from "./components/regularize-form";
import TodayAttendance from "./components/today-attendnce";
const columns: ColumnDef<IAttendance, any>[] = [
  {
    accessorKey: "check_in_at",
    header: "Check-in At",
    cell: (info) => (
      <Badge variant={"green"}>{format(info.getValue(), "PPP hh:mm aa")}</Badge>
    ),
  },
  {
    accessorKey: "check_out_at",
    header: "Check-Out At",
    cell: (info) => (
      <Badge variant={"yellow"}>
        {info.getValue() && format(info.getValue(), "PPP hh:mm aa")}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (info) => <Badge variant={"indigo"}>{info.getValue()}</Badge>,
  },

  {
    header: "Actions",
    size: 80,
    cell: (info) => <AttendanceTableAction {...info} />,
  },
];
type AttendanceSearchQuery = {
  from?: Date | null;
  to?: Date | null;
  status?: string;
} & IGenericQueryParam;
const MyAttendance = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const { labId, isLabActive } = useLabContext();

  const [filterOpen, setFilterOpen] = useState(false);
  const [editAttendanceModal, setEditAttendanceModal] = useState<{
    content: IAttendance | null;
    open: boolean;
  }>({ content: null, open: false });
  const [newAttendanceModalOpen, setNewAttendanceModalOpen] = useState(false);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [filters, setFilters] = useState<AttendanceFilterSchema>({
    status: "",
    from: null,
    to: null,
  });
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
  const fetchAttendanceList = async (param: AttendanceSearchQuery) => {
    let res: PaginatedData<IAttendance> = {
      count: 0,
      records: [],
      skip: 0,
      take: 0,
    };
    try {
      const data = await getUsersAttendance({
        skip: param.skip,
        take: param.take,
        status: param.status,
        fromDate: param.from,
        toDate: param.to,
      });

      if (!data.error && data.data) {
        res = data.data;
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    }
    return res;
  };

  const getAttendance = async (param: AttendanceSearchQuery) => {
    setAttendance({ count: 0, records: [], skip: 0, take: 0, loading: true });
    const data = await fetchAttendanceList(param);
    const records = data.records || [];
    setAttendance({ ...data, records, loading: false });
    setPagination({
      pageIndex: (data.skip && data.skip / data.take) || 0,
      pageSize: data.take,
    });
  };

  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    const newState =
      typeof updater === "function" ? updater({ ...pagination }) : updater;

    getAttendance({
      skip: newState.pageIndex * newState.pageSize,
      take: newState.pageSize,
    });
  };
  const handleFilterChange = async (param: {
    from?: Date | null;
    to?: Date | null;
    status?: string;
  }) => {
    await getAttendance({
      ...param,
      skip: 0,
      take: pagination.pageSize,
    });
    setFilters(param as any);
  };
  const handleResetFilter = async (isDirty: boolean) => {
    if (isDirty) {
      await getAttendance({
        skip: 0,
        take: pagination.pageSize,
      });
    }
    setFilterOpen(false);
    setFilters({
      status: "",
      from: null,
      to: null,
    });
  };
  const table = useReactTable({
    data: attendance.records,
    columns: columns,
    state: {
      columnVisibility,
      pagination,
    },
    rowCount: attendance.count,
    getRowId: (row) => row!.id!.toString(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,

    meta: {
      editAttendance: (data: any) =>
        setEditAttendanceModal({ content: data, open: true }),
    },
  });

  const handleRegularize = async (data: any) => {
    setLoading(true);
    try {
      const res = await regularizeAttendance({
        attendanceId: editAttendanceModal.content!.id,
        ...data,
      });
      if (!res.error) {
        setAttendance({
          ...attendance,
          records: attendance.records.map((i) =>
            i.id == res.data.id ? res.data : i
          ),
        });
        toast.success("Successfully requested regularization");
        setEditAttendanceModal({ content: null, open: false });
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };
  const handleAddNewAttendance = async (data: any) => {
    setLoading(true);
    try {
      const res = await addNewAttendance({
        userId: user!.identity_provider_id,
        check_in_at: (data.check_in_at as Date).toISOString(),
        check_out_at: (data.check_out_at as Date).toISOString(),
      });
      if (!res.error) {
        setAttendance({
          ...attendance,
          records: [res.data, ...attendance.records],
        });
        toast.success("Successfully requested attendance");
        setNewAttendanceModalOpen(false);
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (labId) {
      getAttendance({
        skip: pagination.pageIndex * pagination.pageSize,
        take: pagination.pageSize,
      });
    }
  }, [labId]);

  return (
    <>
      <SiteHeader title="My Attendance" />
      {isLabActive && <TodayAttendance />}
      <div className="@container/main flex flex-1 flex-col gap-2 p-2 overflow-hidden ">
        <DataTable
          table={table}
          loading={attendance.loading}
          tableBodyClassName="**:data-[slot=table-cell]:first:w-auto **:data-[slot=table-cell]:last:w-auto"
          filterComponent={
            filterOpen && (
              <AttendanceFilters
                defaultValue={filters}
                handleFilterClear={handleResetFilter}
                handleFilterSubmit={handleFilterChange}
              />
            )
          }
          extraTableContent={
            <>
              <div className="ml-auto pl-2">
                {!filterOpen && (
                  <Button
                    className="mr-2"
                    variant="gray"
                    size="sm"
                    onClick={() => setFilterOpen(!filterOpen)}
                    title="Filter User"
                    rounded={"xs"}
                  >
                    <Filter />
                    <span className="sr-only">Open Filter</span>
                  </Button>
                )}
                {isLabActive && (
                  <Button
                    className="mr-2"
                    variant="blue"
                    size="sm"
                    onClick={() => setNewAttendanceModalOpen(true)}
                    title="Filter User"
                    rounded={"xs"}
                  >
                    <UserCheck2 />
                    <span className="sr-only">Add New Attendance</span>
                  </Button>
                )}
              </div>
            </>
          }
        />
      </div>

      <ResponsiveDrawer
        open={editAttendanceModal.open}
        onOpenChange={() => {
          !loading &&
            setEditAttendanceModal({ ...editAttendanceModal, open: false });
        }}
        onAnimationEnd={() => {
          !loading && setEditAttendanceModal({ open: false, content: null });
        }}
      >
        <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[90vh] data-[vaul-drawer-direction=bottom]:mt-4!">
          <ResponsiveDrawer.Header
            title="Edit Attendance"
            description=" Modal for editing attendance."
          />
          {editAttendanceModal.content && (
            <RegularizeForm
              loading={loading}
              defaultValues={editAttendanceModal.content}
              handleSubmit={handleRegularize as any}
              editMode
            />
          )}
        </DrawerContent>
      </ResponsiveDrawer>
      <ResponsiveDrawer
        open={newAttendanceModalOpen}
        onOpenChange={() => {
          !loading && setNewAttendanceModalOpen(false);
        }}
      >
        <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[90vh] data-[vaul-drawer-direction=bottom]:mt-4!">
          <ResponsiveDrawer.Header
            title="Add Attendance"
            description=" Modal for adding attendance."
          />

          <RegularizeForm
            loading={loading}
            handleSubmit={handleAddNewAttendance as any}
          />
        </DrawerContent>
      </ResponsiveDrawer>
    </>
  );
};

export default MyAttendance;
