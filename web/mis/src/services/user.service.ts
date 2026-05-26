import { IOrderLog } from "@/interfaces/order";
import { UserSearchQuery } from "@/interfaces/users";
import { IUser, UserInvitation } from "@mono/shared_ui/interfaces/user";
import {
  IGenericQueryParam,
  PaginatedData,
  ResponseDataType,
} from "@mono/shared_ui/interfaces/utils";
import http from "./base";
import { IAttendance, IAttendanceStatus } from "@/interfaces/attendance";
import paramStore from "@/store/params-store";
import { IUserLab } from "@mono/shared_ui/interfaces/labs";
const { bs } = paramStore;
export const getUsersList = async (
  labId: number,
  orgId: number,
  params: UserSearchQuery,
) => {
  const res = await http.get<ResponseDataType<PaginatedData<IUser>, null>>(
    `${orgId}/labs/${labId}/users`,
    {
      params: params,
    },
  );
  return res.data;
};
export const getPendingUserInvite = async (
  labId: number,
  orgId: number,
  params: IGenericQueryParam,
) => {
  const res = await http.get<ResponseDataType<PaginatedData<IUser>, null>>(
    `${orgId}/labs/${labId}/invitations`,
    { params },
  );
  return res.data;
};

export const revokeInvitation = async (
  labId: number,
  orgId: number,
  inviteId: number,
) => {
  const res = await http.put<ResponseDataType<any, null>>(
    `${orgId}/labs/${labId}/invitations/${inviteId}/revoke`,
  );

  return res.data;
};
export const createNewUser = async (payload: {
  email: string;
  first_name: string;
  last_name: string;
  lab_id: number;
  role_id: number;
  organisation_id: number;
}) => {
  const res = await http.post<ResponseDataType<IUser, null>>(`users`, payload);

  return res.data;
};

export const getUserById = async (userId: string) => {
  const res = await http.get<ResponseDataType<IUser, null>>(`users/${userId}`);
  return res.data;
};

export const updateUserById = async (payload: IUser) => {
  const res = await http.put<ResponseDataType<IUser, null>>(
    bs(`users/${payload.user_id}`),
    payload,
  );
  return res.data;
};

export const getUserProfile = async () => {
  const res = await http.get<ResponseDataType<IUser, null>>(`users/me`);
  return res.data;
};
export const updateUserProfile = async (data: IUser) => {
  const res = await http.put<ResponseDataType<IUser, null>>(`users/me`, data);
  return res.data;
};

export const userOrderLogs = async (params?: IGenericQueryParam) => {
  const res = await http.get<ResponseDataType<PaginatedData<IOrderLog>, null>>(
    bs(`users/projects/orders`),
    { params },
  );
  return res.data;
};

export const getUsersAttendance = async (
  params: IGenericQueryParam & {
    fromDate?: Date | null;
    toDate?: Date | null;
    status?: any | null;
  },
) => {
  const res = await http.get<
    ResponseDataType<PaginatedData<IAttendance>, null>
  >(bs(`users/me/attendance`), {
    params: params,
  });
  return res.data;
};

export const getUsersCurrentAttendance = async () => {
  const res = await http.get<ResponseDataType<IAttendance | null, null>>(
    bs(`users/me/attendance/current`),
  );
  return res.data;
};

export const checkinAttendance = async (payload: {
  check_in_at: string;
  check_out_at?: string;
}) => {
  const res = await http.post<ResponseDataType<IAttendance | null, null>>(
    bs(`users/me/attendance/checkin`),
    payload,
  );
  return res.data;
};

export const checkOutAttendance = async (attendanceId: number) => {
  const res = await http.post<ResponseDataType<IAttendance | null, null>>(
    bs(`users/me/attendance/${attendanceId}/checkout`),
  );
  return res.data;
};

export const getUserAttendanceById = async (userId: string, params: any) => {
  const res = await http.get<
    ResponseDataType<PaginatedData<IAttendance>, null>
  >(bs(`users/${userId}/attendance`), {
    params: params,
  });
  return res.data;
};

