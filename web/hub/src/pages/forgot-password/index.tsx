import { routeConstants } from "@/constants/route.constants";
import { zodResolver } from "@hookform/resolvers/zod";
import ControlledFormInput from "@mono/shared_ui/components/controlled-form-component/c-form-input";
import { Button } from "@mono/shared_ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@mono/shared_ui/components/ui/card";
import { Form } from "@mono/shared_ui/components/ui/form";
import { cn, getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { Loader } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { sendPasswordResetEmail } from "supertokens-web-js/recipe/emailpassword";
import { z } from "zod";

const forgotPassSchema = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .min(1, "Email is required."),
});
const ForgotPassword = () => {
  const form = useForm({
    defaultValues: { email: "" },
    resolver: zodResolver(forgotPassSchema),
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async ({ email }: any) => {
    setLoading(true);
    try {
      const res = await sendPasswordResetEmail({
        formFields: [{ id: "email", value: email }],
      });

      if (res.status === "OK") {
        navigate(`/${routeConstants.LOGIN}`);
        toast.success("Reset link sent. Check your inbox.");
      } else {
        toast.error("Could not send reset link.");
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
              <CardTitle className="text-2xl">Forgot Password</CardTitle>
              <CardDescription>
                Enter your email below to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <ControlledFormInput
                        name="email"
                        label="Email"
                        control={form.control}
                        placeholder="Engineer@123"
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

export default ForgotPassword;
