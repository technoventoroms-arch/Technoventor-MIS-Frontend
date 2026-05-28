import { NewLabType } from "@/pages/manage-labs/schema";
import {
  IGenericQueryParam,
  PaginatedData,
  PaginatedDataWithLoading,
  ResponseDataType,
} from "@mono/shared_ui/interfaces/utils";
import http, { baseStart } from "./base";
import { ILabType, LabSearchQuery } from "@/interfaces/labs";

export const getLabsList = async (param: LabSearchQuery) => {
  const res = await http.get<ResponseDataType<PaginatedData<ILabType>, null>>(
    `labs`,
    {
      params: param,
    }
  );
  return res.data;
};

export const getLabById = async (labId: number, orgId: number) => {
  const res = await http.get<ResponseDataType<ILabType, null>>(
    `super-admin/${orgId}/labs/${labId}`
  );

  return res.data;
};
export const createNewLab = async (data: NewLabType) => {
  const res = await http.post<ResponseDataType<ILabType, null>>(
    `${baseStart}/labs`,
    data
  );
  return res.data;
};
export const editLab = async (lab_id: number, data: ILabType) => {
  const res = await http.put<ResponseDataType<ILabType, null>>(
    `labs/${lab_id}`,
    data
  );
  return res.data;
};
export const changeLabAdmin = async (lab_id: number, userId: string) => {
  const res = await http.put<ResponseDataType<ILabType, null>>(
    `users/${userId}/labs/${lab_id}/admin`
  );
  return res.data;
};

export const getAllLabs = async (
  orgId: number,
  params?: IGenericQueryParam
) => {
  const res = await http.get<
    ResponseDataType<PaginatedDataWithLoading<ILabType>, null>
  >(`super-admin/${orgId}/labs`, {
    params: params,
  });
  return res.data;
};
