import CanIUse, { useCanIUse } from "@/components/shared/can-i-use";
import InviteUser, {
  InviteUserFormData,
} from "@/components/shared/invite-user";
import { routeConstants } from "@/constants/route.constants";
import { UserSearchQuery } from "@/interfaces/users";
import { useActiveOrganization } from "@/providers/active-organization-provider";
import { useLabContext } from "@/providers/lab-provider";
import { useOrgContext } from "@/providers/organization-provider";
import { useUser } from "@/providers/user-info-provider";
import { inviteUsers } from "@/services/admin.service";
import { removeUserFromLab } from "@/services/labs.service";
import { getUsersList, updateUserById } from "@/services/user.service";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@mono/shared_ui/components/ui/dialog";
import { DrawerContent } from "@mono/shared_ui/components/ui/drawer";
import { roleMapping } from "@mono/shared_ui/constants/role-mapping";
import { useLoading } from "@mono/shared_ui/hooks/use-loading";
import { PERMISSIONS } from "@mono/shared_ui/interfaces/permissions";
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
import { CircleSmallIcon, Filter, PlusIcon, Timer } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PendingInvites from "./components/pending-invites";
import UserCardInfoForm from "./components/user-card-info";
import UserFilters, { UserFilterSchema } from "./components/user-filters";
import {
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
    id: "actions",
    header: "Actions",
    cell: (info) => <UserTableAction {...info} />,
    enablePinning: true,
  },
];

