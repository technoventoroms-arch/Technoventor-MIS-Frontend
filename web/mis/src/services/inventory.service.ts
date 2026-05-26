import {
  ICreateInvItem,
  IInvntoryItem,
  IItemLogs,
  InvItemSpecs,
  IUnit,
} from "@/interfaces/inventory";
import { ProjectSearchQuery } from "@/interfaces/projects";

import {
  IGenericQueryParam,
  PaginatedData,
  ResponseDataType,
} from "@mono/shared_ui/interfaces/utils";

import { ICategory } from "@mono/shared_ui/interfaces/category";
import http from "./base";
import paramStore from "@/store/params-store";

const { bs } = paramStore;

export const getInventoryList = async (param: ProjectSearchQuery) => {
  const res = await http.get<
    ResponseDataType<PaginatedData<IInvntoryItem>, null>
  >(bs(`inventory/items`), {
    params: param,
  });

  return res.data;
};

export const getInventoryById = async (itemId: number) => {
  const res = await http.get<ResponseDataType<IInvntoryItem, null>>(
    bs(`inventory/items/${itemId}`)
  );

  return res.data;
};
export const createNewInvItem = async (data: any) => {
  const res = await http.post<ResponseDataType<IInvntoryItem, null>>(
    bs(`inventory/items`),
    data
  );
  return res.data;
};
export const editInvItem = async (projectId: number, data: ICreateInvItem) => {
  const res = await http.put<ResponseDataType<IInvntoryItem, null>>(
    bs(`inventory/items/${projectId}`),
    data
  );
  return res.data;
};

export const createNewCategory = async (payload: {
  name: string;
  parent_id: number;
}) => {
  const res = await http.post<ResponseDataType<ICategory, null>>(
    bs(`inventory/items/categories`),
    payload
  );
  return res.data;
};
export const getInvCategories = async (params: IGenericQueryParam) => {
  const res = await http.get<ResponseDataType<PaginatedData<ICategory>, null>>(
    bs(`inventory/items/categories`),
    { params }
  );
  return res.data;
};
export const deleteInvItem = async (itemId: number) => {
  const res = await http.delete<
    ResponseDataType<PaginatedData<ICategory>, null>
  >(bs(`inventory/items/${itemId}`));
  return res.data;
};
export const deleteCategory = async (itemId: number) => {
  const res = await http.delete<
    ResponseDataType<PaginatedData<ICategory>, null>
  >(bs(`inventory/items/categories/${itemId}`));
  return res.data;
};

export const getInvSpecs = async (
  itemId: number,
  params: IGenericQueryParam
) => {
  const res = await http.get<ResponseDataType<InvItemSpecs[], null>>(
    bs(`inventory/items/${itemId}/attributes`),
    { params }
  );
  return res.data;
};
export const deleteInvSpecs = async (itemId: number, specsId: number) => {
  const res = await http.delete<ResponseDataType<null, null>>(
    bs(`inventory/items/${itemId}/attributes/${specsId}`)
  );
  return res.data;
};

export const createInvSpecs = async (itemId: number, data: any) => {
  const res = await http.post<ResponseDataType<InvItemSpecs, null>>(
    bs(`inventory/items/${itemId}/attributes`),
    data
  );
  return res.data;
};

export const getInvItemLogs = async (
  itemId: number,
  params: IGenericQueryParam
) => {
  const res = await http.get<ResponseDataType<PaginatedData<IItemLogs>, null>>(
    bs(`inventory/items/${itemId}/events`),
    { params }
  );
  return res.data;
};

export const getInvUnits = async (params: { searchQuery?: string }) => {
  const res = await http.get<ResponseDataType<IUnit, null>>(
    bs(`inventory/items/units`),
    { params }
  );
  return res.data;
};
export const deleteInvUnits = async (itemId: number) => {
  const res = await http.delete<
    ResponseDataType<PaginatedData<ICategory>, null>
  >(bs(`inventory/items/units/${itemId}`));
  return res.data;
};

export const addNewUnit = async (payload: IUnit) => {
  const res = await http.post<ResponseDataType<IUnit, null>>(
    bs(`inventory/items/units`),
    payload
  );
  return res.data;
};
