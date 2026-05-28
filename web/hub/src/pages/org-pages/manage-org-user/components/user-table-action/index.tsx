import { useCanIUse } from "@/components/shared/can-i-use";
import { Button } from "@mono/shared_ui/components/ui/button";
import { PERMISSIONS } from "@mono/shared_ui/interfaces/permissions";
import { OrgUser } from "@mono/shared_ui/interfaces/user";
import { CellContext } from "@tanstack/react-table";
import { Building2, Edit2Icon } from "lucide-react";
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
        onClick={handleViewLabs}
        variant={"yellow"}
        className="rounded size-6 mr-2"
        size={"icon"}
        title="View Labs"
      >
        <Building2 className="size-3" />
      </Button>
    </>
  );
};

export default UserTableAction;
