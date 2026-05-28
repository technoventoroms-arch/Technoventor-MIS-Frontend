import { Button } from "@mono/shared_ui/components/ui/button";
import { IUser } from "@mono/shared_ui/interfaces/user";
import { CellContext } from "@tanstack/react-table";
import { Edit2, Trash } from "lucide-react";
import { BaseSyntheticEvent } from "react";

const UserTableAction = ({ table, row }: CellContext<IUser, any>) => {
  const handleEdit = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.editUser?.(row.original);
  };
  const handleDelete = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.deleteUser?.(row.original);
  };
  const showEdit = row.original.role_name !== "super_admin";
  return (
    showEdit && (
      <>
        <Button
          onClick={handleEdit}
          variant={"indigo"}
          className="rounded size-6 mr-2"
          size={"icon"}
          title="Edit user lab"
        >
          <Edit2 className="size-3" />
        </Button>
        <Button
          onClick={handleDelete}
          variant={"red"}
          className="rounded size-6"
          size={"icon"}
          title="Remove user from lab"
        >
          <Trash className="size-3" />
        </Button>
      </>
    )
  );
};

export default UserTableAction;
