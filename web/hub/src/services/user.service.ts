import { IUser } from "@mono/shared_ui/interfaces/user";
import {
  PaginatedData,
  ResponseDataType,
} from "@mono/shared_ui/interfaces/utils";
import http, { baseStart } from "./base";
import { UserSearchQuery } from "@/interfaces/users";
import { IAttendance } from "@/interfaces/attendance";
import paramStore from "@/store/params-store";

const { bs } = paramStore;
export const getUsersList = async (params: UserSearchQuery) => {
  const res = await http.get<ResponseDataType<PaginatedData<IUser>, null>>(
    `${baseStart}/users`,
    {
      params: params,
    }
  );
  return res.data;
};
export const createNewUser = async (payload: {
  email: string;
  first_name: string;
  last_name: string;
  lab_id: number;
  role_id: number;
}) => {
  const res = await http.post<ResponseDataType<IUser, null>>(`users`, payload);

  return res.data;
};
export const editUser = async (payload: {
  email: string;
  first_name: string;
  last_name: string;
  role_id: number;
  userIdp: string;
}) => {
  const res = await http.put<ResponseDataType<IUser, null>>(
    bs(`users/${payload.userIdp}`),
    payload
  );

  return res.data;
};
export const deleteUser = async (user_id: string) => {
  const res = await http.delete<ResponseDataType<IUser, null>>(
    bs(`users/${user_id}`)
  );

  return res.data;
};

export const getUserById = async (userId: string) => {
  const res = await http.get<ResponseDataType<IUser, null>>(`users/${userId}`);
  return res.data;
};

export const getUsersListForLab = async (params: UserSearchQuery) => {
  const res = await http.get<ResponseDataType<PaginatedData<IUser>, null>>(
    bs(`users`),
    {
      params: params,
    }
  );
  return res.data;
};
export const getLabUserById = async (userId: string) => {
  const res = await http.get<ResponseDataType<IUser, null>>(
    bs(`users/${userId}`)
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
