import { InviteUserFormData } from "@/components/shared/invite-user";
import { routeConstants } from "@/constants/route.constants";
import { UserSearchQuery } from "@/interfaces/users";
import { useActiveOrganization } from "@/providers/active-organization-provider";
import { useOrgContext } from "@/providers/organization-provider";
import { inviteUsers } from "@/services/admin.service";
import {
  deleteUserFromOrganization,
  getOrganizationUsersList,
  getOrgUsersLabsList,
} from "@/services/organization.service";
import { DataTable } from "@mono/shared_ui/components/shared/data-table";
import GenericModal from "@mono/shared_ui/components/shared/generic-modal";
import RepeatElement from "@mono/shared_ui/components/shared/repeat-element";
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
import { Skeleton } from "@mono/shared_ui/components/ui/skeleton";
import { useLoading } from "@mono/shared_ui/hooks/use-loading";
import { IUserLab } from "@mono/shared_ui/interfaces/labs";
import { OrgUser } from "@mono/shared_ui/interfaces/user";
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
import { Filter, MonitorCheck, MonitorOff, PlusIcon, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import AssignLabs from "./components/assign-lab";
import InviteUser from "./components/invite-org-user";
import UserFilters, { UserFilterSchema } from "./components/user-filters";
import UserTableAction from "./components/user-table-action";
import ViewUserForm from "./components/view-user";
import { removeUserFromLab } from "@/services/labs.service";
import { OtpVerificationResponse } from "@mono/shared_ui/interfaces/otp";
import OTPHandler from "@/components/shared/otp-handler";

const columns: ColumnDef<OrgUser, any>[] = [
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
    id: "actions",
    header: "Actions",
    cell: (info) => <UserTableAction {...info} />,
    enablePinning: true,
  },
];

