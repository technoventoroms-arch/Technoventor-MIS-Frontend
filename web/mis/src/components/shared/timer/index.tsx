import { intervalToDuration } from "date-fns";
import { useEffect, useState } from "react";

type Props = {
  startTime: Date | string;
  checkedOut?: Date | string;
};

const Timer = ({ startTime, checkedOut }: Props) => {
  const [time, setTime] = useState<any[]>([]);

  useEffect(() => {
    if (checkedOut) {
      if (time.length) return;
      const { hours, minutes, seconds } = intervalToDuration({
        end: new Date(checkedOut).toISOString(),
        start: new Date(startTime).toISOString(),
      });
      setTime([hours, minutes, seconds]);
    } else {
      setTimeout(() => {
        const { hours, minutes, seconds } = intervalToDuration({
          end: new Date().toISOString(),
          start: new Date(startTime).toISOString(),
        });
        setTime([hours, minutes, seconds]);
      }, 1000);
    }
  }, [time, checkedOut]);

  return (
    <div className="flex gap-2 items-center">
      <span className="w-8 text-center bg-yellow-100 dark:bg-yellow-600  rounded p-1">
        {`${time[0] || "00"}`.padStart(2, "0")}
      </span>
      :
      <span className="w-8 text-center bg-yellow-100 dark:bg-yellow-600 rounded p-1">
        {`${time[1] || "00"}`.padStart(2, "0")}
      </span>
      :
      <span className="w-8 text-center bg-yellow-100 dark:bg-yellow-600 rounded p-1">
        {`${time[2] || "00"}`.padStart(2, "0")}
      </span>
    </div>
  );
};

export default Timer;
