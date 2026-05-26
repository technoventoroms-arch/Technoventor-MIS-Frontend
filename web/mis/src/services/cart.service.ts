import { ResponseDataType } from "@mono/shared_ui/interfaces/utils";

import { AddItemToCartPayload, CartItem } from "@/interfaces/cart";
import http from "./base";
import paramStore from "@/store/params-store";
const { bs } = paramStore;
export const getCart = async () => {
  const res = await http.get<ResponseDataType<CartItem[], null>>(bs(`cart`));
  return res.data;
};
export const addItemToCart = async (payload: AddItemToCartPayload) => {
  const res = await http.post<ResponseDataType<string, null>>(
    bs(`cart`),
    payload
  );
  return res.data;
};
export const updateItemInCartQty = async (
  payload: AddItemToCartPayload["payload"][0]
) => {
  const res = await http.put<ResponseDataType<string, null>>(
    bs(`cart`),
    payload
  );
  return res.data;
};
export const removeItemFromCart = async (id: number) => {
  const res = await http.delete<ResponseDataType<string, null>>(
    bs(`cart/${id}`)
  );
  return res.data;
};

export const checkoutCart = async (payload: { project_id: number }) => {
  const res = await http.post<ResponseDataType<string, null>>(
    bs(`cart/checkout`),
    payload
  );
  return res.data;
};
