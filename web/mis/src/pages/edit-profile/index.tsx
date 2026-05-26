import OTPHandler from "@/components/shared/otp-handler";
import { useUser } from "@/providers/user-info-provider";
import { uploadImage } from "@/services/file.service";
import {
  acceptInvite,
  getMyInvites,
  updateUserProfile,
  verifyEmail,
} from "@/services/user.service";
import { zodResolver } from "@hookform/resolvers/zod";
import ControlledFormInput from "@mono/shared_ui/components/controlled-form-component/c-form-input";
import GenericModal from "@mono/shared_ui/components/shared/generic-modal";
import ImageUpload from "@mono/shared_ui/components/shared/image-upload";
import { SiteHeader } from "@mono/shared_ui/components/shared/site-header";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Form } from "@mono/shared_ui/components/ui/form";
import { OtpVerificationResponse } from "@mono/shared_ui/interfaces/otp";
import { IUser, UserInvitation } from "@mono/shared_ui/interfaces/user";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { ArrowLeft, Loader } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { IUpdateUserProfile, UpdateUserProfileSchema } from "./schema";

const EditProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [verifyEmailModal, setVerifyEmailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, updateUserInfo } = useUser();
  const form = useForm<IUpdateUserProfile>({
    defaultValues: {
      ...(user || {}),
    },
    resolver: zodResolver(UpdateUserProfileSchema),
    disabled: loading,
  });

  const { isDirty, dirtyFields } = form.formState;

  const handleSubmit = async (data: IUpdateUserProfile) => {
    setLoading(true);
    try {
      const payload: any = {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        image_link: data.image_link,
      };
      if (!dirtyFields.image_link) {
        delete payload.image_link;
      }
      const res = await updateUserProfile(payload as IUser);
      if (!res.error) {
        form.reset(res.data, { keepDirty: false });
      }
      setLoading(false);
      toast.success("User profile updated successfully");
      updateUserInfo({
        ...user!,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
      });
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
      setLoading(false);
    }
  };
  const handleImageUpload = async (e: File) => {
    try {
      const formData = new FormData();
      formData.append("file", e);
      const res = await uploadImage(formData);
      if (res.data) {
        form.setValue("image_link", res.data.key, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
      throw error;
    }
  };

  const handleBack = () => {
    if (location.state?.from === "/") {
      navigate("/");
    } else {
      navigate(-1);
    }
  };

  const handleVerifyEmail = async (otpToken: OtpVerificationResponse) => {
    if (!otpToken) return;
    try {
      const res = await verifyEmail(otpToken!.verification_token);
      if (!res.error) {
        toast.success("Email verified successfully");
        setVerifyEmailModal(false);
        updateUserInfo({ ...user!, is_verified: true });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
  };

  useEffect(() => {
    if (!user?.is_verified) {
      setVerifyEmailModal(true);
    }
  }, [user]);
  return (
    <>
      <div className="sticky top-0 z-10 w-full bg-background">
        <SiteHeader title="My Profile" showSidebarTrigger={false} />
      </div>
      <div className="mx-auto @container/main flex flex-1 flex-col gap-2 p-2 pt-4 overflow-hidden max-w-4xl">
        <div className="w-full">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft />
            Go Back
          </Button>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-2 px-4 pb-4 flex-1 overflow-auto"
          >
            <div className="grid grid-cols-12 gap-4">
              <span className="col-span-12 p-2 flex-1">
                <div className="md:w-100 ">
                  <ImageUpload
                    onImageUpload={handleImageUpload}
                    name="image_link"
                    defaultValue={user?.image_link || ""}
                    key={user?.image_link}
                  />
                </div>
              </span>
              <div className="col-span-6">
                <ControlledFormInput
                  name={"first_name"}
                  label={"First Name"}
                  control={form.control}
                />
              </div>
              <div className="col-span-6">
                <ControlledFormInput
                  name={"last_name"}
                  label={"Last Name"}
                  control={form.control}
                />
              </div>
              <div className="col-span-6">
                <ControlledFormInput
                  name={"email"}
                  label={"Email"}
                  control={form.control}
                  disabled
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                disabled={loading || !isDirty}
                type="submit"
                variant={"green"}
              >
                {loading ? <Loader className="animate-spin" /> : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
        <MyInvites />
      </div>

      <GenericModal
        open={!!verifyEmailModal}
        onOpenChange={() => {
          setVerifyEmailModal(false);
        }}
        onConfirmClick={() => {}}
        loading={loading}
        title={"Verify Email"}
        confirmButtonText={"Verify"}
        variant={"success"}
        descAsChild
        showConfirmBtn
        desc={
          <div className="space-y-2">
            <div>Email verification is required to use the application.</div>
            <div>Please enter the OTP send to your mail to confirm.</div>
            <div>
              <OTPHandler
                onOTPConfirm={handleVerifyEmail}
                actionType={"VERIFY_USER_EMAIL"}
              />
            </div>
          </div>
        }
      />
    </>
  );
};

export default EditProfilePage;

const MyInvites = () => {
  const [reqId, setReqId] = useState<number | null>(null);
  const [invites, setInvites] = useState<UserInvitation[]>([]);
  const fetchMyInvites = async () => {
    try {
      const res = await getMyInvites();
      if (!res.error) {
        setInvites(res?.data || []);
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
  };

  useEffect(() => {
    document.body.style = "";
    fetchMyInvites();
  }, []);

  const handleAcceptInvite = useCallback(
    (inviteId: number, state: "ACCEPTED" | "REJECTED") => async () => {
      try {
        setReqId(inviteId);
        const res = await acceptInvite(inviteId, { status: state });
        if (!res.error) {
          toast.success(`Invite ${state.toLowerCase()} successfully`);
          setInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
        }
      } catch (error) {
        toast.error(getAxiosErrorMessage(error));
      } finally {
        setReqId(null);
      }
    },
    []
  );
  if (invites.length === 0) return null;
  return (
    <div className="w-full p-4 border rounded space-y-2">
      <h2 className="text-lg font-medium w-full border-b mb-4 pb-4">
        My Invites
      </h2>
      <div className="grid grid-cols-7 gap-4 items-center text-md">
        <div className="col-span-2">Organization</div>
        <div className="col-span-2">Lab Name</div>
        <div className="col-span-1">Role</div>
        <div className="col-span-2"></div>
      </div>
      {invites.map((invite) => (
        <div key={invite.id} className="grid grid-cols-7 gap-4 items-center">
          <div className="col-span-2">{invite.organisation_name}</div>
          <div className="col-span-2">{invite.lab_name}</div>
          <div className="col-span-1">
            <Badge variant={"pink"}>{invite.role_name.toUpperCase()}</Badge>
          </div>
          <div className="col-span-2 flex gap-2 justify-center">
            {reqId == invite.id ? (
              <Loader className="animate-spin" />
            ) : (
              <>
                <Button
                  disabled={!!reqId}
                  onClick={handleAcceptInvite(invite.id, "REJECTED")}
                  size={"sm"}
                  variant={"red"}
                >
                  Reject
                </Button>
                <Button
                  disabled={!!reqId}
                  onClick={handleAcceptInvite(invite.id, "ACCEPTED")}
                  size={"sm"}
                  variant={"green"}
                >
                  Accept
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
