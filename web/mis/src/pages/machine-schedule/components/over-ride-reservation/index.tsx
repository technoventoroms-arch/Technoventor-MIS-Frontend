import { MachineBookingSummary } from "@/interfaces/reservation";
import { canOverRideMachineReservations } from "@/services/machine.service";
import { IEvent } from "@mono/shared_ui/components/shared/event-calendar/index";
import { Button } from "@mono/shared_ui/components/ui/button";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  event: IEvent<MachineBookingSummary>;
  handleCancelReservation: () => void;
};

const OverRideReservation = ({ event, handleCancelReservation }: Props) => {
  const [canOverride, setCanOverride] = useState(false);
  const checkOverridePermission = async () => {
    try {
      const res = await canOverRideMachineReservations(event.id);
      if (!res.error) {
        setCanOverride(res.data);
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
  };

  useEffect(() => {
    event?.id && checkOverridePermission();
  }, [event?.id]);
  return canOverride ? (
    <div>
      <Button onClick={handleCancelReservation}>Cancel Reservation</Button>
    </div>
  ) : null;
};

export default OverRideReservation;
