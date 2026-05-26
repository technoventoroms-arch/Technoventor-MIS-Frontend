import {
  IGenericQueryParam,
  PaginatedData,
  ResponseDataType,
} from "@mono/shared_ui/interfaces/utils";
import http from "./base";
import {
  IMachine,
  MachineLog,
  MachineSpecs,
  MachineStatus,
} from "@/interfaces/machines";
import {
  AddReservation,
  IMachineBookingDetails,
  IMachineReservationQueryParams,
  IUserMacReservationQueryParams,
  MachineBookingSummary,
  ReservationStatusType,
} from "@/interfaces/reservation";
import paramStore from "@/store/params-store";
const { bs } = paramStore;
export const getMachineList = async (param: IGenericQueryParam) => {
  const res = await http.get<ResponseDataType<PaginatedData<IMachine>, null>>(
    bs(`machines`),
    {
      params: param,
    },
  );

  return res.data;
};

export const getMachineById = async (itemId: number) => {
  const res = await http.get<ResponseDataType<IMachine, null>>(
    bs(`machines/${itemId}`),
  );

  return res.data;
};
export const createNewMachine = async (data: IMachine) => {
  const res = await http.post<ResponseDataType<IMachine, null>>(
    bs(`machines`),
    data,
  );
  return res.data;
};
export const editMachine = async (machineId: number, data: IMachine) => {
  const res = await http.put<ResponseDataType<IMachine, null>>(
    bs(`machines/${machineId}`),
    data,
  );
  return res.data;
};
export const deleteMachine = async (machineId: number) => {
  const res = await http.delete<ResponseDataType<IMachine, null>>(
    bs(`machines/${machineId}`),
  );
  return res.data;
};

export const getMachineReservations = async (
  machineId: number,
  payload?: IMachineReservationQueryParams,
) => {
  const res = await http.get<
    ResponseDataType<PaginatedData<MachineBookingSummary>, null>
  >(bs(`machines/${machineId}/reservations`), { params: payload });
  return res.data;
};
export const addMachineReservation = async (
  data: AddReservation & { isCurrent?: boolean },
) => {
  const res = await http.post<ResponseDataType<IMachineBookingDetails, null>>(
    bs(`machines/reservations`),
    data,
  );
  return res.data;
};
export const updateMachineReservationStatus = async (
  reservationId: number,
  data: {
    project_id: number;
    status: "APPROVED" | "REJECTED" | "PENDING"; // add other statuses if needed
  },
) => {
  const res = await http.put<ResponseDataType<IMachine, null>>(
    bs(`machines/reservations/${reservationId}/status`),
    data,
  );
  return res.data;
};

export const getMachineReservationsForProject = async (
  projectId: number,
  payload?: IMachineReservationQueryParams,
) => {
  const res = await http.get<
    ResponseDataType<PaginatedData<MachineBookingSummary>, null>
  >(bs(`projects/${projectId}/machines/reservations`), { params: payload });
  return res.data;
};
export const updateMachineReservations = async (
  projectId: number,
  reservationId: number,
  status: ReservationStatusType,
  notes?: string,
) => {
  const res = await http.put<ResponseDataType<MachineBookingSummary, null>>(
    bs(`machines/reservations/${reservationId}/status`),
    { project_id: projectId, status: status, notes },
  );
  return res.data;
};

export const getMachineReservationsForUser = async (
  payload?: IUserMacReservationQueryParams,
) => {
  const res = await http.get<
    ResponseDataType<PaginatedData<MachineBookingSummary>, null>
  >(bs(`users/machines/reservations`), { params: payload });
  return res.data;
};

export const getEarliestReservationSlotForMachine = async (payload: {
  machineId: number;
  from: string;
  to?: string;
}) => {
  const res = await http.get<
    ResponseDataType<
      {
        slot_start: string;
        slot_end: string;
      },
      null
    >
  >(bs(`machines/${payload.machineId}/earliest-available-slot`), {
    params: payload,
  });
  return res.data;
};
export const getMachineLogsList = async (
  machineId: number,
  param: IGenericQueryParam,
) => {
  const res = await http.get<ResponseDataType<PaginatedData<MachineLog>, null>>(
    bs(`machines/${machineId}/logs`),
    {
      params: param,
    },
  );

  return res.data;
};

export const getCurrentMachineReservation = async (machineId: number) => {
  const res = await http.get<ResponseDataType<IMachineBookingDetails[], null>>(
    bs(`machines/${machineId}/reservations/current`),
  );

  return res.data;
};

export const consumeMachineReservations = async (
  reservationId: number,
  payload: {
    notes: string;
    status: MachineStatus;
  },
) => {
  const res = await http.post<ResponseDataType<MachineBookingSummary, null>>(
    bs(`machines/reservations/${reservationId}/consume`),
    payload,
  );
  return res.data;
};
export const getMachineSpecs = async (
  machineID: number,
  params: IGenericQueryParam,
) => {
  const res = await http.get<ResponseDataType<MachineSpecs[], null>>(
    bs(`machines/${machineID}/attributes`),
    { params },
  );
  return res.data;
};

export const deleteMachineSpecs = async (
  machineID: number,
  specsId: number,
) => {
  const res = await http.delete<ResponseDataType<null, null>>(
    bs(`machines/${machineID}/attributes/${specsId}`),
  );
  return res.data;
};

export const createMachineSpecs = async (machineID: number, data: any) => {
  const res = await http.post<ResponseDataType<MachineSpecs, null>>(
    bs(`machines/${machineID}/attributes`),
    data,
  );
  return res.data;
};

export const regenerateApiKey = async (machineID: number) => {
  const res = await http.post<ResponseDataType<IMachine, null>>(
    bs(`machines/${machineID}/regenerate-api-key`),
  );
  return res.data;
};
export const canOverRideMachineReservations = async (reservationId: number) => {
  const res = await http.get<ResponseDataType<boolean, null>>(
    bs(`machines/reservations/${reservationId}/can-override`),
  );
  return res.data;
};
export const cancelMachineReservations = async (
  reservationId: number,
  notes: string,
) => {
  const res = await http.post<ResponseDataType<boolean, null>>(
    bs(`machines/reservations/${reservationId}/override/remove`),
    { notes: notes, reservation_id: reservationId },
  );
  return res.data;
};
