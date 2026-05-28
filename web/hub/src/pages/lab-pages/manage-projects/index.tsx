import { useCanIUse } from "@/components/shared/can-i-use";
import { routeConstants } from "@/constants/route.constants";
import { ProjectSearchQuery } from "@/interfaces/projects";
import { useUser } from "@/providers/user-info-provider";
import { getProjectsList } from "@/services/projects.service";
import { DataTable } from "@mono/shared_ui/components/shared/data-table";
import ResponsiveDrawer from "@mono/shared_ui/components/shared/responsive-drawer";
import { SiteHeader } from "@mono/shared_ui/components/shared/site-header";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mono/shared_ui/components/ui/avatar";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { DrawerContent } from "@mono/shared_ui/components/ui/drawer";
import { Input } from "@mono/shared_ui/components/ui/input";
import { PERMISSIONS } from "@mono/shared_ui/interfaces/permissions";
import { IProjectsGetAll } from "@mono/shared_ui/interfaces/projects";
import {
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
import { Clock, ClockPlus } from "lucide-react";
import { BaseSyntheticEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ProjectForm from "./components/project-form";
import ProjectTableAction from "./components/project-table-action";
import { IProjectType } from "./schema";
import { useLabContext } from "@/providers/lab-provider";
const columns: ColumnDef<IProjectsGetAll, any>[] = [
  {
    accessorKey: "title",
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
    accessorKey: "description",
    header: "Desc",
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
    header: "Owner",
    cell: (info) => {
      const item = info.row.original;
      return (
        <div className="flex gap-2 items-center w-max">
          <Avatar className="size-8 rounded-lg">
            <AvatarImage
              src={item.owner.image_link}
              alt={item.owner.first_name}
            />
            <AvatarFallback className="rounded-lg uppercase">
              {item.owner?.first_name?.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate text-xs font-medium">
              {item.owner.first_name}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {item.owner.email}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: (info) => (
      <Badge variant={"green"}>
        <ClockPlus className="mr-1" />
        {format(info.getValue(), "PPP")}
      </Badge>
    ),
  },
  {
    accessorKey: "updated_at",
    header: "Last Updated",
    cell: (info) => (
      <Badge variant={"yellow"}>
        <Clock className="mr-1" />
        {format(info.getValue(), "PPP")}
      </Badge>
    ),
  },
];
const columnsWithActions: ColumnDef<IProjectsGetAll, any>[] = [
  ...columns,
  {
    header: "Actions",
    id: "actions",
    size: 80,
    cell: (info) => <ProjectTableAction {...info} />,
  },
];
const ManageProjectPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [editProjectModal, setEditProjectModal] = useState<{
    content: IProjectType | null;
    open: boolean;
  }>({ content: null, open: false });
  const { labData, baseUrl } = useLabContext();
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [filters, setFilters] = useState<{ searchQuery: string }>({
    searchQuery: "",
  });
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [projects, setProjects] = useState<
    PaginatedDataWithLoading<IProjectsGetAll>
  >({
    records: [],
    loading: false,
    count: 0,
    skip: 0,
    take: 0,
  });
  const canEditProject = useCanIUse(PERMISSIONS.UPDATE_PROJECTS);
  const fetchProjectsList = async (param: ProjectSearchQuery) => {
    let res: PaginatedData<IProjectsGetAll> = {
      count: 0,
      records: [],
      skip: 0,
      take: 0,
    };
    try {
      const data = await getProjectsList(param);
      if (!data.error && data.data) {
        res = data.data;
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    }
    return res;
  };

  const getProjects = async (param: ProjectSearchQuery) => {
    setProjects({ count: 0, records: [], skip: 0, take: 0, loading: true });
    const data = await fetchProjectsList(param);
    const records = data.records || [];
    setProjects({ ...data, records, loading: false });
    setPagination({
      pageIndex: (data.skip && data.skip / data.take) || 0,
      pageSize: data.take,
    });
  };

  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    const newState =
      typeof updater === "function" ? updater({ ...pagination }) : updater;

    getProjects({
      searchQuery: filters.searchQuery,
      skip: newState.pageIndex * newState.pageSize,
      take: newState.pageSize,
      lab_id: user!.lab_id,
    });
  };

  const table = useReactTable({
    data: projects.records,
    columns: canEditProject ? columnsWithActions : columns,
    state: {
      columnVisibility,
      pagination,
      columnPinning: {
        right: ["actions"],
      },
    },
    rowCount: projects.count,
    getRowId: (row) => row!.id!.toString(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,

    meta: {
      editProject: (data: IProjectType) =>
        setEditProjectModal({ content: data, open: true }),
    },
  });

  const searchHandle = (e: BaseSyntheticEvent) => {
    if (!user) return;
    const search = e.target.value.trim();
    setFilters({ searchQuery: search });
    getProjects({
      searchQuery: search,
      skip: 0,
      take: 10,
      lab_id: user!.lab_id,
    });
  };
  const handleDebounceSearch = useMemo(() => {
    return debounce(searchHandle);
  }, []);

  useEffect(() => {
    if (labData?.lab_id) {
      getProjects({
        searchQuery: filters.searchQuery,
        skip: pagination.pageIndex * pagination.pageSize,
        take: pagination.pageSize,
        lab_id: labData.lab_id,
      });
    }
  }, [labData]);

  return (
    <>
      <SiteHeader title="Manage Projects" />
      <div className="@container/main flex flex-1 flex-col gap-2 p-2 overflow-hidden ">
        <DataTable
          handleOnRowClick={(data) =>
            navigate(`/${baseUrl}/${routeConstants.PROJECTS}/${data.id}`)
          }
          table={table}
          loading={projects.loading}
          tableBodyClassName="**:data-[slot=table-cell]:first:w-auto **:data-[slot=table-cell]:last:w-auto"
          extraTableContent={
            <>
              <Input
                onChange={handleDebounceSearch}
                type="search"
                className="h-8 w-auto ml-2"
                placeholder="Search project"
              />
            </>
          }
        />
      </div>

      <ResponsiveDrawer
        open={editProjectModal.open}
        onOpenChange={() => {
          setEditProjectModal({ ...editProjectModal, open: false });
        }}
        onAnimationEnd={() => {
          setEditProjectModal({ open: false, content: null });
        }}
      >
        <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[90vh] data-[vaul-drawer-direction=bottom]:mt-4!">
          <ResponsiveDrawer.Header
            title="Edit Project"
            description=" Modal for editing Project."
          />
          {editProjectModal.content && (
            <ProjectForm
              loading={false}
              defaultValues={editProjectModal.content}
            />
          )}
        </DrawerContent>
      </ResponsiveDrawer>
    </>
  );
};

export default ManageProjectPage;