const ManageOrgUsersPage = () => {
  const { orgId } = useOrgContext();
  const { isOrgAdmin } = useActiveOrganization();
  const [loading, setLoading] = useState(false);
  const [createUserModal, setCreateUserModal] = useState(false);
  const [editUserModal, setEditUserModal] = useState<OrgUser | null>(null);
  const [assignUserModal, setAssignUserModal] = useState<OrgUser | null>(null);
  const [deleteUserModal, setDeleteUserModal] = useState<OrgUser | null>(null);
  const [showLabsModal, setShowLabsModal] = useState<OrgUser | null>(null);
  const [confirmDeleteModal, setConfirmDeleteModalModal] = useState(false);
  const [otpToken, setOtpToken] = useState<OtpVerificationResponse | null>(
    null,
  );
  const { DeleteUserloading, hideDeleteUserLoading, showDeleteUserLoading } =
    useLoading("DeleteUser");

  const [users, setUsers] = useState<PaginatedDataWithLoading<OrgUser>>({
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
    let res: PaginatedData<OrgUser> = {
      count: 0,
      records: [],
      skip: 0,
      take: 0,
    };
    try {
      const data = await getOrganizationUsersList(orgId, params);
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
      viewLabs: setShowLabsModal,
      deleteUser: setDeleteUserModal,
      assignLab: setAssignUserModal,
    },
  });

  const handelInviteUser = async (props: InviteUserFormData) => {
    setLoading(true);
    try {
      const res = await inviteUsers(orgId, props.lab.lab_id, {
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
  const handleDeleteUser = async () => {
    if (!deleteUserModal?.identity_provider_id) return;
    showDeleteUserLoading();
    try {
      const res = await deleteUserFromOrganization(
        orgId,
        deleteUserModal?.identity_provider_id,
        otpToken?.verification_token || "",
      );
      if (!res.error) {
        setDeleteUserModal(null);
        getUsers({
          searchQuery: filters.searchQuery,
          skip: pagination.pageIndex * pagination.pageSize,
          take: pagination.pageSize,
        });
      }
      toast.success("Successfully deleted user from organization.");
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      hideDeleteUserLoading();
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
  if (!isOrgAdmin) {
    return <Navigate to={`/${routeConstants.UNAUTHORIZED}`} />;
  }
  return (
    <>
      <SiteHeader title="Organization Users" />
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
                  <span className="hidden lg:inline">Invite New User</span>
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
          <DialogTitle className="p-4">Invite Users</DialogTitle>
          <DialogDescription className="sr-only">
            Modal for creating new user.
          </DialogDescription>
          <InviteUser
            loading={loading}
            handleSubmit={handelInviteUser}
            handleClose={() => !loading && setCreateUserModal(false)}
            orgId={orgId}
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
          <DialogTitle className="p-4">View User </DialogTitle>
          <DialogDescription className="sr-only">
            Modal for editing user.
          </DialogDescription>
          {editUserModal && (
            <ViewUserForm
              defaultValues={{
                ...editUserModal,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      <ResponsiveDrawer
        open={!!showLabsModal}
        onClose={() => {
          setShowLabsModal(null);
        }}
      >
        <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[90vh] data-[vaul-drawer-direction=bottom]:mt-4!">
          <ResponsiveDrawer.Header
            title={`User - ${showLabsModal?.first_name || ""} ${
              showLabsModal?.last_name || ""
            }`}
            description={`Modal to View labs for user ${
              showLabsModal?.first_name || ""
            }`}
          />
          <div className="overflow-auto">
            <UserLabsList
              userId={showLabsModal?.identity_provider_id || ""}
              orgId={orgId}
              canRemoveUserFromLab={!showLabsModal?.is_admin}
              user={showLabsModal!}
            />
          </div>
        </DrawerContent>
      </ResponsiveDrawer>

      <GenericModal
        open={!!deleteUserModal}
        onOpenChange={() => setDeleteUserModal(null)}
        onConfirmClick={
          () => setConfirmDeleteModalModal(true)
          // handleDeleteUser
        }
        loading={loading}
        title={"Remove User"}
        confirmButtonText="Delete"
        variant="danger"
        descAsChild
        desc={
          <div>
            Are you sure you want to delete below user ? This will also
            <span className="underline mx-1">remove</span>
            the user from all the labs. This action can't be undone.
            <div className="flex gap-2 mt-2">
              <Avatar className="h-8 w-8 rounded-lg ">
                <AvatarImage
                  src={deleteUserModal?.image_link}
                  alt={deleteUserModal?.first_name}
                />
                <AvatarFallback className="rounded-lg uppercase">
                  {deleteUserModal?.first_name?.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {deleteUserModal?.first_name} {deleteUserModal?.last_name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {deleteUserModal?.email}
                </span>
              </div>
            </div>
            <div className="mt-2">
              You can again invite the user in future or the user can request to
              join the organization again in future by sending a new join
              request.
            </div>
          </div>
        }
      />
      <GenericModal
        open={confirmDeleteModal}
        onOpenChange={() => {
          setConfirmDeleteModalModal(false);
          setOtpToken(null);
        }}
        onConfirmClick={handleDeleteUser}
        loading={DeleteUserloading}
        title={"Confirm Delete User From Organization"}
        confirmButtonText="Transfer"
        variant="danger"
        disableConfirm={!otpToken}
        descAsChild
        desc={
          <div className="space-y-4">
            <div>
              Are you sure you want to delete below user ? This will also
              <span className="underline mx-1">remove</span>
              the user from all the labs. This action can't be undone.
              <div className="flex gap-2 mt-2">
                <Avatar className="h-8 w-8 rounded-lg ">
                  <AvatarImage
                    src={deleteUserModal?.image_link}
                    alt={deleteUserModal?.first_name}
                  />
                  <AvatarFallback className="rounded-lg uppercase">
                    {deleteUserModal?.first_name?.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {deleteUserModal?.first_name} {deleteUserModal?.last_name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {deleteUserModal?.email}
                  </span>
                </div>
              </div>
            </div>
            <div>
              Please enter the OTP send to your mail to confirm delete user.
            </div>
            <div>
              <OTPHandler
                onOTPConfirm={setOtpToken}
                actionType={"REMOVE_USER_FROM_ORGANISATION"}
              />
            </div>
          </div>
        }
      />
      <ResponsiveDrawer
        open={!!assignUserModal}
        onClose={() => {
          setAssignUserModal(null);
        }}
      >
        <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[90vh] data-[vaul-drawer-direction=bottom]:mt-4!">
          <ResponsiveDrawer.Header
            title={`Assign lab to user.`}
            description={`Modal to Assign labs for user `}
          />
          <AssignLabs
            user={assignUserModal!}
            orgId={orgId}
            handleOnSubmit={() => {
              setAssignUserModal(null);
            }}
          />
        </DrawerContent>
      </ResponsiveDrawer>
    </>
  );
};

export default ManageOrgUsersPage;

type UserLabsListProps = {
  userId: string;
  orgId: number;
  canRemoveUserFromLab: boolean;
  user?: OrgUser;
};
const UserLabsList = ({
  userId,
  orgId,
  canRemoveUserFromLab,
  user,
}: UserLabsListProps) => {
  const [removeLab, setRemoveLab] = useState<IUserLab | null>(null);
  const { hideLoading, loading, showLoading } = useLoading();
  const { RemoveUserloading, hideRemoveUserLoading, showRemoveUserLoading } =
    useLoading("RemoveUser");
  const [labsList, setLabsList] = useState<IUserLab[]>([]);
  const getUserLabs = async () => {
    showLoading();
    try {
      const res = await getOrgUsersLabsList(orgId, userId);
      if (!res.error) {
        setLabsList(res.data || []);
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      hideLoading();
    }
  };
  const handleRemoveUserFromLab = async () => {
    showRemoveUserLoading();
    try {
      const res = await removeUserFromLab(orgId, removeLab!.lab_id, userId);
      if (!res.error) {
        toast.success("Successfully removed user from lab.");
        setRemoveLab(null);
        getUserLabs();
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      hideRemoveUserLoading();
    }
  };
  useEffect(() => {
    getUserLabs();
  }, []);
  return (
    <>
      <ul className="px-4 py-2">
        {loading ? (
          <RepeatElement count={10}>
            <li className="my-2 pb-2">
              <Skeleton className="h-10" />
            </li>
          </RepeatElement>
        ) : (
          labsList.map((item) => (
            <li
              key={item.lab_id}
              className="grid grid-cols-[1fr_auto] gap-2 not-last:border-b my-2 pb-2"
            >
              <div>
                <div
                  className="grid grid-cols-[auto_1fr] items-center gap-2"
                  title={item.is_active ? "Active" : "InActive"}
                >
                  {item.is_active ? (
                    <MonitorCheck
                      className={
                        "size-4 text-green-700/70 dark:text-green-300/70"
                      }
                    />
                  ) : (
                    <MonitorOff
                      className={"size-4  text-red-700 dark:text-red-300/70"}
                    />
                  )}

                  <span>{item.name}</span>
                </div>
                <div className="text-sm opacity-75">
                  {item.city}, {item.state}, {item.zipcode} - {item.country}
                </div>
                <Badge
                  className="mt-2 capitalize"
                  fontSize="small"
                  variant={"blue"}
                >
                  {item.role_name?.toUpperCase()}
                </Badge>
              </div>
              {canRemoveUserFromLab && (
                <Button
                  onClick={() => setRemoveLab(item)}
                  size={"sm"}
                  variant={"red"}
                >
                  <X />
                </Button>
              )}
            </li>
          ))
        )}
      </ul>
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
                <AvatarImage src={user?.image_link} alt={user?.first_name} />
                <AvatarFallback className="rounded-lg uppercase">
                  {user?.first_name?.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user?.first_name} {user?.last_name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </div>{" "}
            from lab
            <Badge variant={"red"} className="ml-2" fontWeight={"semibold"}>
              {removeLab?.name}
            </Badge>
          </>
        }
      />
    </>
  );
};
