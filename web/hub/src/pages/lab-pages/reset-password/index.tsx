import { routeConstants } from "@/constants/route.constants";
import { zodResolver } from "@hookform/resolvers/zod";
import ControlledFormInput from "@mono/shared_ui/components/controlled-form-component/c-form-input";
import { Button } from "@mono/shared_ui/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@mono/shared_ui/components/ui/card";
import { Form } from "@mono/shared_ui/components/ui/form";
import { cn, getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { Eye, EyeOff, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  getResetPasswordTokenFromURL,
  submitNewPassword,
} from "supertokens-web-js/recipe/emailpassword";
import { z } from "zod";

const resetPassSchema = z
  .object({
    password: z
      .string({ required_error: "Password is required." })
      .min(1, "Password is required."),
    confirmPassword: z
      .string({ required_error: "Please confirm your password." })
      .min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const ResetPassword = () => {
  const [isView, setIsView] = useState(false);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const form = useForm({
    defaultValues: { password: "", confirmPassword: "" },
    resolver: zodResolver(resetPassSchema),
  });
  useEffect(() => {
    const urlToken = getResetPasswordTokenFromURL();
    setToken(urlToken);
  }, []);

  const handleSubmit = async (e: any) => {
    setLoading(true);
    try {
      const res = await submitNewPassword({
        formFields: [
          { id: "password", value: e.password },
          { id: "token", value: token },
        ],
      });

      if (res.status === "OK") {
        toast.success("Password reset successful. You can now log in.");
        navigate(`/${routeConstants.LOGIN}`);
        ("Reset link sent. Check your inbox.");
      } else if (res.status === "RESET_PASSWORD_INVALID_TOKEN_ERROR") {
        toast.error("Invalid or expired token.");
      } else if (res.status === "FIELD_ERROR") {
        toast.error(res.formFields[0].error);
      } else {
        toast.error("Something went wrong.");
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className={cn("flex flex-col gap-6")}>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Reset Your Password</CardTitle>
              <CardDescription>
                Enter your new password below to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                  <div className="flex flex-col gap-6">
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <ControlledFormInput
                          name="password"
                          label="Password"
                          control={form.control}
                          placeholder="Engineer@123"
                          type={isView ? "text" : "password"}
                        />
                      </div>
                      {isView ? (
                        <Eye
                          className="z-10 mb-1 cursor-pointer text-gray-500"
                          onClick={() => {
                            setIsView(!isView);
                          }}
                        />
                      ) : (
                        <EyeOff
                          className=" z-10 mb-1 cursor-pointer text-gray-500"
                          onClick={() => setIsView(!isView)}
                        />
                      )}
                    </div>
                    <div className="grid gap-2">
                      <ControlledFormInput
                        name="confirmPassword"
                        label="Confirm Password"
                        control={form.control}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? <Loader className="animate-spin" /> : null}
                      <span className="ml-2">Reset</span>
                    </Button>
                  </div>
                  <div className="mt-4 text-center text-sm">
                    Back to{" "}
                    <a href="/" className="underline underline-offset-4">
                      Login
                    </a>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
