import { IInvntoryItem } from "./inventory";

export type OrderStatus =
  | "NEW"
  | "APPROVED"
  | "REJECTED"
  | "FULFILLED"
  | "PARTIALLY_FULFILLED"
  | "CANCELLED"
  | "EXPIRED";

type OrderUser = {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  role_name: string;
  identity_provider_id: string;
  image_link: string;
};
export type IOrderLog = {
  id: number;
  number: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  created_by: OrderUser;
  updated_by: OrderUser;
  project_id: number;
};
export type OrderItem = {
  id: number;
  item: IInvntoryItem;
  ordered_quantity: number;
  returned_quantity: number;
};

export type OrderApproveResponse = {
  id: number;
  number: string;
  status: OrderStatus; // You can add other possible statuses as union values
  created_at: string; // or `Date` if you parse it
  updated_at: string; // or `Date` if you parse it
};

export type IAdminOrderLog = {
  id: number;
  number: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  created_by: OrderUser;
  updated_by: OrderUser;
  project_title: string;
  project_id: number;
  project_description: string;
};
