import { IAttendance } from "@/interfaces/attendance";
import { Button } from "@mono/shared_ui/components/ui/button";
import { CellContext } from "@tanstack/react-table";
import { Check, X } from "lucide-react";
import { BaseSyntheticEvent } from "react";

const UserAttendanceTableAction = ({
  table,
  row,
}: CellContext<IAttendance, any>) => {
  const handleRejectAttendance = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.rejectAttendance?.(row.original);
  };
  const handleApproveAttendance = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    (table.options.meta as any)?.approveAttendance?.(row.original);
  };

  return row.original.check_out_at && row.original.status == "PENDING" ? (
    <>
      <Button
        onClick={handleApproveAttendance}
        variant={"green"}
        className="rounded size-6 mr-2"
        size={"icon"}
        title="Approve attendance"
      >
        <Check className="size-3" />
      </Button>
      <Button
        onClick={handleRejectAttendance}
        variant={"red"}
        className="rounded size-6"
        size={"icon"}
        title="Reject Attendance"
      >
        <X className="size-3" />
      </Button>
    </>
  ) : null;
};

export default UserAttendanceTableAction;
