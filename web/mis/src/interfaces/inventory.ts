import { ICategory } from "@mono/shared_ui/interfaces/category";

export type ItemType = "REUSABLE" | "CONSUMABLE";
export interface IUnit {
  id?: number;
  name: string;
  symbol: string;
}
export interface IInvntoryItem {
  id: number;
  name: string;
  sku: string;
  description: string;
  image_link: string;
  category: ICategory;
  type: "REUSABLE" | "CONSUMABLE"; // Assuming these are the only two types
  unit: IUnit;
  quantity: number; // If numeric, change to number
  threshold: number; // If numeric, change to number
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export type InventorySearchQuery = {
  skip?: number;
  take?: number;
  searchQuery?: string;
  lab_id: number;
};

export interface ICreateInvItem {
  category_id: number;
  description: string;
  name: string;
  sku: string;
  type: ItemType;
  unit_id: number;
  quantity: number; // If numeric, change to number
  threshold: number; // If numeric, change to number
  image_link: string;
}

export type InvItemSpecs = {
  id: number;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
};
export type IItemLogs = {
  id: number;
  type: string; // assuming only "IN" and "OUT" are valid types
  quantity: string; // or number, if it's always numeric and should be treated as such
  note: string;
  reference: string;
  created_at: string; // or Date if you prefer to parse it
};
