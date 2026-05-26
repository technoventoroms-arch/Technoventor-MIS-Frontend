import Timer from "@/components/shared/timer";
import { IAttendance } from "@/interfaces/attendance";
import {
  checkinAttendance,
  checkOutAttendance,
  getUsersCurrentAttendance,
} from "@/services/user.service";
import { Button } from "@mono/shared_ui/components/ui/button";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { format } from "date-fns";
import { LogIn, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const TodayAttendance = () => {
  const [currentAttendance, setCurrentAttendance] =
    useState<IAttendance | null>(null);
  const handleCheckIn = async () => {
    try {
      const res = await checkinAttendance({
        check_in_at: new Date().toISOString(),
      });
      setCurrentAttendance(res.data);
      toast.success("Successfully checked-in");
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
  };
  const handleCheckOut = async () => {
    try {
      const res = await checkOutAttendance(currentAttendance!.id);
      setCurrentAttendance(res.data);
      toast.success("Successfully checked-out");
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
  };
  const fetchCurrentAttendance = async () => {
    try {
      const res = await getUsersCurrentAttendance();
      setCurrentAttendance(res.data);
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
  };
  useEffect(() => {
    fetchCurrentAttendance();
  }, []);

  return (
    <div className="bg-green-50/50 dark:bg-green-950/20 rounded mx-2 mt-2 p-2 flex items-center justify-between">
      <div>
        <span className="hidden md:inline">Attendance For - </span>
        <span className="font-bold"> {format(new Date(), "dd-MMM-yyyy")}</span>
      </div>
      <div className="flex gap-2">
        {currentAttendance && (
          <Timer
            startTime={currentAttendance!.check_in_at}
            checkedOut={currentAttendance?.check_out_at}
          />
        )}
        {currentAttendance ? (
          currentAttendance.check_out_at ? null : (
            <Button
              className="mr-2"
              variant="green"
              size="sm"
              onClick={handleCheckOut}
              title="Check-out"
              rounded={"xs"}
            >
              <LogOut />
              <span className="hidden sm:inline">Check-out</span>
            </Button>
          )
        ) : (
          <Button
            className="mr-2"
            variant="green"
            size="sm"
            onClick={handleCheckIn}
            title="Check-in"
            rounded={"xs"}
          >
            <LogIn />
            <span className="hidden sm:inline">Check-in</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default TodayAttendance;
