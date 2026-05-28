import { IProjectMember, ProjectSearchQuery } from "@/interfaces/projects";
import { IProjectType } from "@/pages/lab-pages/manage-projects/schema";
import {
  IProjectsGetAll,
  ProjectEvent,
} from "@mono/shared_ui/interfaces/projects";
import {
  IGenericQueryParam,
  PaginatedData,
  ResponseDataType,
} from "@mono/shared_ui/interfaces/utils";
import http from "./base";
import { IOrderLog, OrderItem } from "@/interfaces/order";
import paramStore from "@/store/params-store";
const { bs } = paramStore;

export const getProjectsList = async (param: ProjectSearchQuery) => {
  const res = await http.get<
    ResponseDataType<PaginatedData<IProjectsGetAll>, null>
  >(bs(`projects`), {
    params: param,
  });
  return res.data;
};

export const getProjectById = async (projectId: number) => {
  const res = await http.get<ResponseDataType<IProjectType, null>>(
    bs(`projects/${projectId}`)
  );

  return res.data;
};

export const getProjectUsers = async (projectID: number) => {
  const res = await http.get<ResponseDataType<IProjectMember[], null>>(
    bs(`projects/${projectID}/users`)
  );
  return res.data;
};

export const getProjectOrderLogs = async (
  project_id: number,
  params?: IGenericQueryParam
) => {
  const res = await http.get<ResponseDataType<PaginatedData<IOrderLog>, null>>(
    bs(`projects/${project_id}/orders`),
    {
      params,
    }
  );
  return res.data;
};
export const getProjectOrderItems = async (order_id: number) => {
  const res = await http.get<ResponseDataType<OrderItem[], null>>(
    bs(`projects/orders/${order_id}/items`)
  );
  return res.data;
};

export const projectRecentActivity = async (project_id: number) => {
  const res = await http.get<ResponseDataType<ProjectEvent[], null>>(
    bs(`projects/${project_id}/activity`)
  );
  return res.data;
};
