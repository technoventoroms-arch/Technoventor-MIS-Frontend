import { routeConstants } from "@/constants/route.constants";
import {
  getProjectById,
  getProjectOrderLogs,
  getProjectUsers,
} from "@/services/projects.service";
import { SiteHeader } from "@mono/shared_ui/components/shared/site-header";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mono/shared_ui/components/ui/avatar";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Progress } from "@mono/shared_ui/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@mono/shared_ui/components/ui/tabs";
import { useLoading } from "@mono/shared_ui/hooks/use-loading";
import {
  DataWithLoading,
  IGenericQueryParam,
  PaginatedDataWithLoading,
} from "@mono/shared_ui/interfaces/utils";
import {
  debounce,
  getAxiosErrorMessage,
  getInterpolatedColor,
} from "@mono/shared_ui/lib/utils";
import { format } from "date-fns";
import { Cpu, Package, User } from "lucide-react";
import { BaseSyntheticEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { IProjectType } from "../manage-projects/schema";
import ViewTeamTab from "./components/view-team-tab";

import { IOrderLog } from "@/interfaces/order";
import { IProjectMember } from "@/interfaces/projects";
import {
  IMachineReservationQueryParams,
  MachineBookingSummary,
} from "@/interfaces/reservation";
import { useLabContext } from "@/providers/lab-provider";
import { getMachineReservationsForProject } from "@/services/machine.service";
import { ScrollArea } from "@mono/shared_ui/components/ui/scroll-area";
import {
  ColumnFiltersState,
  getCoreRowModel,
  PaginationState,
  Updater,
  useReactTable,
} from "@tanstack/react-table";
import ViewInventoryLogs from "./components/view-inventory-logs";
import ViewMachineLogs from "./components/view-machine-logs";
import RecentActivity from "./components/recent-activity";

const useMachineLogs = (projectId: number) => {
  const [columnFilters, setFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [machineLogs, setMachineLogs] = useState<
    PaginatedDataWithLoading<MachineBookingSummary>
  >({
    count: 0,
    records: [],
    skip: 0,
    take: 0,
    loading: false,
  });

  const buildColumnFilters = (columnFilters: ColumnFiltersState) => {
    const payload: { [key: string]: any } = {};
    columnFilters.forEach((e) => {
      payload[e.id] = e.value;
    });
    return payload;
  };
  const fetchProjectMachineLogs = async (
    params?: IGenericQueryParam & IMachineReservationQueryParams
  ) => {
    setMachineLogs({ ...machineLogs, records: [], loading: true });
    try {
      const res = await getMachineReservationsForProject(projectId, params);
      if (!res.error) {
        setMachineLogs({
          ...res.data,
          records: res.data.records || [],
          loading: false,
        });
        setPagination({
          pageIndex: (res.data.skip && res.data.skip / res.data.take) || 0,
          pageSize: res.data.take,
        });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
      setMachineLogs({ ...machineLogs, records: [], loading: false });
    }
  };
  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    const newState =
      typeof updater === "function" ? updater({ ...pagination }) : updater;
    fetchProjectMachineLogs({
      skip: newState.pageIndex * newState.pageSize,
      take: newState.pageSize,
      ...buildColumnFilters(columnFilters),
    });
  };

  const handleFilterChange = (updater: Updater<ColumnFiltersState>) => {
    const newState =
      typeof updater === "function" ? updater({ ...columnFilters }) : updater;
    setFilters(newState);
    fetchProjectMachineLogs({
      skip: pagination.pageIndex * pagination.pageSize,
      take: pagination.pageSize,
      ...buildColumnFilters(newState),
    });
  };

  const table = useReactTable({
    data: machineLogs.records,
    columns: [],
    state: {
      pagination,
      columnFilters,
    },
    rowCount: machineLogs.count,
    getRowId: (row) => row!.id!.toString(),

    onPaginationChange: handlePaginationChange,
    onColumnFiltersChange: handleFilterChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return {
    machineFilters: columnFilters,
    machineLogs,
    table,
    fetchProjectMachineLogs,
  };
};
const useInventoryLogs = (projectId: number) => {
  const [filters, setFilters] = useState<{ searchQuery: string }>({
    searchQuery: "",
  });
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [orderLogs, setOrderLogs] = useState<
    PaginatedDataWithLoading<IOrderLog>
  >({
    count: 0,
    records: [],
    skip: 0,
    take: 0,
    loading: false,
  });
  const fetchProjectOrderLogs = async (params?: IGenericQueryParam) => {
    setOrderLogs({ ...orderLogs, records: [], loading: true });
    try {
      const res = await getProjectOrderLogs(projectId, params);
      if (!res.error) {
        setOrderLogs({
          ...res.data,
          records: res.data.records || [],
          loading: false,
        });
        setPagination({
          pageIndex: (res.data.skip && res.data.skip / res.data.take) || 0,
          pageSize: res.data.take,
        });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
      setOrderLogs({ ...orderLogs, records: [], loading: false });
    }
  };
  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    const newState =
      typeof updater === "function" ? updater({ ...pagination }) : updater;

    fetchProjectOrderLogs({
      searchQuery: filters.searchQuery,
      skip: newState.pageIndex * newState.pageSize,
      take: newState.pageSize,
    });
  };
  const table = useReactTable({
    data: orderLogs.records,
    columns: [],
    state: {
      pagination,
    },
    rowCount: orderLogs.count,
    getRowId: (row) => row!.id!.toString(),

    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const searchHandle = (e: BaseSyntheticEvent) => {
    const search = e.target.value.trim();
    setFilters({ searchQuery: search });
    fetchProjectOrderLogs({
      searchQuery: search,
      skip: 0,
      take: 10,
    });
  };
  const handleOrderLogSearch = useMemo(() => {
    return debounce(searchHandle);
  }, []);
  return {
    orderFilter: filters,
    orderLogs,
    table,
    fetchProjectOrderLogs,

    handleOrderLogSearch,
  };
};
const tabs = [
  {
    value: "team",
    label: "Team",
    icon: User,
  },
  {
    value: "inv-orders",
    label: "Inventory Orders",
    icon: Package,
  },
  {
    value: "machine-log",
    label: "Machine Log",
    icon: Cpu,
  },
];

const ViewProjectDetails = () => {
  const param = useParams();
  const _projectId = Math.abs(Number.parseInt(param.projectId || ""));
  const { loading, hideLoading, showLoading } = useLoading();
  const [projectDetail, setprojectDetail] = useState<IProjectType | null>(null);
  const projectId = Math.abs(Number.parseInt(param.projectId || ""));
  const { labData, baseUrl } = useLabContext();
  const [projectUsers, setProjectUsers] = useState<
    DataWithLoading<IProjectMember[]>
  >({
    data: [],
    loading,
  });

  const {
    fetchProjectOrderLogs,
    orderLogs,

    table: orderTable,
    handleOrderLogSearch,
    orderFilter,
  } = useInventoryLogs(_projectId);

  const {
    machineFilters,
    fetchProjectMachineLogs,
    machineLogs,

    table: machineTable,
  } = useMachineLogs(_projectId);

  const getProjectDetails = async (projectId: number) => {
    let project: IProjectType | null = null;
    try {
      const res = await getProjectById(projectId);
      if (!res.error) {
        project = res.data;
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
    return project;
  };
  const getDetails = async () => {
    showLoading();
    const data = await getProjectDetails(projectId);
    setprojectDetail(data);
    hideLoading();
  };

  const progress = useMemo(() => {
    let value = projectDetail
      ? (new Date().getTime() - new Date(projectDetail.created_at).getTime()) /
        (Math.abs(
          new Date(projectDetail.created_at).getTime() -
            new Date(projectDetail?.end_date).getTime()
        ) /
          100)
      : 50;

    const color = getInterpolatedColor(value);
    if (value > 100) {
      value = 100;
    }
    return { value, color };
  }, [projectDetail]);

  const badgeStyle = useMemo(() => {
    return {
      "very high": "red",
      high: "pink",
      medium: "green",
      low: "yellow",
    };
  }, []);

  const fetchProjectUsers = async () => {
    setProjectUsers({ data: [], loading: true });
    try {
      const res = await getProjectUsers(_projectId);
      if (!res.error) {
        const users = res.data?.filter((i: any) => !i.is_owner) || [];
        setProjectUsers({ data: users, loading: false });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
      setProjectUsers({ data: [], loading: true });
    }
  };

  useEffect(() => {
    if (labData?.lab_id) {
      getDetails();
      fetchProjectUsers();
      fetchProjectOrderLogs();
      fetchProjectMachineLogs();
    }
  }, [labData?.lab_id]);

  return (
    <>
      <SiteHeader
        title="Manage Projects"
        breadCrumbs={[
          {
            title: "Projects",
            url: `/${baseUrl}/${routeConstants.PROJECTS}`,
          },
          {
            loading: loading && !projectDetail,
            title: projectDetail?.title,
            url: "#",
          },
        ]}
      />
      <div className="@container/main bg-slate-50 dark:bg-transparent flex flex-1 overflow-hidden ">
        <div className="h-full static grid grid-cols-10 gap-2 w-full overflow-auto">
          <main className="col-span-10 lg:col-span-7 border border-transparent lg:border-r-neutral-300">
            <div className="p-2 px-4 space-y-3">
              <div className="flex justify-between items-start md:items-end gap-2">
                <div className="flex-1 ">
                  <div className="text-xs">Project Title</div>
                  <div className="text-lg font-semibold text-wrap">
                    {projectDetail?.title}
                  </div>
                </div>
                <div></div>
              </div>
              <div className="flex gap-10">
                <div className="space-y-1">
                  <div className="text-xs">Priority</div>
                  <div className="text-lg font-semibold">
                    <Badge
                      className="text-sm "
                      variant={
                        (badgeStyle as any)[projectDetail?.priority || ""] ||
                        "green"
                      }
                    >
                      {projectDetail?.priority || "Low"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs">Owner</div>
                  <div className="flex gap-2 items-center w-max">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarImage
                        src={projectDetail?.owner.image_link}
                        alt={projectDetail?.owner.first_name || ""}
                      />
                      <AvatarFallback className="rounded-lg uppercase">
                        {projectDetail?.owner.first_name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate text-xs font-medium">
                        {projectDetail?.owner.first_name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {projectDetail?.owner.email}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <div className="text-sm font-semibold">
                    {projectDetail?.created_at &&
                      format(projectDetail?.created_at, "PPP")}
                  </div>
                  <div className="text-sm font-semibold">
                    {projectDetail?.end_date &&
                      format(projectDetail?.end_date, "PPP")}
                  </div>
                </div>
                <Progress
                  value={progress.value}
                  indicatorColor={progress.color}
                />
              </div>
              <div className="">
                <div className="text-xs">Description</div>
                <div className="text-lg font-semibold break-words">
                  {projectDetail?.description}
                </div>
              </div>
            </div>
            <div className=" p-4">
              <Tabs defaultValue="team" className="w-full">
                <ScrollArea className="w-full border-b">
                  <TabsList className="text-foreground h-auto gap-2 rounded-none  bg-transparent px-0 py-1 ">
                    {tabs.map((i) => (
                      <TabsTrigger
                        value={i.value}
                        className="  hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                      >
                        <i.icon
                          className="-ms-0.5 me-1.5 opacity-60"
                          size={16}
                          aria-hidden="true"
                        />
                        {i.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </ScrollArea>
                <TabsContent value="team">
                  <ViewTeamTab
                    members={projectUsers.data}
                    loading={projectUsers.loading}
                  />
                </TabsContent>
                <TabsContent value="inv-orders">
                  <ViewInventoryLogs
                    orders={orderLogs.records}
                    loading={orderLogs.loading}
                    labId={labData?.lab_id!}
                    table={orderTable}
                    handleOrderLogSearch={handleOrderLogSearch}
                    searchFilter={orderFilter.searchQuery}
                  />
                </TabsContent>
                <TabsContent value="machine-log">
                  <ViewMachineLogs
                    requests={machineLogs.records}
                    loading={machineLogs.loading}
                    table={machineTable}
                    filters={machineFilters}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </main>
          <aside className="flex flex-col col-span-10 lg:col-span-3 p-2">
            <RecentActivity projectId={_projectId} labId={labData?.lab_id!} />
          </aside>
        </div>
      </div>
    </>
  );
};

export default ViewProjectDetails;
