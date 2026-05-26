import { useCanIUse } from "@/components/shared/can-i-use";
import { Button } from "@mono/shared_ui/components/ui/button";
import { PERMISSIONS } from "@mono/shared_ui/interfaces/permissions";
import { OrgUser } from "@mono/shared_ui/interfaces/user";
import { CellContext } from "@tanstack/react-table";
import { Blocks, Building2, Edit2Icon, Trash2 } from "lucide-react";
import { BaseSyntheticEvent } from "react";

const UserTableAction = ({ table, row }: CellContext<OrgUser, any>) => {
  const canEditUser = useCanIUse(PERMISSIONS.UPDATE_USERS);

  const handleEditUser = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.editUser?.(row.original);
  };
  const handleViewLabs = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.viewLabs?.(row.original);
  };
  const handleAssignLabs = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.assignLab?.(row.original);
  };
  const handleDeleteUser = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.deleteUser?.(row.original);
  };

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
      <Button
        onClick={handleAssignLabs}
        variant={"green"}
        className="rounded size-6 mr-2"
        size={"icon"}
        title="Assign Labs"
        disabled={row.original.is_admin}
      >
        <Blocks className="size-3" />
      </Button>
      <Button
        onClick={handleViewLabs}
        variant={"yellow"}
        className="rounded size-6 mr-2"
        size={"icon"}
        title="View Labs"
      >
        <Building2 className="size-3" />
      </Button>
      <Button
        onClick={handleDeleteUser}
        variant={"red"}
        className="rounded size-6"
        size={"icon"}
        title="Delete User"
        disabled={row.original.is_admin}
      >
        <Trash2 className="size-3" />
      </Button>
    </>
  );
};

export default UserTableAction;
