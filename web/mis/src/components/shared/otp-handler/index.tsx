import { sendOTP, verifyOTP } from "@/services/otp.service";
import { OTPField } from "@mono/shared_ui/components/shared/otp-field";
import { useLoading } from "@mono/shared_ui/hooks/use-loading";
import { useEffect, useState } from "react";
import {
  OTPActionType,
  OtpVerificationResponse,
} from "@mono/shared_ui/interfaces/otp";
import { toast } from "sonner";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
type Props = {
  onOTPConfirm: (data: OtpVerificationResponse) => void;
  actionType: OTPActionType;
};

const OTPHandler = ({ onOTPConfirm, actionType }: Props) => {
  const [verified, setVerified] = useState<OtpVerificationResponse | null>(
    null,
  );
  const { loading, showLoading, hideLoading } = useLoading();

  const {
    loading: sendingOTP,
    showLoading: showSendingOTPLoading,
    hideLoading: hideSendingOTPLoading,
  } = useLoading();

  const handleSendOTP = async () => {
    showSendingOTPLoading();
    try {
      const res = await sendOTP({ action_type: actionType });
      if (!res.error) {
        toast.success("OTP Send successfully. PLease check you email.");
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      hideSendingOTPLoading();
    }
  };
  const handleVerifyOTP = async (otp: string) => {
    showLoading();
    try {
      const res = await verifyOTP({ action_type: actionType, otp_code: otp });
      if (!res.error) {
        setVerified(res.data);
        onOTPConfirm(res.data);
        toast.success("OTP Verified successfully. PLease check you email.");
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      hideLoading();
    }
  };
  useEffect(() => {
    handleSendOTP();
  }, []);
  return sendingOTP ? (
    <div className="rounded p-2 animate-pulse">Sending OTP Please wait...</div>
  ) : (
    <OTPField
      handleOnComplete={(e) => handleVerifyOTP(e as any)}
      resendOtp={handleSendOTP}
      disabled={loading || !!verified}
      verified={!!verified}
    />
  );
};

export default OTPHandler;
