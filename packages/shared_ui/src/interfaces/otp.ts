export type OTPActionType =
  | "VERIFY_USER_EMAIL"
  | "DELETE_ACCOUNT"
  | "DELETE_ORGANISATION"
  | "MARK_ORGANISATION_AS_INACTIVE"
  | "DELETE_LAB"
  | "MARK_LAB_AS_INACTIVE"
  | "CANCEL_SUBSCRIPTION"
  | "CHANGE_SUBSCRIPTION"
  | "DELETE_PLAN"
  | "CHANGE_PLAN"
  | "DELETE_PROJECT"
  | "CHANGE_ROLE"
  | "CHANGE_ORGANISATION_ADMIN"
  | "CHANGE_LAB_ADMIN"
  | "REMOVE_USER_FROM_ORGANISATION";
export interface OtpVerificationResponse {
  message: string;
  verification_token: string;
  verification_expiry: string; // ISO timestamp
}
