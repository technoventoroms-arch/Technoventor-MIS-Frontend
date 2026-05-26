import { ICheckInRecords } from "@/interfaces/attendance";
import { IAdminOrderLog } from "@/interfaces/order";
import {
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
export const adminOrderLogs = async (params?: IGenericQueryParam) => {
  const res = await http.get<
    ResponseDataType<PaginatedData<IAdminOrderLog>, null>
  >(bs(`users/me/pending-approvals/project-orders`), { params });
  return res.data;
};

export const getMachineReservationsForAdmin = async (
  payload?: IUserMacReservationQueryParams
) => {
  const res = await http.get<
    ResponseDataType<PaginatedData<MachineBookingSummary>, null>
  >(bs(`users/me/pending-approvals/machine-reservations`), { params: payload });
  return res.data;
};

export const getAdminAttendance = async (params?: any) => {
  const res = await http.get<
    ResponseDataType<PaginatedData<ICheckInRecords>, null>
  >(bs(`users/me/pending-approvals/user-attendances`), {
    params: params,
  });
  return res.data;
};
export const inviteUsers = async (
  orgId: number,
  labId: number,
  payload: {
    users: {
      email: string;
      role_id: number;
    }[];
  }
) => {
  const res = await http.post<ResponseDataType<PaginatedData<any>, null>>(
    `${orgId}/labs/${labId}/invite`,
    payload
  );
  return res.data;
};
