import {
  IGenericQueryParam,
  PaginatedData,
  PaginatedDataWithLoading,
  ResponseDataType,
} from "@mono/shared_ui/interfaces/utils";
import http from "./base";
import { IAvailableLab, ILabJoinRequest, ILabType } from "@/interfaces/labs";
import paramStore from "@/store/params-store";
const { bs } = paramStore;
export const getLabById = async (orgId: number, labId: number) => {
  const res = await http.get<ResponseDataType<ILabType, null>>(
    `${orgId}/labs/${labId}`,
  );
  return res.data;
};

export const editLab = async (lab_id: number, data: ILabType) => {
  const res = await http.put<ResponseDataType<ILabType, null>>(
    `labs/${lab_id}`,
    data,
  );
  return res.data;
};
export const createNewLab = async (org_id: number, data: Partial<ILabType>) => {
  const res = await http.post<ResponseDataType<ILabType, null>>(
    `${org_id}/labs`,
    data,
  );
  return res.data;
};

export const getAllLabs = async (
  orgId: number,
  params?: IGenericQueryParam,
) => {
  const res = await http.get<
    ResponseDataType<PaginatedDataWithLoading<ILabType>, null>
  >(`${orgId}/labs`, {
    params: params,
  });
  return res.data;
};
export const deactivateLabs = async (
  orgId: number,
  labId: number,
  token: string,
) => {
  const res = await http.put<ResponseDataType<any, null>>(
    `${orgId}/labs/${labId}/inactive`,
    {},
    {
      headers: {
        "X-OTP-Verification-Token": token,
      },
    },
  );
  return res.data;
};
export const activateLab = async (orgId: number, labId: number) => {
  const res = await http.put<ResponseDataType<any, null>>(
    `${orgId}/labs/${labId}/active`,
  );
  return res.data;
};
export const getLabPermissions = async (orgId: number, labId: number) => {
  const res = await http.get<
    ResponseDataType<
      {
        id: number;
        permission_name: string;
        permission_description: string;
      }[],
      null
    >
  >(`${orgId}/${labId}/permissions`);
  return res.data;
};

export const regenerateLabApiKey = async (orgId: number, labId: number) => {
  const res = await http.post<ResponseDataType<ILabType, null>>(
    `${orgId}/labs/${labId}/regenerate-api-key`,
  );
  return res.data;
};
export const fetchAllNotJoinedLabs = async (params: IGenericQueryParam) => {
  const res = await http.get<
    ResponseDataType<PaginatedData<IAvailableLab>, null>
  >(`labs/available`, {
    params: params,
  });
  return res.data;
};
export const requestLabToJoin = async (org_id: number, lab_id: number) => {
  const res = await http.post<ResponseDataType<IAvailableLab, null>>(
    `join-requests/add`,
    {
      lab_id: lab_id,
      organisation_id: org_id,
    },
  );
  return res.data;
};
export const getLabJoinRequestLab = async (prams: IGenericQueryParam) => {
  const res = await http.get<
    ResponseDataType<PaginatedData<ILabJoinRequest>, null>
  >(bs(`join-requests`), {
    params: prams,
  });
  return res.data;
};
export const approveLabJoinRequestLab = async (req_id: number) => {
  const res = await http.put<ResponseDataType<IAvailableLab, null>>(
    bs(`join-requests/${req_id}/approve`),
  );
  return res.data;
};

export const rejectLabJoinRequestLab = async (req_id: number) => {
  const res = await http.put<ResponseDataType<IAvailableLab, null>>(
    bs(`join-requests/${req_id}/reject`),
  );
  return res.data;
};
export const removeUserFromLab = async (
  orgId: number,
  labId: number,
  userId: string,
) => {
  const res = await http.delete<ResponseDataType<any, null>>(
    `/${orgId}/labs/${labId}/users/${userId}`,
  );
  return res.data;
};
