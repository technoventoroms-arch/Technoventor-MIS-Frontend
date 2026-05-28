import { Button } from "@mono/shared_ui/components/ui/button";
import { IUser } from "@mono/shared_ui/interfaces/user";
import { CellContext } from "@tanstack/react-table";
import { Edit2Icon, UserCheck } from "lucide-react";
import { BaseSyntheticEvent } from "react";

const UserTableAction = ({ table, row }: CellContext<IUser, any>) => {
  const handleEditUser = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.editUser?.(row.original);
  };
  const handleViewAttendance = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.viewAttendance?.(row.original);
  };
  return (
    <>
      <Button
        onClick={handleEditUser}
        variant={"indigo"}
        className="rounded size-6 mr-2"
        size={"icon"}
        title={"View user"}
      >
        <Edit2Icon className="size-3" />
      </Button>
      <Button
        onClick={handleViewAttendance}
        variant={"yellow"}
        className="rounded size-6"
        size={"icon"}
        title="View Attendance"
      >
        <UserCheck className="size-3" />
      </Button>
    </>
  );
};

export default UserTableAction;