export const updateAttendanceStatus = async (
  userId: string,
  attendanceId: number,
  status: IAttendanceStatus,
) => {
  const res = await http.put<ResponseDataType<IAttendance, null>>(
    bs(`users/${userId}/attendance/${attendanceId}/status`),
    {
      status: status,
    },
  );
  return res.data;
};

export const regularizeAttendance = async (payload: {
  check_in_at: string;
  check_out_at: string;
  attendanceId: number;
}) => {
  const res = await http.put<ResponseDataType<IAttendance, null>>(
    bs(`users/me/attendance/${payload.attendanceId}`),
    payload,
  );
  return res.data;
};
export const addNewAttendance = async (payload: {
  check_in_at: string;
  check_out_at: string;
  userId: string;
}) => {
  const res = await http.post<ResponseDataType<IAttendance, null>>(
    bs(`users/${payload.userId}/checkin`),
    payload,
  );
  return res.data;
};

export const checkEmail = async (email: string) => {
  const res = await http.get<ResponseDataType<any, null>>(
    `users/${email}/exists`,
  );
  return res.data;
};
export const getMyInvites = async () => {
  const res =
    await http.get<ResponseDataType<UserInvitation[], null>>(
      `users/me/invitations`,
    );
  return res.data;
};

export const assignLabToUser = async ({
  labId,
  orgId,
  userId,
  roleId,
}: {
  orgId: number;
  labId: number;
  userId: string;
  roleId: number;
}) => {
  const res = await http.post<ResponseDataType<IAttendance, null>>(
    `${orgId}/labs/${labId}/users`,
    {
      role_id: roleId,
      target_user_identity_id: userId,
    },
  );
  return res.data;
};
export const getUnassignedLabs = async ({
  orgId,
  userId,
}: {
  orgId: number;

  userId: string;
}) => {
  const res = await http.get<ResponseDataType<IUserLab, null>>(
    `${orgId}/labs/users/${userId}/labs-to-assign`,
  );
  return res.data;
};
export const acceptInvite = async (inviteId: number, payload: any) => {
  const res = await http.put<ResponseDataType<any, null>>(
    `users/me/invitations/${inviteId}`,
    payload,
  );
  return res.data;
};

export const registerAccount = async (payload: {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
}) => {
  const res = await http.post<ResponseDataType<any, null>>(
    `users/register`,
    payload,
  );
  return res.data;
};

export const verifyEmail = async (token: string) => {
  const res = await http.post<ResponseDataType<any, null>>(
    `users/me/verify-email`,
    {},
    {
      headers: {
        ...http.defaults.headers.common,
        ...http.defaults.headers.post,
        "X-OTP-Verification-Token": token,
      } as any,
    },
  );
  return res.data;
};

export const changeLabAdmin = async (
  orgId: number,
  userId: string,
  labId: number,
  token: string,
) => {
  const res = await http.put<ResponseDataType<IUser, null>>(
    `/${orgId}/${labId}/users/${userId}/labs/${labId}/admin`,
    {},
    {
      headers: {
        ...http.defaults.headers.common,
        ...http.defaults.headers.post,
        "X-OTP-Verification-Token": token,
      } as any,
    },
  );
  return res.data;
};

export const getCardRFID = async (payload: {
  orgId: number;
  labId: number;
  userId: string;
}) => {
  const res = await http.get<ResponseDataType<{ rfid: string }, null>>(
    `${payload.orgId}/labs/${payload.labId}/users/${payload.userId}/rfid`,
  );
  return res.data;
};
export const updateCardRFID = async (payload: {
  orgId: number;
  labId: number;
  userId: string;
  rfid: string;
}) => {
  const res = await http.post<
    ResponseDataType<
      {
        rfid: string;
      },
      null
    >
  >(
    `${payload.orgId}/labs/${payload.labId}/users/${payload.userId}/rfid`,
    payload,
  );
  return res.data;
};
export const deleteCardRFID = async (payload: {
  orgId: number;
  labId: number;
  userId: string;
}) => {
  const res = await http.delete(
    `${payload.orgId}/labs/${payload.labId}/users/${payload.userId}/rfid`,
  );
  return res.data;
};
