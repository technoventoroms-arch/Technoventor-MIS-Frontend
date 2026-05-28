import { routeConstants } from "@/constants/route.constants";
import { IMachine, MachineQRData, MachineStatus } from "@/interfaces/machines";
import { useLabContext } from "@/providers/lab-provider";
import { getMachineList } from "@/services/machine.service";
import { DataTable } from "@mono/shared_ui/components/shared/data-table";
import ResponsiveDrawer from "@mono/shared_ui/components/shared/responsive-drawer";
import { SiteHeader } from "@mono/shared_ui/components/shared/site-header";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import { DrawerContent } from "@mono/shared_ui/components/ui/drawer";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@mono/shared_ui/components/ui/hover-card";
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
import { Filter } from "lucide-react";
import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import MachineFilters, {
  MachineFilterSchema,
} from "./components/machine-filters";
import MachineTableAction from "./components/machine-table-action";
const machineStatusToVariant: Record<MachineStatus, string> = {
  ACTIVE: "green",
  OCCUPIED: "blue",
  OFF: "gray",
  UNDER_MAINTENANCE: "yellow",
  RETIRED: "purple",
  FAULTY: "red",
};

const columns: ColumnDef<IMachine, any>[] = [
  {
    accessorKey: "name",
    header: "Name",
    enableHiding: false,
    cell: (info) => (
      <div
        className="max-w-48 text-ellipsis overflow-hidden"
        title={info.getValue()}
      >
        {info.getValue()}
      </div>
    ),
  },
  {
    accessorKey: "image_link",
    header: "",
    enableHiding: false,
    cell: (info) => (
      <div>
        <HoverCard>
          <HoverCardTrigger>
            <img src={info.getValue()} className="w-8 h-8 rounded" />
          </HoverCardTrigger>
          <HoverCardContent className="p-1">
            <img src={info.getValue()} className="  rounded" />
          </HoverCardContent>
        </HoverCard>
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: (info) => (
      <div
        className="max-w-60 text-ellipsis overflow-hidden"
        title={info.getValue()}
      >
        {info.getValue()}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (info) => (
      <Badge
        variant={
          machineStatusToVariant[
            info.getValue() as unknown as MachineStatus
          ] as any
        }
      >
        {info.getValue()}
      </Badge>
    ),
  },

  {
    header: "Actions",
    cell: (info) => <MachineTableAction {...info} />,
    enablePinning: true,
    id: "actions",
  },
];

const ManageLabUsersPage = () => {
  const { labData, baseUrl } = useLabContext();
  const [machine, setMachines] = useState<PaginatedDataWithLoading<IMachine>>({
    records: [],
    loading: false,
    count: 0,
    skip: 0,
    take: 0,
  });

  const [showMachineQRModal, setShowMachineQRModal] = useState<{
    content: IMachine | null;
    open: boolean;
  }>({ content: null, open: false });
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<MachineFilterSchema>({
    searchQuery: "",
    status: "ALL",
  });
  const navigate = useNavigate();

  const fetchMachinesList = async (params: IGenericQueryParam) => {
    let res: PaginatedData<IMachine> = {
      count: 0,
      records: [],
      skip: 0,
      take: 0,
    };
    try {
      const data = await getMachineList(params);
      if (!data.error) {
        res = data.data;
        res.records = res.records || [];
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    }
    return res;
  };

  const getMachines = async (
    param: IGenericQueryParam & { status?: string }
  ) => {
    setMachines({ count: 0, records: [], skip: 0, take: 0, loading: true });
    const data = await fetchMachinesList(param);
    setMachines({ ...data, loading: false });
    setPagination({
      pageIndex: (data.skip && data.skip / data.take) || 0,
      pageSize: data.take,
    });
  };

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    const newState =
      typeof updater === "function" ? updater({ ...pagination }) : updater;
    getMachines({
      ...filters,
      status: filters.status != "ALL" ? filters.status : "",

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
    meta: {
      editMachine: (item: IMachine) =>
        navigate(
          `/${baseUrl}/${routeConstants.MACHINES}/${item.id}/${routeConstants.DETAILS}`
        ),
      showMachineQR: (item: IMachine) =>
        setShowMachineQRModal({ content: item, open: true }),
      showMachineLogs: (item: IMachine) =>
        navigate(
          `/${baseUrl}/${routeConstants.MACHINES}/${item.id}/${routeConstants.LOGS}`
        ),
    },
  });

  const handleApplyFilter = (filters: MachineFilterSchema) => {
    setFilters(filters);
    getMachines({
      ...filters,
      status: filters.status != "ALL" ? filters.status : "",
      skip: 0,
      take: 10,
    });
  };
  const handleClearFilter = (isDirty: boolean) => {
    if (isDirty) {
      setFilters({ searchQuery: "", status: "ALL" });
      getMachines({ searchQuery: "", skip: 0, take: 10 });
    }
    setFilterOpen(false);
  };
  const handleRowClick = (data: IMachine) => {
    navigate(`/${baseUrl}/${routeConstants.MACHINES}/${data.id}`);
  };
  useEffect(() => {
    if (labData?.lab_id) {
      getMachines({
        searchQuery: filters.searchQuery,
        skip: pagination.pageIndex * pagination.pageSize,
        take: pagination.pageSize,
      });
    }
  }, [labData]);

  return (
    <>
      <SiteHeader title="Machines" />
      <div className="@container/main flex flex-1 flex-col gap-2 p-2 overflow-hidden ">
        <DataTable
          table={table}
          loading={machine.loading}
          tableBodyClassName="**:data-[slot=table-cell]:first:w-auto **:data-[slot=table-cell]:last:w-auto"
          handleOnRowClick={handleRowClick}
          filterComponent={
            filterOpen && (
              <MachineFilters
                defaultValue={filters}
                handleFilterClear={handleClearFilter}
                handleFilterSubmit={handleApplyFilter}
              />
            )
          }
          extraTableContent={
            <>
              <div className="ml-auto ">
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
              </div>
            </>
          }
        />
      </div>

      <ResponsiveDrawer
        open={showMachineQRModal.open}
        onOpenChange={() => {
          setShowMachineQRModal({ ...showMachineQRModal, open: false });
        }}
        onAnimationEnd={() => {
          setShowMachineQRModal({ open: false, content: null });
        }}
      >
        <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[90vh] data-[vaul-drawer-direction=bottom]:mt-4!">
          <ResponsiveDrawer.Header
            title="View Machine QR"
            description=" Modal for downloading machine qr."
          />
          {showMachineQRModal.content && (
            <div className="flex flex-col items-center mt-2">
              <div className="flex flex-col w-full p-4">
                <div>Name: {showMachineQRModal.content.name}</div>
                <div>Desc: {showMachineQRModal.content.description}</div>
              </div>
              <div className="bg-white p-2">
                <QRCode
                  value={JSON.stringify({
                    name: showMachineQRModal.content.name,
                    description: showMachineQRModal.content.description,
                    id: showMachineQRModal.content.id,
                  } as MachineQRData)}
                />
              </div>
            </div>
          )}
        </DrawerContent>
      </ResponsiveDrawer>
    </>
  );
};

export default ManageLabUsersPage;
