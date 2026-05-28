import { ICategory } from "@mono/shared_ui/interfaces/category";
import { IUnit } from "./inventory";

export type AddItemToCartPayload = {
  payload: {
    cart_quantity: number;
    item_id: number;
  }[];
};
export type CartItem = {
  id: number;
  cart_quantity: number;
  quantity: number;
  name: string;
  sku: string;
  unit: IUnit;
  threshold: number;
  description: string;
  category: ICategory;
  type: string;
  returnDate?: Date;
  image_link?: string;
};
