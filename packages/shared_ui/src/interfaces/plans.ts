export interface Entitlement {
  resource_type: "LAB" | "USER" | "MACHINE" | "PROJECT"; // extendable if more resource types exist
  quantity: number;
  id?: number;
}
export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  provider_plan_id: string;
  period: "monthly" | "yearly" | string;
  interval: number;
  amount: number;
  currency: string;
  provider: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  entitlements: Entitlement[];
}

export type ISubscription = {
  id: number;
  plan_name: string;
  status: string;
  provider_subscription_id: string;
  provider: string;
  start_at: string; // ISO datetime string
  end_at: string; // ISO datetime string
  next_billing_at: string; // ISO datetime string
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
};

export interface ActiveSubscription {
  id: number;
  plan_name: string;
  status: "ACTIVE" | "INACTIVE" | "CANCELLED" | string;
  provider_subscription_id: string;
  provider: "razorpay" | string;
  start_at: string; // ISO timestamp
  end_at: string; // ISO timestamp
  quota_usage: QuotaUsage[];
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  next_billing_at: string;
}

export interface QuotaUsage {
  resource_type: "LAB" | "USER" | string;
  allowed_quantity: number;
  used_quantity: number;
  remaining_quantity: number;
}
