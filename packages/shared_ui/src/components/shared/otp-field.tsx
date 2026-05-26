import { CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "../ui/input-otp";

type OTPFieldProps = {
  handleOnComplete: (...args: number[]) => void;
  disabled?: boolean;
  resendOtp: () => void;
  defaultDuration?: number;
  verified?: boolean;
};
export function OTPField({
  handleOnComplete,
  disabled = false,
  resendOtp,
  defaultDuration = 30,
  verified,
}: OTPFieldProps) {
  return (
    <div>
      <InputOTP maxLength={6} disabled={disabled} onComplete={handleOnComplete}>
        <InputOTPGroup>
          <InputOTPSlot index={0} autoFocus />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <div className="flex gap-2 mt-2 items-center">
        {verified ? (
          <>
            <CheckCircle size={18} /> Verified
          </>
        ) : (
          <ResendOtpTimer onResend={resendOtp} duration={defaultDuration} />
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";

type Props = {
  duration?: number; // duration in seconds (default 30s)
  onResend: () => void; // function to trigger when resend is clicked
};

const ResendOtpTimer = ({ duration = 30, onResend }: Props) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleResend = () => {
    setTimeLeft(duration);
    onResend();
  };

  return (
    <div className="flex gap-2 items-center">
      {timeLeft > 0 ? (
        <span className="text-gray-600">
          Resend OTP in{" "}
          <span className="font-semibold">
            {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
            {String(timeLeft % 60).padStart(2, "0")}
          </span>
        </span>
      ) : (
        <Button variant={"ghost"} onClick={handleResend}>
          Resend OTP
        </Button>
      )}
    </div>
  );
};
