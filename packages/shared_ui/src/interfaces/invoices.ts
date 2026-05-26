export interface BasePayment {
  id: number;
  invoice_id: number;
  provider_payment_id: string;
  method: "card" | "upi" | "netbanking" | "wallet" | string;
  status: "captured" | "failed" | "pending" | string;
  amount: number; // in smallest currency unit (e.g., paise for INR)
  currency: string; // e.g. "INR"
  fee: number;
  tax: number;
  description: string;
  international: boolean;
  contact?: string;
  email?: string;
  created_at: string; // ISO timestamp
  captured_at: string; // ISO timestamp
  inserted_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// Card payment
export interface CardPayment extends BasePayment {
  method: "card";
  card_last4: string;
  card_network: string;
  card_type: "debit" | "credit" | string;
}

// UPI payment
export interface UpiPayment extends BasePayment {
  method: "upi";
  vpa: string;
}

// Union type for any payment
export type Payment = CardPayment | UpiPayment;

export interface IInvoice {
  id: number;
  provider_invoice_id: string;
  provider_order_id: string;
  status: "paid" | "unpaid" | "pending" | "failed" | string;
  amount: number;
  currency: string;
  issued_at: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  payments: Payment[];
}
