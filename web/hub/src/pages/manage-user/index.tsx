import { UserSearchQuery } from "@/interfaces/users";
import {
  createNewUser,
  deleteUser,
  editUser,
  getUsersList,
} from "@/services/user.service";
import { DataTable } from "@mono/shared_ui/components/shared/data-table";
import GenericModal from "@mono/shared_ui/components/shared/generic-modal";
import { SiteHeader } from "@mono/shared_ui/components/shared/site-header";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mono/shared_ui/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@mono/shared_ui/components/ui/dialog";
import { IUser } from "@mono/shared_ui/interfaces/user";
import {
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
import { CircleSmallIcon, Filter, PlusIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import UserFilters, { UserFilterSchema } from "./components/user-filters";
import {
  default as CreateNewUserForm,
  CreateNewUserFormType,
  default as UserForm,
} from "./components/user-form";
import UserTableAction from "./components/user-table-action";
const columns: ColumnDef<IUser, any>[] = [
  {
    accessorKey: "image_link",
    header: "",
    enableHiding: false,
    cell: (info) => (
      <Avatar className="h-8 w-8 rounded-lg ">
        <AvatarImage src={info.getValue()} alt={"user image"} />
        <AvatarFallback className="rounded-lg uppercase">
          {info.row.original.first_name.slice(0, 2)}
        </AvatarFallback>
      </Avatar>
    ),
    size: 40,
  },
  {
    accessorKey: "first_name",
    header: "First Name",
    enableHiding: false,
  },
  {
    accessorKey: "last_name",
    header: "Last Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role_name",
    header: "Role",
    cell: (info) =>
      info.getValue() == "super_admin" ? (
        <Badge
          variant={"yellow"}
          fontWeight={"semibold"}
          className="capitalize"
        >
          <CircleSmallIcon />
          {info.getValue()}
        </Badge>
      ) : (
        <Badge
          variant={"red"}
          className="capitalize flex items-center "
          fontWeight={"semibold"}
        >
          <CircleSmallIcon />
          {info.getValue()}
        </Badge>
      ),
  },
  {
    accessorKey: "lab_name",
    header: "Lab Name",
  },
  {
    header: "Actions",
    id: "actions",
    cell: (info) => <UserTableAction {...info} />,
    enablePinning: true,
  },
];

const ManageUsersPage = () => {
  const [loading, setLoading] = useState(false);
  const [createUserModal, setCreateUserModal] = useState(false);
  const [editUserModal, setEditUserModal] = useState<IUser | null>(null);
  const [deleteUserrModal, setDeleteUserModal] = useState<IUser | null>(null);
  const [users, setUsers] = useState<PaginatedDataWithLoading<IUser>>({
    records: [],
    loading: false,
    count: 0,
    skip: 0,
    take: 0,
  });
  const [filterOpen, setFiltrOpen] = useState(false);
  const [filters, setFilters] = useState<UserFilterSchema>({
    searchQuery: "",
    role: "",
  });

  const fetchUsersList = async (params: UserSearchQuery) => {
    let res: PaginatedData<IUser> = {
      count: 0,
      records: [],
      skip: 0,
      take: 0,
    };
    try {
      const data = await getUsersList(params);
      if (!data.error) {
        res = data.data;
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    }
    return res;
  };

  const getUsers = async (param: UserSearchQuery) => {
    setUsers({ count: 0, records: [], skip: 0, take: 0, loading: true });
    const data = await fetchUsersList(param);
    setUsers({ ...data, loading: false });
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
    getUsers({
      ...filters,
      skip: newState.pageIndex * newState.pageSize,
      take: newState.pageSize,
    });
  };
  const table = useReactTable({
    data: users.records,
    columns: columns,
    state: {
      columnVisibility,
      pagination,
      columnPinning: {
        right: ["actions"],
      },
    },
    rowCount: users.count,
    getRowId: (row) => row!.user_id!.toString(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    meta: {
      editUser: setEditUserModal,
      deleteUser: setDeleteUserModal,
    },
  });
  const handleCreteNewUser = async (data: CreateNewUserFormType) => {
    setLoading(true);
    try {
      const res = await createNewUser({
        email: data.email,
        first_name: data?.first_name,
        last_name: data?.last_name,
        lab_id: data.lab!.lab_id as number,
        role_id: data.role,
      });
      if (!res.error) {
        setUsers({ ...users, records: [res.data, ...users.records] });
        setCreateUserModal(false);
        toast.success("Successfully created user.");
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (data: CreateNewUserFormType) => {
    if (!editUserModal) return;
    setLoading(true);
    try {
      const res = await editUser({
        email: data.email,
        first_name: data?.first_name,
        last_name: data?.last_name,
        role_id: data.role,
        userIdp: editUserModal!.identity_provider_id,
      });
      if (!res.error) {
        getUsers({
          searchQuery: filters.searchQuery,
          skip: pagination.pageIndex * pagination.pageSize,
          take: pagination.pageSize,
        });
        setEditUserModal(null);
        toast.success("Successfully updated user.");
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteUser = async () => {
    if (!deleteUserrModal) return;
    setLoading(true);
    try {
      const res = await deleteUser(deleteUserrModal?.identity_provider_id);
      if (!res.error) {
        setDeleteUserModal(null);
        getUsers({
          searchQuery: filters.searchQuery,
          skip: pagination.pageIndex * pagination.pageSize,
          take: pagination.pageSize,
        });
        toast.success("Successfully deleted user.");
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };
  const handleApplyFilter = (filters: UserFilterSchema) => {
    setFilters(filters);
    getUsers({ ...filters, skip: 0, take: 10 });
  };
  const handleClearFilter = (isDirty: boolean) => {
    if (isDirty) {
      setFilters({ searchQuery: "", role: "" });
      getUsers({ searchQuery: "", role: "", skip: 0, take: 10 });
    }
    setFiltrOpen(false);
  };
  useEffect(() => {
    getUsers({
      searchQuery: filters.searchQuery,
      skip: pagination.pageIndex * pagination.pageSize,
      take: pagination.pageSize,
    });
  }, []);

  return (
    <>
      <SiteHeader title="Users" />
      <div className="@container/main flex flex-1 flex-col gap-2 p-2 overflow-hidden ">
        <DataTable
          table={table}
          loading={users.loading}
          tableBodyClassName="**:data-[slot=table-cell]:first:w-auto **:data-[slot=table-cell]:last:w-auto"
          filterComponent={
            filterOpen && (
              <UserFilters
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
                  onClick={() => setFiltrOpen(!filterOpen)}
                  title="Filter User"
                  rounded={"xs"}
                >
                  <Filter />
                  <span className="sr-only">Open Filter</span>
                </Button>
                <Button
                  className=""
                  variant="green"
                  size="sm"
                  onClick={() => setCreateUserModal(true)}
                  title="Add new user"
                  rounded={"xs"}
                >
                  <PlusIcon />
                  <span className="hidden lg:inline">Add New User</span>
                </Button>
              </div>
            </>
          }
        />
      </div>
      <Dialog
        open={!!createUserModal}
        onOpenChange={() => {
          !loading && setCreateUserModal(false);
        }}
      >
        <DialogContent
          disabled={loading}
          className="flex flex-col overflow-hidden p-0 max-h-[95vh] md:max-w-[500px] lg:max-w-[600px]"
        >
          <DialogTitle className="p-4">Create New User</DialogTitle>
          <DialogDescription className="sr-only">
            Modal for creating new user.
          </DialogDescription>
          <CreateNewUserForm
            loading={loading}
            handleSubmit={handleCreteNewUser}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!editUserModal}
        onOpenChange={() => {
          !loading && setEditUserModal(null);
        }}
      >
        <DialogContent
          disabled={loading}
          className="flex flex-col overflow-hidden p-0 max-h-[95vh] md:max-w-[500px] lg:max-w-[600px]"
        >
          <DialogTitle className="p-4">Edit User</DialogTitle>
          <DialogDescription className="sr-only">
            Modal for editing user.
          </DialogDescription>
          {editUserModal && (
            <UserForm
              defaultValues={
                editUserModal && {
                  email: editUserModal.email,
                  first_name: editUserModal.first_name,
                  last_name: editUserModal.last_name,
                  lab: {
                    lab_id: editUserModal.lab_id,
                    name: editUserModal.lab_name,
                  },
                  role: editUserModal.role_id,
                }
              }
              loading={loading}
              handleSubmit={handleEditUser}
            />
          )}
        </DialogContent>
      </Dialog>
      <GenericModal
        loading={loading}
        onOpenChange={() => {
          !loading && setDeleteUserModal(null);
        }}
        open={!!deleteUserrModal}
        onConfirmClick={handleDeleteUser}
        title={"Delete User"}
        variant="danger"
        desc={
          <div>
            Are you sure you want to delete user? This can't be un done.
          </div>
        }
      />
    </>
  );
};

export default ManageUsersPage;
