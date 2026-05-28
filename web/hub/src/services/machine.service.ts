import { IMachine, MachineLog, MachineSpecs } from "@/interfaces/machines";
import {
  IMachineBookingDetails,
  IMachineReservationQueryParams,
  IUserMacReservationQueryParams,
  MachineBookingSummary,
} from "@/interfaces/reservation";
import {
  IGenericQueryParam,
  PaginatedData,
  ResponseDataType,
} from "@mono/shared_ui/interfaces/utils";
import http from "./base";
import paramStore from "@/store/params-store";
const { bs } = paramStore;

export const getMachineList = async (param: IGenericQueryParam) => {
  const res = await http.get<ResponseDataType<PaginatedData<IMachine>, null>>(
    bs(`machines`),
    {
      params: param,
    }
  );

  return res.data;
};

export const getMachineById = async (itemId: number) => {
  const res = await http.get<ResponseDataType<IMachine, null>>(
    bs(`machines/${itemId}`)
  );

  return res.data;
};
export const getMachineReservations = async (
  machineId: number,
  payload?: IMachineReservationQueryParams
) => {
  const res = await http.get<
    ResponseDataType<PaginatedData<MachineBookingSummary>, null>
  >(bs(`machines/${machineId}/reservations`), {
    params: payload,
  });
  return res.data;
};
export const getMachineReservationsForProject = async (
  projectId: number,
  payload?: IMachineReservationQueryParams
) => {
  const res = await http.get<
    ResponseDataType<PaginatedData<MachineBookingSummary>, null>
  >(bs(`projects/${projectId}/machines/reservations`), {
    params: payload,
  });
  return res.data;
};

export const getMachineReservationsForUser = async (
  payload?: IUserMacReservationQueryParams
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
  param: IGenericQueryParam
) => {
  const res = await http.get<ResponseDataType<PaginatedData<MachineLog>, null>>(
    bs(`machines/${machineId}/logs`),
    {
      params: param,
    }
  );

  return res.data;
};

export const getCurrentMachineReservation = async (machineId: number) => {
  const res = await http.get<ResponseDataType<IMachineBookingDetails[], null>>(
    bs(`machines/${machineId}/reservations/current`)
  );

  return res.data;
};

export const getMachineSpecs = async (
  machineID: number,
  params: IGenericQueryParam
) => {
  const res = await http.get<ResponseDataType<MachineSpecs[], null>>(
    bs(`machines/${machineID}/attributes`),
    { params }
  );
  return res.data;
};
