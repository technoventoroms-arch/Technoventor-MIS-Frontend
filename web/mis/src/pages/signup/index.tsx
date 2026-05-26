import { routeConstants } from "@/constants/route.constants";
import { checkEmail, registerAccount } from "@/services/user.service";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@mono/shared_ui/components/ui/form";
import { useLoading } from "@mono/shared_ui/hooks/use-loading";
import { cn, debounce, getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { Eye, EyeOff, Info, Loader } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import z from "zod";
import Session from "supertokens-auth-react/recipe/session";
import { Input } from "@mono/shared_ui/components/ui/input";

const userSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required." })
      .email()
      .min(1, "Email is required."),
    first_name: z
      .string({ required_error: "First Name is required." })
      .min(1, "First Name is required."),
    last_name: z
      .string({ required_error: "Last Name is required." })
      .min(1, "Last Name is required."),
    phone_number: z
      .string({ required_error: "Phone Number is required." })
      .regex(/^\d{10}$/, "Invalid Phone Number"),
    password: z
      .string({ required_error: "Password is required." })
      .min(1, "Password is required."),
    confirmPassword: z
      .string({ required_error: "Please confirm your password." })
      .min(1, "Please confirm your password."),
    honeypot: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
const checkEmailSchema = z.string().email();

const SignUp = () => {
  const navigate = useNavigate();
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false);
  const [isView, setIsView] = useState(false);
  const { hideLoading, loading, showLoading } = useLoading();
  const [checkingEmail, setCheckingEmail] = useState(false);
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      confirmPassword: "",
      phone_number: "",
    },
    resolver: zodResolver(userSchema),
  });
  const handleCheckEmail = async (email: any) => {
    setCheckingEmail(true);
    try {
      const res = await checkEmail(email);
      if (res.data.exists) {
        form.setError("email", { message: "Email already exists." });
      } else {
        form.clearErrors("email");
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setCheckingEmail(false);
    }
  };
  const handleSubmit = async (data: z.infer<typeof userSchema>) => {
    showLoading();
    if (data.honeypot) {
      toast.error("Bot detected!");
      hideLoading();
      return;
    }
    try {
      data.phone_number = `+91${data.phone_number}`;
      const res = await registerAccount(data as any);
      if (!res.error) {
        setSubmittedSuccessfully(true);
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      hideLoading();
    }
  };
  const email = useWatch({
    control: form.control,
    name: "email",
  });
  const dbCheckEmail = useCallback(debounce(handleCheckEmail, 500), []);
  useEffect(() => {
    if (email && checkEmailSchema.safeParse(email).success) {
      dbCheckEmail(email);
    }
  }, [email]);

  useEffect(() => {
    (async () => {
      if (await Session.doesSessionExist()) {
        navigate(`/`);
      }
    })();
  }, []);
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className={cn("flex flex-col gap-6")}>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {submittedSuccessfully
                  ? "Registration Successful 🎉"
                  : "Register With Makerspace"}
              </CardTitle>
              {!submittedSuccessfully && (
                <CardDescription>
                  Enter the details below to register your account
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {!submittedSuccessfully ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)}>
                    <div className="flex flex-col gap-6">
                      <div className="grid gap-2">
                        <ControlledFormInput
                          name="first_name"
                          label="First Name"
                          control={form.control}
                          placeholder="John"
                        />
                      </div>
                      <div className="grid gap-2">
                        <ControlledFormInput
                          name="last_name"
                          label="Last Name"
                          control={form.control}
                          placeholder="Doe"
                        />
                      </div>
                      <div className="grid gap-2">
                        <ControlledFormInput
                          name="email"
                          label="Email"
                          control={form.control}
                          placeholder="Engineer123@mail.com"
                        />
                        {checkingEmail && (
                          <div className="text-xs">
                            Checking email...{" "}
                            <Loader className="animate-spin inline size-4" />
                          </div>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <FormField
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <div className="flex">
                                  <Input
                                    value={"+91"}
                                    disabled
                                    className="w-14 rounded-br-none rounded-tr-none "
                                  />
                                  <Input
                                    placeholder={"Phone number"}
                                    type={"phone"}
                                    {...field}
                                    autoComplete="off"
                                    className={
                                      "rounded-bl-none rounded-tl-none "
                                    }
                                  />
                                </div>
                              </FormControl>
                              <FormMessage
                                className="text-xs"
                                startIcon={<Info className="size-3" />}
                              />
                            </FormItem>
                          )}
                          name={"phone_number"}
                        />
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <ControlledFormInput
                              name="password"
                              label="Password"
                              control={form.control}
                              placeholder="Pass@123"
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
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <ControlledFormInput
                              name="confirmPassword"
                              label="Confirm Password"
                              control={form.control}
                              placeholder="Pass@123"
                              type={"password"}
                            />
                          </div>
                        </div>
                        <div className="flex items-end gap-2 sr-only">
                          <div className="flex-1">
                            <ControlledFormInput
                              name="honeypot"
                              label="Confirm Password"
                              control={form.control}
                              placeholder="Pass@123"
                              type={"password"}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full">
                        <Button
                          disabled={loading}
                          type="submit"
                          className="flex-1"
                        >
                          <span className="ml-2">Submit</span>
                        </Button>
                      </div>
                      <div className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <a
                          href={`/${routeConstants.LOGIN}`}
                          className="underline underline-offset-4"
                        >
                          Login
                        </a>
                      </div>
                    </div>
                  </form>
                </Form>
              ) : (
                <div>
                  Thank you for signing up! We've sent a confirmation link to
                  your email. Please login and verify using otp sent to your
                  email. The OTP will be sent post login for verification.
                  <div className="w-full mt-4">
                    <Button className="mx-auto" asChild variant={"green"}>
                      <Link to="/">Back to Login</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
