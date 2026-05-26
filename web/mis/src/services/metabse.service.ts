import { ResponseDataType } from "@mono/shared_ui/interfaces/utils";
import http from "./base";
import paramStore from "@/store/params-store";

const { bs } = paramStore;

export const getLabDashboardUrl = async () => {
  const res = await http.get<ResponseDataType<string, null>>(
    bs(`reporting/dashboard`)
  );
  return res.data;
};
export const getOrgDashboardUrl = async (orgId: number) => {
  const res = await http.get<ResponseDataType<string, null>>(
    `${orgId}/reporting/dashboard`
  );
  return res.data;
};
