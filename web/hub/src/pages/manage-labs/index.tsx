import CanIUse from "@/components/shared/can-i-use";
import { routeConstants } from "@/constants/route.constants";
import { LabSearchQuery } from "@/interfaces/labs";
import {
  changeLabAdmin,
  createNewLab,
  editLab,
  getLabsList,
} from "@/services/labs.service";
import { DataTable } from "@mono/shared_ui/components/shared/data-table";
import { SiteHeader } from "@mono/shared_ui/components/shared/site-header";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@mono/shared_ui/components/ui/dialog";
import { Input } from "@mono/shared_ui/components/ui/input";
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
import { Clock, ClockPlus, PlusIcon } from "lucide-react";
import { BaseSyntheticEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ChangeLabAdmin from "./components/change-admin-form";
import LabForm from "./components/lab-form";
import LabsTableAction from "./components/lab-table-action";
import { ILabType, NewLabType } from "./schema";
import { IUser } from "@mono/shared_ui/interfaces/user";

const columns: ColumnDef<ILabType, any>[] = [
  {
    accessorKey: "name",
    header: "Name",
    enableHiding: false,
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "state",
    header: "State",
  },
  {
    accessorKey: "country",
    header: "Country",
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
  {
    id: "actions",
    header: "Actions",
    size: 20,
    cell: (info) => <LabsTableAction {...info} />,
  },
];

const ManageLabsPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [createLabModal, setCreateLabModal] = useState(false);
  const [editLabModal, setEditLabModal] = useState<ILabType | null>(null);
  const [changeAdminModal, setChangeAdminModal] = useState<ILabType | null>(
    null
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [filters, setFilters] = useState<{ searchQuery: string }>({
    searchQuery: "",
  });
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [labs, setLabs] = useState<PaginatedDataWithLoading<ILabType>>({
    records: [],
    loading: false,
    count: 0,
    skip: 0,
    take: 0,
  });
  const fetchlabsList = async (param: LabSearchQuery) => {
    let res: PaginatedData<ILabType> = {
      count: 0,
      records: [],
      skip: 0,
      take: 0,
    };
    try {
      const data = await getLabsList(param);
      if (!data.error) {
        res = data.data as any;
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    }
    return res;
  };

  const getLabs = async (param: LabSearchQuery) => {
    setLabs({ count: 0, records: [], skip: 0, take: 0, loading: true });
    const data = await fetchlabsList(param);
    const records = data.records || [];
    setLabs({ ...data, records, loading: false });
    setPagination({
      pageIndex: (data.skip && data.skip / data.take) || 0,
      pageSize: data.take,
    });
  };

  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    const newState =
      typeof updater === "function" ? updater({ ...pagination }) : updater;

    getLabs({
      searchQuery: filters.searchQuery,
      skip: newState.pageIndex * newState.pageSize,
      take: newState.pageSize,
    });
  };

  const table = useReactTable({
    data: labs.records,
    columns: columns,
    state: {
      columnVisibility,
      pagination,
      columnPinning: {
        right: ["actions"],
      },
    },

    rowCount: labs.count,
    getRowId: (row) => row!.lab_id!.toString(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,

    meta: {
      editLab: setEditLabModal,
      changeAdmin: setChangeAdminModal,
    },
  });
  const handleCreteNewLab = async (data: NewLabType) => {
    setLoading(true);
    try {
      const res = await createNewLab(data);
      if (!res.error) {
        setLabs({ ...labs, records: [res.data as any, ...labs.records] });
        toast.success("Succesfully created lab");
        setCreateLabModal(false);
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };
  const handleEditLab = async (data: ILabType) => {
    setLoading(true);
    try {
      const res = await editLab(editLabModal!.lab_id, data as any);
      if (!res.error) {
        setLabs({
          ...labs,
          records: labs.records.map((i) =>
            i.lab_id == res.data.lab_id ? res.data : i
          ) as any,
        });
        toast.success("Successfully updated lab");
        setEditLabModal(null);
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };
  const handleChangeLabAdmin = async (user: { newAdmin: IUser }) => {
    setLoading(true);
    try {
      const res = await changeLabAdmin(
        changeAdminModal!.lab_id,
        user.newAdmin.identity_provider_id
      );
      if (!res.error) {
        toast.success("Successfully updated lab");
        setChangeAdminModal(null);
        getLabs({
          searchQuery: filters.searchQuery,
          skip: pagination.pageIndex * pagination.pageSize,
          take: pagination.pageSize,
        });
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };
  const searchHandle = (e: BaseSyntheticEvent) => {
    const search = e.target.value.trim();
    setFilters({ searchQuery: search });
    getLabs({ searchQuery: search, skip: 0, take: 10 });
  };
  const handleDebounceSearch = useMemo(() => {
    return debounce(searchHandle);
  }, []);

  useEffect(() => {
    getLabs({
      searchQuery: filters.searchQuery,
      skip: pagination.pageIndex * pagination.pageSize,
      take: pagination.pageSize,
    });
  }, []);
  return (
    <>
      <SiteHeader title="Labs" />
      <div className="@container/main  flex flex-1 flex-col gap-2 p-2 overflow-hidden ">
        <DataTable
          handleOnRowClick={(data) =>
            navigate(`/${routeConstants.LAB}/${data.lab_id}`)
          }
          table={table}
          loading={labs.loading}
          tableBodyClassName="**:data-[slot=table-cell]:first:w-auto **:data-[slot=table-cell]:last:w-auto"
          extraTableContent={
            <>
              <Input
                onChange={handleDebounceSearch}
                type="search"
                className="h-8 w-auto ml-2"
                placeholder="Search lab"
              />
              <div className="ml-auto ">
                <CanIUse action={(e) => e.CREATE_LABS}>
                  <Button
                    className="mr-2"
                    variant="green"
                    size="sm"
                    onClick={() => setCreateLabModal(true)}
                    title="Add new lab"
                    rounded={"xs"}
                  >
                    <PlusIcon />
                    <span className="hidden lg:inline">Add New lab</span>
                  </Button>
                </CanIUse>
              </div>
            </>
          }
        />
      </div>
      <Dialog
        open={!!createLabModal}
        onOpenChange={() => {
          !loading && setCreateLabModal(false);
        }}
      >
        <DialogContent
          disabled={loading}
          className="flex flex-col overflow-hidden p-0 max-h-[95vh] md:max-w-[500px] lg:max-w-[600px]"
        >
          <DialogTitle className="p-4">Create New Lab</DialogTitle>
          <DialogDescription className="sr-only">
            Modal for creating new Lab.
          </DialogDescription>
          <LabForm
            loading={loading}
            defaultValues={{
              address_1: "",
              address_2: "",
              address_3: "",
              city: "",
              country: "",
              name: "",
              org_name: "",
              state: "",
              zipcode: "",
            }}
            handleSubmit={handleCreteNewLab}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!editLabModal}
        onOpenChange={() => {
          !loading && setEditLabModal(null);
        }}
      >
        <DialogContent
          disabled={loading}
          className="flex flex-col overflow-hidden p-0 max-h-[95vh] md:max-w-[500px] lg:max-w-[600px]"
        >
          <DialogTitle className="p-4">Edit Lab</DialogTitle>
          <DialogDescription className="sr-only">
            Modal for editing Lab.
          </DialogDescription>
          {editLabModal && (
            <LabForm
              loading={loading}
              defaultValues={editLabModal}
              handleSubmit={handleEditLab as any}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!changeAdminModal}
        onOpenChange={() => {
          !loading && setChangeAdminModal(null);
        }}
      >
        <DialogContent
          disabled={loading}
          className="flex flex-col overflow-hidden p-0 max-h-[95vh] md:max-w-[500px] lg:max-w-[600px]"
        >
          <DialogTitle className="p-4">Change Lab Admin</DialogTitle>
          <DialogDescription className="sr-only">
            Modal for changing lab admin.
          </DialogDescription>
          {changeAdminModal && (
            <ChangeLabAdmin
              loading={loading}
              defaultLabInfo={changeAdminModal}
              handleSubmit={handleChangeLabAdmin as any}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManageLabsPage;
