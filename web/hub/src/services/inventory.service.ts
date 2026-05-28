import {
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
export const getInvCategories = async (params: IGenericQueryParam) => {
  const res = await http.get<ResponseDataType<PaginatedData<ICategory>, null>>(
    bs(`inventory/items/categories`),
    { params }
  );
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
