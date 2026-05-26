import { ResponseDataType } from "@mono/shared_ui/interfaces/utils";
import http from "./base";
import { OtpVerificationResponse } from "@mono/shared_ui/interfaces/otp";

export const sendOTP = async (payload: {
  action_type: string;
  reference_id?: 0;
}) => {
  const res = await http.post<ResponseDataType<any, null>>(
    `otp/request`,
    payload
  );
  return res.data;
};
export const verifyOTP = async (payload: {
  action_type: string;
  otp_code: string;
}) => {
  const res = await http.post<ResponseDataType<OtpVerificationResponse, null>>(
    `otp/verify`,
    payload
  );
  return res.data;
};
