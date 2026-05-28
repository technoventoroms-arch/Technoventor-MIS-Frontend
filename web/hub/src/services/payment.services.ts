import { ResponseDataType } from "@mono/shared_ui/interfaces/utils";
import http from "./base";
import {
  ActiveSubscription,
  ISubscription,
  SubscriptionPlan,
} from "@mono/shared_ui/interfaces/plans";
import { IInvoice } from "@mono/shared_ui/interfaces/invoices";

export const getSubscriptionPlans = async () => {
  const res = await http.get<ResponseDataType<SubscriptionPlan[], null>>(
    `super-admin/plans/all`
  );
  return res.data;
};
export const getSubscriptionData = async (
  orgId: number,
  payload: { plan_id: number }
) => {
  const res = await http.post<ResponseDataType<ISubscription, null>>(
    `super-admin/organisations/${orgId}/subscriptions`,
    payload
  );
  return res.data;
};
export const getSubscriptionInvoices = async (orgId: number, subId: number) => {
  const res = await http.get<ResponseDataType<IInvoice[], null>>(
    `super-admin/organisations/${orgId}/subscriptions/${subId}/invoices`
  );
  return res.data;
};
export const cancelSubscription = async (orgId: number, subId: number) => {
  const res = await http.delete<ResponseDataType<ISubscription, null>>(
    `super-admin/organisations/${orgId}/subscriptions/${subId}`
  );
  return res.data;
};
export const getActiveSubscription = async (orgId: number) => {
  const res = await http.get<ResponseDataType<ActiveSubscription, null>>(
    `super-admin/organisations/${orgId}/subscriptions/active`
  );
  return res.data;
};
export const updateSubscription = async (
  orgId: number,
  subId: number,
  payload: { plan_id: number }
) => {
  const res = await http.put<ResponseDataType<ISubscription, null>>(
    `organisations/${orgId}/subscriptions/${subId}`,
    payload
  );
  return res.data;
};

export const createSubscriptionPlans = async (payload: any) => {
  const res = await http.post<ResponseDataType<SubscriptionPlan, null>>(
    `super-admin/plans`,
    payload
  );
  return res.data;
};
export const editSubscriptionPlans = async (planId: number, payload: any) => {
  const res = await http.put<ResponseDataType<SubscriptionPlan, null>>(
    `super-admin/plans/${planId}`,
    payload
  );
  return res.data;
};
export const deleteSubscriptionPlans = async (
  planId: number,
  token: string
) => {
  const res = await http.delete<ResponseDataType<SubscriptionPlan, null>>(
    `super-admin/plans/${planId}`,
    {
      headers: {
        "X-OTP-Verification-Token": token,
      },
    }
  );
  return res.data;
};
export const editEntitlementPlans = async (payload: any) => {
  const res = await http.post<ResponseDataType<SubscriptionPlan, null>>(
    `super-admin/plans`,
    payload
  );
  return res.data;
};
