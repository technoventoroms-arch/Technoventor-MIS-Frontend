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
import { cn } from "@mono/shared_ui/lib/utils";
import { Eye, EyeOff, Loader } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { signIn } from "supertokens-web-js/recipe/emailpassword";
import { z } from "zod";

const loginSchema = z.object({
  username: z
    .string({ required_error: "Username is required." })
    .min(1, "Username is required."),
  password: z
    .string({ required_error: "Password is required." })
    .min(1, "Password is required."),
});
const Login = () => {
  const form = useForm({
    defaultValues: { username: "", password: "" },
    resolver: zodResolver(loginSchema),
  });
  const [isView, setIsView] = useState(false);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  async function signInClicked({
    password,
    username,
  }: {
    username: string;
    password: string;
  }) {
    setLoading(true);
    try {
      const response = await signIn({
        formFields: [
          {
            id: "email",
            value: username,
          },
          {
            id: "password",
            value: password,
          },
        ],
      });

      if (response.status === "FIELD_ERROR") {
        response.formFields.forEach((formField) => {
          if (formField.id === "email") {
            // Email validation failed (for example incorrect email syntax).
            toast.error(formField.error);
          }
        });
      } else if (response.status === "WRONG_CREDENTIALS_ERROR") {
        toast.error("Username password combination is incorrect.");
      } else if (response.status === "SIGN_IN_NOT_ALLOWED") {
        // the reason string is a user friendly message
        // about what went wrong. It can also contain a support code which users
        // can tell you so you know why their sign in was not allowed.
        toast.error(response.reason);
      } else {
        // sign in successful. The session tokens are automatically handled by
        // the frontend SDK.
        navigate(`/`);
      }
    } catch (err: any) {
      if (err.isSuperTokensGeneralError === true) {
        // this may be a custom error message sent from the API by you.
        toast.error(err.message);
      } else {
        toast.error("Oops! Something went wrong.");
      }
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className={cn("flex flex-col gap-6")}>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(signInClicked)}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <ControlledFormInput
                        name="username"
                        label="Username"
                        control={form.control}
                        placeholder="Engineer@123"
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <ControlledFormInput
                            name="password"
                            label="Password"
                            control={form.control}
                            placeholder="Engineer123@mail.com"
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
                      <div className="flex items-center">
                        <a
                          href="#"
                          onClick={() => navigate("/forgot-password")}
                          className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                        >
                          Forgot your password?
                        </a>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? <Loader className="animate-spin" /> : null}
                      <span className="ml-2">Login</span>
                    </Button>
                  </div>
                  <div className="mt-4 text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <a
                      href={`/${routeConstants.REGISTER}`}
                      className="underline underline-offset-4"
                    >
                      Register
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

export default Login;
