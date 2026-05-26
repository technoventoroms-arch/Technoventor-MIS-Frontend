import { UserSearchQuery } from "@/interfaces/users";
import { IUserLab } from "@mono/shared_ui/interfaces/labs";
import { Organization } from "@mono/shared_ui/interfaces/organization";
import { ISubscription } from "@mono/shared_ui/interfaces/plans";
import { OrgUser } from "@mono/shared_ui/interfaces/user";
import {
  PaginatedData,
  ResponseDataType,
} from "@mono/shared_ui/interfaces/utils";
import http from "./base";

export const fetchAllOrganization = async () => {
  const res =
    await http.get<ResponseDataType<Organization[], null>>(`organisations`);
  return res.data;
};

export const getOrganizationById = async (orgId: number) => {
  const res = await http.get<ResponseDataType<Organization, null>>(
    `organisations/${orgId}`,
  );
  return res.data;
};

export const deactivateOrg = async (orgId: number, token: string) => {
  const res = await http.put<ResponseDataType<Organization, null>>(
    `organisations/${orgId}`,
    {},
    {
      headers: {
        "X-OTP-Verification-Token": token,
      },
    },
  );
  return res.data;
};
export const transferOrg = async (
  orgId: number,
  userId: string,
  token: string,
) => {
  const res = await http.put<ResponseDataType<Organization, null>>(
    `organisations/${orgId}/change-admin`,
    { target_user_id: userId },
    {
      headers: {
        "X-OTP-Verification-Token": token,
      },
    },
  );
  return res.data;
};

export const getOrganizationUsersList = async (
  orgId: number,
  params: UserSearchQuery,
) => {
  const res = await http.get<ResponseDataType<PaginatedData<OrgUser>, null>>(
    `organisations/${orgId}/users`,
    {
      params: params,
    },
  );
  return res.data;
};

export const getOrgUsersLabsList = async (orgId: number, userId: string) => {
  const res = await http.get<ResponseDataType<IUserLab[], null>>(
    `organisations/${orgId}/users/${userId}/labs`,
  );
  return res.data;
};

export const deleteUserFromOrganization = async (
  orgId: number,
  userId: string,
  token: string,
) => {
  const res = await http.delete<ResponseDataType<any, null>>(
    `organisations/${orgId}/users/${userId}`,
    {
      headers: {
        "X-OTP-Verification-Token": token,
      },
    },
  );
  return res.data;
};

export const checkOrgAvailability = async (orgName: string) => {
  const res = await http.get<ResponseDataType<{ exists: boolean }, null>>(
    `organisations/${orgName}/exists`,
  );
  return res.data;
};

export const createOrganization = async (payload: Partial<Organization>) => {
  const res = await http.post<ResponseDataType<Organization, null>>(
    `organisations`,
    payload,
  );
  return res.data;
};
export const editOrganization = async (
  orgId: number,
  payload: {
    description: string;
    name: string;
    id: number;
  },
) => {
  const res = await http.put<ResponseDataType<Organization, null>>(
    `organisations/${orgId}`,
    payload,
  );
  return res.data;
};

export const getMySubscriptions = async (orgId: number) => {
  const res = await http.get<ResponseDataType<ISubscription[], null>>(
    `organisations/${orgId}/subscriptions`,
  );
  return res.data;
};
