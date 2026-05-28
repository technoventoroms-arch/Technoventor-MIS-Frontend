import { MachineStatus } from "@/interfaces/machines";
import { ReservationStatusType } from "@/interfaces/reservation";

export const machineStatusToVariant: Record<MachineStatus, string> = {
  ACTIVE: "green",
  OCCUPIED: "blue",
  OFF: "gray",
  UNDER_MAINTENANCE: "yellow",
  RETIRED: "purple",
  FAULTY: "red",
};

export const reqStatusToVariant: Record<ReservationStatusType, string> = {
  APPROVED: "green",
  NEW: "blue",
  CANCELLED: "yellow",

  REJECTED: "red",
};
