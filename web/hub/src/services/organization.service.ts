import { UserSearchQuery } from "@/interfaces/users";
import { IUserLab } from "@mono/shared_ui/interfaces/labs";
import { Organization } from "@mono/shared_ui/interfaces/organization";
import { OrgUser } from "@mono/shared_ui/interfaces/user";
import {
  IGenericQueryParam,
  PaginatedData,
  PaginatedDataWithLoading,
  ResponseDataType,
} from "@mono/shared_ui/interfaces/utils";
import http from "./base";
import { ISubscription } from "@mono/shared_ui/interfaces/plans";

export const fetchAllOrganization = async (param: IGenericQueryParam) => {
  const res = await http.get<
    ResponseDataType<PaginatedDataWithLoading<Organization>, null>
  >(`super-admin/organisations`, { params: param });
  return res.data;
};
export const fetchAllOrganizationById = async (orgId: number) => {
  const res = await http.get<ResponseDataType<Organization, null>>(
    `super-admin/organisations/${orgId}`
  );
  return res.data;
};

export const getOrganizationUsersList = async (
  orgId: number,
  params: UserSearchQuery
) => {
  const res = await http.get<ResponseDataType<PaginatedData<OrgUser>, null>>(
    `super-admin/${orgId}/users`,
    {
      params: params,
    }
  );
  return res.data;
};

export const getOrgUsersLabsList = async (orgId: number, userId: string) => {
  const res = await http.get<ResponseDataType<IUserLab[], null>>(
    `super-admin/${orgId}/users/${userId}/labs`
  );
  return res.data;
};

export const deleteUserFromOrganization = async (
  orgId: number,
  userId: string
) => {
  const res = await http.delete<ResponseDataType<any, null>>(
    `organisations/${orgId}/users/${userId}`
  );
  return res.data;
};

export const checkOrgAvailability = async (orgName: string) => {
  const res = await http.get<ResponseDataType<{ exists: boolean }, null>>(
    `organisations/${orgName}/exists`
  );
  return res.data;
};

export const createOrganization = async (payload: Partial<Organization>) => {
  const res = await http.post<ResponseDataType<Organization, null>>(
    `organisations`,
    payload
  );
  return res.data;
};
export const editOrganization = async (payload: {
  description: string;
  name: string;
  id: number;
}) => {
  const res = await http.put<ResponseDataType<Organization, null>>(
    `organisations/${payload.id}`,
    payload
  );
  return res.data;
};

export const getMySubscriptions = async (orgId: number) => {
  const res = await http.get<ResponseDataType<ISubscription[], null>>(
    `super-admin/organisations/${orgId}/subscriptions`
  );
  return res.data;
};
