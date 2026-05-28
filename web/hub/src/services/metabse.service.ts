import { ResponseDataType } from "@mono/shared_ui/interfaces/utils";
import http from "./base";
import paramStore from "@/store/params-store";

const { getParams } = paramStore;
export const getLabDashboardUrl = async () => {
  const { labId, orgId } = getParams();
  const res = await http.get<ResponseDataType<string, null>>(
    `super-admin/${orgId}/${labId}/reporting/dashboard`
  );
  return res.data;
};
export const getSuperDashboardUrl = async () => {
  const res = await http.get<ResponseDataType<string, null>>(
    `super-admin/reporting/dashboard`
  );
  return res.data;
};

export const getOrgDashboardUrl = async (orgId: number) => {
  const res = await http.get<ResponseDataType<string, null>>(
    `super-admin/${orgId}/reporting/dashboard`
  );
  return res.data;
};
