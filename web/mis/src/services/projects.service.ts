import {
  IOrderLog,
  OrderApproveResponse,
  OrderItem,
  OrderStatus,
} from "@/interfaces/order";
import {
  IProject,
  IProjectMember,
  ProjectSearchQuery,
} from "@/interfaces/projects";
import { IProjectType, NewProjectType } from "@/pages/manage-projects/schema";
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

export const getProjectUsers = async (projectID: number) => {
  const res = await http.get<ResponseDataType<IProjectMember[], null>>(
    bs(`projects/${projectID}/users`)
  );
  return res.data;
};

export const getProjectById = async (projectId: number) => {
  const res = await http.get<ResponseDataType<IProject, null>>(
    bs(`projects/${projectId}`)
  );

  return res.data;
};
export const createNewProject = async (
  data: NewProjectType & { owner_id: number }
) => {
  const res = await http.post<ResponseDataType<IProjectsGetAll, null>>(
    bs(`projects`),
    data
  );
  return res.data;
};
export const editProject = async (projectId: number, data: IProjectType) => {
  const res = await http.put<ResponseDataType<IProjectsGetAll, null>>(
    bs(`projects/${projectId}`),
    data
  );
  return res.data;
};
export const deleteProject = async (projectId: number) => {
  const res = await http.delete<ResponseDataType<null, null>>(
    bs(`projects/${projectId}`)
  );
  return res.data;
};
export const addUserToProject = async (
  projectId: number,
  idpUserId: string
) => {
  const res = await http.post<ResponseDataType<any, null>>(
    bs(`projects/${projectId}/assign-user/${idpUserId}`)
  );
  return res.data;
};
export const removeUserFromProject = async (
  projectId: number,
  idpUserId: string
) => {
  const res = await http.post<ResponseDataType<any, null>>(
    bs(`projects/${projectId}/remove-user/${idpUserId}`)
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
export const approveProjectOrderLogs = async (
  project_id: number,
  order_id: number
) => {
  const res = await http.post<ResponseDataType<OrderApproveResponse, null>>(
    bs(`projects/${project_id}/orders/${order_id}/approve`)
  );
  return res.data;
};
export const returnInventoryItem = async (
  project_id: number,
  order_id: number,
  payload: any
) => {
  const res = await http.post<ResponseDataType<OrderApproveResponse, null>>(
    bs(`projects/${project_id}/orders/${order_id}/return`),
    payload
  );
  return res.data;
};

export const getUnassignedUsersForProject = async (
  projectID: number,
  searchQuery?: string
) => {
  const res = await http.get<ResponseDataType<IProjectMember[], null>>(
    bs(`projects/${projectID}/users-to-assign`),
    {
      params: {
        searchQuery,
      },
    }
  );
  return res.data;
};

export const makeProjectOwner = async (projectID: number, userId: string) => {
  const res = await http.post<ResponseDataType<IProjectMember[], null>>(
    bs(`projects/${projectID}/users/${userId}/admin`)
  );
  return res.data;
};

export const updateOrderStatus = async (
  project_id: number,
  order_id: number,
  status: OrderStatus
) => {
  const res = await http.post<ResponseDataType<OrderApproveResponse, null>>(
    bs(`projects/${project_id}/orders/${order_id}/status/${status}`)
  );
  return res.data;
};
export const updateProjectStatus = async (
  project_id: number,
  isComplete: boolean
) => {
  const res = await http.post<ResponseDataType<IProject, null>>(
    bs(`projects/${project_id}/toggle-state`),
    {
      state: isComplete ? "COMPLETE" : "INCOMPLETE",
    }
  );
  return res.data;
};

export const projectRecentActivity = async (project_id: number) => {
  const res = await http.get<ResponseDataType<ProjectEvent[], null>>(
    bs(`projects/${project_id}/activity`)
  );
  return res.data;
};
