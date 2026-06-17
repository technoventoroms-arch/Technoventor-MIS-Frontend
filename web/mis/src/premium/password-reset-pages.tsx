import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MakerSpaceOpsLogo } from "@mono/shared_ui/components/premium";
import { OTPField } from "@mono/shared_ui/components/shared/otp-field";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Input } from "@mono/shared_ui/components/ui/input";
import { Label } from "@mono/shared_ui/components/ui/label";
import { apiClient, normalizeApiError } from "@mono/api_client";

type Step = "email" | "otp" | "password" | "done";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  async function handleRequestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);
    try {
      const response = await apiClient.requestPasswordReset(email);
      setInfo(response.message ?? "If an account exists for that email, a verification code has been sent.");
      setStep("otp");
    } catch (requestError) {
      setError(normalizeApiError(requestError).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp(otpValue: string) {
    const otp = String(otpValue).replace(/\D/g, "").slice(0, 6);
    if (otp.length !== 6) return;

    setError(null);
    setIsSubmitting(true);
    try {
      const response = await apiClient.verifyPasswordReset({ email, otp });
      setVerificationToken(response.verification_token);
      setOtpVerified(true);
      setInfo("Code verified. Choose a new password.");
      setStep("password");
    } catch (verifyError) {
      setOtpVerified(false);
      setError(normalizeApiError(verifyError).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendOtp() {
    setError(null);
    setInfo(null);
    setOtpVerified(false);
    try {
      const response = await apiClient.requestPasswordReset(email);
      setInfo(response.message ?? "A new verification code has been sent.");
    } catch (resendError) {
      setError(normalizeApiError(resendError).message);
    }
  }

  async function handleConfirmPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.confirmPasswordReset({
        verification_token: verificationToken,
        password,
      });
      setInfo(response.message ?? "Password updated successfully.");
      setStep("done");
    } catch (confirmError) {
      setError(normalizeApiError(confirmError).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-950">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-950/10">
        <div className="mb-8">
          <MakerSpaceOpsLogo variant="hero" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-600">Password reset</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          {step === "email" && "Forgot your password?"}
          {step === "otp" && "Enter verification code"}
          {step === "password" && "Set a new password"}
          {step === "done" && "All set"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {step === "email" && "We will email a 6-digit code to reset your password."}
          {step === "otp" && `Enter the code sent to ${email}.`}
          {step === "password" && "Choose a strong password for your account."}
          {step === "done" && "You can now sign in with your new password."}
        </p>

        {step === "email" ? (
          <form onSubmit={handleRequestOtp} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <Button className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Sending code..." : "Send verification code"}
            </Button>
          </form>
        ) : null}

        {step === "otp" ? (
          <div className="mt-8 space-y-5">
            <OTPField
              disabled={isSubmitting}
              verified={otpVerified}
              resendOtp={handleResendOtp}
              defaultDuration={60}
              handleOnComplete={(code) => {
                void handleVerifyOtp(String(code));
              }}
            />
          </div>
        ) : null}

        {step === "password" ? (
          <form onSubmit={handleConfirmPassword} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={8}
              />
            </div>
            <Button className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update password"}
            </Button>
          </form>
        ) : null}

        {step === "done" ? (
          <Button className="mt-8 w-full" size="lg" onClick={() => navigate("/login", { replace: true })}>
            Back to sign in
          </Button>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
        {info ? (
          <div className="mt-5 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
            {info}
          </div>
        ) : null}

        {step !== "done" ? (
          <p className="mt-6 text-center text-sm">
            <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-500">
              Back to sign in
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
