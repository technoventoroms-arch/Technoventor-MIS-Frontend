import { IAttendance } from "@/interfaces/attendance";
import { Button } from "@mono/shared_ui/components/ui/button";
import { CellContext } from "@tanstack/react-table";
import { Edit2Icon } from "lucide-react";
import { BaseSyntheticEvent } from "react";

const AttendanceTableAction = ({
  table,
  row,
}: CellContext<IAttendance, any>) => {
  const handleEditAttendance = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.editAttendance?.(row.original);
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleEditAttendance}
        variant={"indigo"}
        className="rounded size-6 "
        size={"icon"}
        title="Regularize"
      >
        <Edit2Icon className="size-3" />
      </Button>
    </div>
  );
};

export default AttendanceTableAction;
