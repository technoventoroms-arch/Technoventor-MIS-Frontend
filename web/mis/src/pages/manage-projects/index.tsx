import CanIUse, { useCanIUse } from "@/components/shared/can-i-use";
import { routeConstants } from "@/constants/route.constants";
import { ProjectSearchQuery } from "@/interfaces/projects";
import { useLabContext } from "@/providers/lab-provider";
import {
  createNewProject,
  deleteProject,
  editProject,
  getProjectsList,
} from "@/services/projects.service";
import { DataTable } from "@mono/shared_ui/components/shared/data-table";
import GenericModal from "@mono/shared_ui/components/shared/generic-modal";
import ResponsiveDrawer from "@mono/shared_ui/components/shared/responsive-drawer";
import { SiteHeader } from "@mono/shared_ui/components/shared/site-header";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mono/shared_ui/components/ui/avatar";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import { DrawerContent } from "@mono/shared_ui/components/ui/drawer";
import { Input } from "@mono/shared_ui/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@mono/shared_ui/components/ui/select";
import { PERMISSIONS } from "@mono/shared_ui/interfaces/permissions";
import { IProjectsGetAll } from "@mono/shared_ui/interfaces/projects";
import {
  PaginatedData,
  PaginatedDataWithLoading,
} from "@mono/shared_ui/interfaces/utils";
import { cn, debounce, getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import {
  ColumnDef,
  getCoreRowModel,
  PaginationState,
  Updater,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { Check, Clock, ClockPlus, PlusIcon, Replace } from "lucide-react";
import { BaseSyntheticEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ProjectForm from "./components/project-form";
import ProjectTableAction from "./components/project-table-action";
import { IProjectType, NewProjectType } from "./schema";
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
    accessorKey: "is_complete",
    header: "Status",
    cell: (info) =>
      info.getValue() ? (
        <Badge variant={"green"}>
          <Check className="my-1" />{" "}
          <span className="hidden md:inline">Complete</span>
        </Badge>
      ) : (
        <Badge variant={"yellow"}>
          <Replace className="my-1" />{" "}
          <span className="hidden md:inline">In Progress</span>
        </Badge>
      ),
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
  const [loading, setLoading] = useState(false);
  const { baseUrl } = useLabContext();
  const navigate = useNavigate();

  const [createProjectModal, setCreateProjectModal] = useState(false);
  const [editProjectModal, setEditProjectModal] = useState<{
    content: IProjectType | null;
    open: boolean;
  }>({ content: null, open: false });
  const [deleteProjectModal, setDeleteProjectModal] = useState<{
    content: IProjectType | null;
    open: boolean;
  }>({ content: null, open: false });
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [filters, setFilters] = useState<{
    searchQuery: string;
    filterStatus: string;
  }>({
    searchQuery: "",
    filterStatus: "ALL",
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
      deleteProject: (data: IProjectType) =>
        setDeleteProjectModal({ content: data, open: true }),
    },
  });
  const handleCreteNewProject = async (data: NewProjectType) => {
    setLoading(true);
    try {
      const res = await createNewProject({
        ...data,
        owner_id: 1,
      });
      if (!res.error) {
        setProjects({ ...projects, records: [res.data, ...projects.records] });
        toast.success("Successfully created project");
        setCreateProjectModal(false);
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };
  const handleEditProject = async (data: IProjectType) => {
    setLoading(true);
    try {
      const res = await editProject(editProjectModal.content!.id, data);
      if (!res.error) {
        setProjects({
          ...projects,
          records: projects.records.map((i) =>
            i.id == res.data.id ? res.data : i
          ),
        });
        toast.success("Successfully created project");
        setEditProjectModal({ content: null, open: false });
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };
  const getFilterStatusValue = (val: string) => {
    if (val == "ALL") return;
    if (val == "COMPLETE") return true;
    return false;
  };
  const searchHandle = (e: BaseSyntheticEvent) => {
    const search = e.target.value.trim();
    setFilters((e) => ({ ...e, searchQuery: search }));
    getProjects({
      searchQuery: search,
      skip: 0,
      take: 10,
      isComplete: getFilterStatusValue(filters.filterStatus),
    });
  };
  const searchByStatusHandle = (e: string) => {
    setFilters((p) => ({ ...p, filterStatus: e }));
    getProjects({
      searchQuery: filters.searchQuery,
      skip: 0,
      take: 10,
      isComplete: getFilterStatusValue(e),
    });
  };
  const handleDebounceSearch = useMemo(() => {
    return debounce(searchHandle);
  }, [filters.filterStatus]);

  useEffect(() => {
    getProjects({
      searchQuery: filters.searchQuery,
      skip: pagination.pageIndex * pagination.pageSize,
      take: pagination.pageSize,
    });
  }, []);
  const handleProjectDelete = async () => {
    if (!deleteProjectModal.content) return;
    try {
      const id = deleteProjectModal.content?.id;
      const res = await deleteProject(id);
      if (!res.error) {
        setProjects({
          ...projects,
          records: projects.records.filter((i) => id != i.id),
        });
        toast.success("Successfully deleted project");
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setDeleteProjectModal({
        content: null,
        open: false,
      });
    }
  };
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
              <Select
                onValueChange={(val) => {
                  if (val) {
                    searchByStatusHandle(val);
                  }
                }}
                value={filters.filterStatus}
              >
                <SelectTrigger className="h-8 ml-2" size="sm">
                  <SelectValue className={cn("capitalize")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="capitalize" value={"ALL"}>
                    ALL
                  </SelectItem>
                  <SelectItem className="capitalize" value={"COMPLETE"}>
                    COMPLETE
                  </SelectItem>
                  <SelectItem className="capitalize" value={"PENDING"}>
                    PENDING
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="ml-auto pl-2">
                <CanIUse action={(a) => a.CREATE_PROJECTS}>
                  <Button
                    className="mr-2"
                    variant="green"
                    size="sm"
                    onClick={() => setCreateProjectModal(true)}
                    title="Add new project"
                    rounded={"xs"}
                  >
                    <PlusIcon />
                    <span className="hidden lg:inline">Add New Project</span>
                  </Button>
                </CanIUse>
              </div>
            </>
          }
        />
      </div>

      <ResponsiveDrawer
        open={!!createProjectModal}
        onOpenChange={() => {
          !loading && setCreateProjectModal(false);
        }}
      >
        <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[90vh] data-[vaul-drawer-direction=bottom]:mt-4!">
          <ResponsiveDrawer.Header
            title="Create New Project"
            description="Modal for creating new project."
          />
          <ProjectForm
            loading={loading}
            defaultValues={{ priority: "medium" }}
            handleSubmit={handleCreteNewProject}
          />
        </DrawerContent>
      </ResponsiveDrawer>

      <ResponsiveDrawer
        open={editProjectModal.open}
        onOpenChange={() => {
          !loading && setEditProjectModal({ ...editProjectModal, open: false });
        }}
        onAnimationEnd={() => {
          !loading && setEditProjectModal({ open: false, content: null });
        }}
      >
        <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[90vh] data-[vaul-drawer-direction=bottom]:mt-4!">
          <ResponsiveDrawer.Header
            title="Edit Project"
            description=" Modal for editing Project."
          />
          {editProjectModal.content && (
            <ProjectForm
              loading={loading}
              defaultValues={editProjectModal.content}
              handleSubmit={handleEditProject as any}
            />
          )}
        </DrawerContent>
      </ResponsiveDrawer>
      <GenericModal
        onOpenChange={(e: boolean) => {
          setDeleteProjectModal({ content: null, open: e });
        }}
        open={!!deleteProjectModal?.content}
        onConfirmClick={handleProjectDelete}
        title={"Delete Project"}
        confirmButtonText="Delete"
        variant="danger"
        desc={
          <div>
            Are you sure you want to delete{" "}
            <Badge variant={"blue"}>{deleteProjectModal?.content?.title}</Badge>{" "}
            ?
          </div>
        }
      />
    </>
  );
};

export default ManageProjectPage;
