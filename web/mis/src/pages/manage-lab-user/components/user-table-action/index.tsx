import { useCanIUse } from "@/components/shared/can-i-use";
import { useActiveOrganization } from "@/providers/active-organization-provider";
import { useUser } from "@/providers/user-info-provider";

import { Button } from "@mono/shared_ui/components/ui/button";
import { PERMISSIONS } from "@mono/shared_ui/interfaces/permissions";
import { IUser } from "@mono/shared_ui/interfaces/user";
import { CellContext } from "@tanstack/react-table";
import { CreditCard, Edit2Icon, UserCheck, X } from "lucide-react";
import { BaseSyntheticEvent } from "react";

const UserTableAction = ({ table, row }: CellContext<IUser, any>) => {
  const canEditUser = useCanIUse(PERMISSIONS.UPDATE_USERS);
  const canViewAttendance = useCanIUse(PERMISSIONS.APPROVE_ATTENDANCE);
  const org = useActiveOrganization();
  const user = useUser();
  const handleEditUser = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.editUser?.(row.original);
  };
  const handleViewAttendance = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.viewAttendance?.(row.original);
  };
  const handleMangeUserCardInfo = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.mangeUserCardInfo?.(row.original);
  };
  const handleRemoveUserFromLab = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.removeUserFromLab?.(row.original);
  };
  const canRemoveUser =
    org.activeOrganization?.admin.identity_provider_id !=
      row.original.identity_provider_id ||
    user.user?.identity_provider_id != row.original.identity_provider_id ||
    (org.activeOrganization?.admin.identity_provider_id ==
      user.user?.identity_provider_id &&
      (row.original.role_name == "admin" || row.original.role_name == "user"));

  return (
    <>
      <Button
        onClick={handleEditUser}
        variant={"indigo"}
        className="rounded size-6 mr-2"
        size={"icon"}
        title={canEditUser ? "View user" : "Edit user"}
      >
        <Edit2Icon className="size-3" />
      </Button>
      {canViewAttendance && (
        <Button
          onClick={handleViewAttendance}
          variant={"yellow"}
          className="rounded size-6 mr-2"
          size={"icon"}
          title="View Attendance"
        >
          <UserCheck className="size-3" />
        </Button>
      )}
      {canEditUser && (
        <>
          <Button
            onClick={handleMangeUserCardInfo}
            variant={"indigo"}
            className="rounded size-6 mr-2"
            size={"icon"}
            title={"User Lab card Info"}
          >
            <CreditCard className="size-3" />
          </Button>
          {canRemoveUser && (
            <Button
              onClick={handleRemoveUserFromLab}
              variant={"red"}
              className="rounded size-6 mr-2"
              size={"icon"}
              title={"Remove User from Lab"}
            >
              <X className="size-3" />
            </Button>
          )}
        </>
      )}
    </>
  );
};

export default UserTableAction;