const ManageLabUsersPage = () => {
  const { orgId } = useOrgContext();
  const { limits } = useActiveOrganization();
  const { labId, baseUrl, labData } = useLabContext();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [createUserModal, setCreateUserModal] = useState(false);
  const [editUserModal, setEditUserModal] = useState<IUser | null>(null);
  const [showPendingInvite, setShowPendingInvite] = useState(false);
  const [removeLab, setRemoveLab] = useState<IUser | null>(null);
  const { RemoveUserloading, hideRemoveUserLoading, showRemoveUserLoading } =
    useLoading("RemoveUser");

  const [users, setUsers] = useState<PaginatedDataWithLoading<IUser>>({
    records: [],
    loading: false,
    count: 0,
    skip: 0,
    take: 0,
  });
  const [filterOpen, setFiltrOpen] = useState(false);
  const [showMangeUserCardInfo, setShowMangeUserCardInfo] =
    useState<IUser | null>(null);
  const [filters, setFilters] = useState<UserFilterSchema>({
    searchQuery: "",
    role: "",
  });
  const canEditUser = useCanIUse(PERMISSIONS.UPDATE_USERS);
  const navigate = useNavigate();
  const fetchUsersList = async (params: UserSearchQuery) => {
    let res: PaginatedData<IUser> = {
      count: 0,
      records: [],
      skip: 0,
      take: 0,
    };
    try {
      const data = await getUsersList(labId, orgId, params);
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
      columnPinning: { right: ["actions"] },
    },
    rowCount: users.count,
    getRowId: (row) => row!.user_id!.toString(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,

    meta: {
      editUser: setEditUserModal,
      viewAttendance: (item: IUser) =>
        navigate(
          `/${baseUrl}/${routeConstants.USERS}/${item.identity_provider_id}/${routeConstants.ATTENDANCE}`,
        ),
      mangeUserCardInfo: setShowMangeUserCardInfo,
      removeUserFromLab: setRemoveLab,
    },
  });

  const handleEditUser = async (data: CreateNewUserFormType) => {
    setLoading(true);
    try {
      const res = await updateUserById({
        email: data.email,
        first_name: data?.first_name,
        last_name: data?.last_name,
        lab_id: user!.lab_id!,
        role_id: roleMapping[data.role_name],
        user_id: editUserModal?.identity_provider_id,
      } as any);
      if (!res.error) {
        setUsers({
          ...users,
          records: users.records.map((i) =>
            i.user_id == res.data.user_id
              ? { ...res.data, role_name: data.role_name as any }
              : i,
          ),
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

  const handleRemoveUserFromLab = async () => {
    showRemoveUserLoading();
    try {
      const res = await removeUserFromLab(
        orgId,
        labId,
        removeLab!.identity_provider_id,
      );
      if (!res.error) {
        toast.success("Successfully removed user from lab.");
        setRemoveLab(null);
        getUsers({
          searchQuery: filters.searchQuery,
          skip: pagination.pageIndex * pagination.pageSize,
          take: pagination.pageSize,
        });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      hideRemoveUserLoading();
    }
  };

  const handelInviteUser = async (props: InviteUserFormData) => {
    setLoading(true);
    try {
      const res = await inviteUsers(orgId, labId, {
        users: props.users.map((i) => ({ email: i.mail, role_id: i.role })),
      });
      if (!res.error) {
        setCreateUserModal(false);
        toast.success("Invitation sent successfully.");
      }
    } catch (error) {
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
  const isUserLimitExceeded = limits.USER?.resource_type
    ? limits.USER.used_quantity >= limits.USER.allowed_quantity
    : false;
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
                {!isUserLimitExceeded && (
                  <CanIUse action={(a) => a.CREATE_USERS}>
                    <Button
                      className="mr-2"
                      variant="yellow"
                      size="sm"
                      onClick={() => setShowPendingInvite(true)}
                      title="Pending Invite"
                      rounded={"xs"}
                    >
                      <Timer />
                      <span className="hidden lg:inline">Pending Invite</span>
                    </Button>
                  </CanIUse>
                )}
                <CanIUse action={(a) => a.CREATE_USERS}>
                  <Button
                    className=""
                    variant="green"
                    size="sm"
                    onClick={() => setCreateUserModal(true)}
                    title="Add new user"
                    rounded={"xs"}
                  >
                    <PlusIcon />
                    <span className="hidden lg:inline">Invite New User</span>
                  </Button>
                </CanIUse>
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
          <DialogTitle className="p-4">Invite New User</DialogTitle>
          <DialogDescription className="sr-only">
            Modal for creating new user.
          </DialogDescription>
          <InviteUser
            orgId={orgId}
            handleClose={() => setCreateUserModal(false)}
            handleSubmit={handelInviteUser}
            loading={loading}
            labs={{ data: [], loading: false }}
            showLabSelect={false}
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
          <DialogTitle className="p-4">Edit User </DialogTitle>
          <DialogDescription className="sr-only">
            Modal for editing user.
          </DialogDescription>
          {editUserModal && (
            <UserForm
              defaultValues={{
                ...editUserModal,
                role_name: editUserModal.role_name,
              }}
              loading={loading}
              handleSubmit={handleEditUser}
              isEditMode
              disabled={!canEditUser}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!showMangeUserCardInfo}
        onOpenChange={() => {
          !loading && setShowMangeUserCardInfo(null);
        }}
      >
        <DialogContent
          disabled={loading}
          className="flex flex-col overflow-hidden p-0 max-h-[95vh] md:max-w-[500px] lg:max-w-[600px]"
        >
          <DialogTitle className="p-4">User card info</DialogTitle>
          <DialogDescription className="sr-only">
            Modal for user card info.
          </DialogDescription>
          {showMangeUserCardInfo && (
            <UserCardInfoForm
              userInfo={showMangeUserCardInfo!}
              disabled={!canEditUser}
              labId={labId}
              orgId={orgId}
            />
          )}
        </DialogContent>
      </Dialog>

      <ResponsiveDrawer
        open={!!showPendingInvite}
        onClose={() => {
          setShowPendingInvite(false);
        }}
      >
        <DrawerContent className="pt-0 px-2 pb-2 data-[vaul-drawer-direction=right]:min-w-2xl data-[vaul-drawer-direction=bottom]:max-h-[90vh] data-[vaul-drawer-direction=bottom]:mt-4!">
          <ResponsiveDrawer.Header
            title={`Pending Invites`}
            description={`Modal to view pending invites`}
          />
          <div className="overflow-auto">
            <PendingInvites labId={labId} orgId={orgId} />
          </div>
        </DrawerContent>
      </ResponsiveDrawer>
      <GenericModal
        open={!!removeLab}
        onOpenChange={() => setRemoveLab(null)}
        onConfirmClick={handleRemoveUserFromLab}
        loading={RemoveUserloading}
        title={"Remove User"}
        confirmButtonText="Remove"
        variant="danger"
        desc={
          <>
            Are you sure you want to remove{" "}
            <div className="flex gap-2 my-2">
              <Avatar className="h-8 w-8 rounded-lg ">
                <AvatarImage
                  src={removeLab?.image_link}
                  alt={removeLab?.first_name}
                />
                <AvatarFallback className="rounded-lg uppercase">
                  {removeLab?.first_name?.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {removeLab?.first_name} {removeLab?.last_name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {removeLab?.email}
                </span>
              </div>
            </div>{" "}
            from lab
            <Badge variant={"red"} className="ml-2" fontWeight={"semibold"}>
              {labData?.name}
            </Badge>
          </>
        }
      />
    </>
  );
};

export default ManageLabUsersPage;
