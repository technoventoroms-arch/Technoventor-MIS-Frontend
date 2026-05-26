import {
  deleteCardRFID,
  getCardRFID,
  updateCardRFID,
} from "@/services/user.service";
import { zodResolver } from "@hookform/resolvers/zod";
import ControlledFormInput from "@mono/shared_ui/components/controlled-form-component/c-form-input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mono/shared_ui/components/ui/avatar";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@mono/shared_ui/components/ui/dialog";
import { Form } from "@mono/shared_ui/components/ui/form";
import { useLoading } from "@mono/shared_ui/hooks/use-loading";
import { IUser } from "@mono/shared_ui/interfaces/user";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { userCardInfoSchema } from "./scheme";

export type UserCardInfoFormType = z.infer<typeof userCardInfoSchema>;

type Props = {
  disabled?: boolean;
  userInfo: IUser | null;
  orgId: number;
  labId: number;
};

const UserCardInfoForm = ({ userInfo, disabled, labId, orgId }: Props) => {
  const [loading, setLoading] = useState(false);
  const { ApiKeyloading, hideApiKeyLoading, showApiKeyLoading } =
    useLoading("ApiKey");

  const [changeApiKeyModal, setChangeApiKeyModal] = useState(false);
  const form = useForm<UserCardInfoFormType>({
    defaultValues: {
      rfid: "",
    } as any,
    resolver: zodResolver(userCardInfoSchema) as any,
    disabled: disabled,
  });
  const { isDirty } = form.formState;
  const rfid = useWatch({ control: form.control, name: "rfid" });
  const handleUpdateUserCardInfo = async (props: UserCardInfoFormType) => {
    setLoading(true);
    try {
      const res = await updateCardRFID({
        rfid: props.rfid,
        userId: userInfo!.identity_provider_id,
        labId,
        orgId,
      });
      if (!res.error) {
        form.reset({ ...props }, { keepDirty: false });
        toast.success("User card info updated successfully.");
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteUserCardInfo = async () => {
    showApiKeyLoading();
    try {
      const res = await deleteCardRFID({
        userId: userInfo!.identity_provider_id,
        labId,
        orgId,
      });
      if (!res.error) {
        form.reset({ rfid: "" }, { keepDirty: false });
        toast.success("User card info deleted successfully.");
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setChangeApiKeyModal(false);
      hideApiKeyLoading();
    }
  };
  const getUserCardInfo = async (userId: string) => {
    setLoading(true);
    try {
      const res = await getCardRFID({
        userId: userId,
        labId,
        orgId,
      });
      if (!res.error) {
        form.reset({ rfid: res.data.rfid }, { keepDirty: false });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getUserCardInfo(userInfo!.identity_provider_id);
  }, []);

  return (
    <>
      <Form {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit(handleUpdateUserCardInfo)}
          className="space-y-2 px-4 pb-4 flex-1 overflow-auto"
        >
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
              This RFID will be used for machine access in lab by below user .
              Deleting or changing it will cause any card with current id to
              stop working in labs.
              <Badge
                variant={"outline"}
                className="flex items-center gap-2 my-2"
              >
                <Avatar className="size-8 rounded-full">
                  <AvatarImage
                    src={userInfo?.image_link}
                    alt={userInfo?.first_name}
                  />
                  <AvatarFallback className="rounded-lg uppercase text-xs">
                    {userInfo?.first_name?.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-sm font-medium">
                    {userInfo?.first_name}
                  </span>
                  <span className="truncate text-sm">{userInfo?.email}</span>
                </div>
              </Badge>
            </div>
            <div className="col-span-12">
              <ControlledFormInput
                name={"rfid"}
                label={"User Card ID"}
                control={form.control}
              />
            </div>
          </div>

          <div className="flex justify-end">
            {!disabled && (
              <>
                {loading ? (
                  <Loader className="animate-spin" />
                ) : (
                  <>
                    <Button
                      type="button"
                      variant={"red"}
                      className="mr-2"
                      onClick={() => setChangeApiKeyModal(true)}
                      disabled={!rfid}
                    >
                      Delete
                    </Button>
                    <Button
                      disabled={loading || !isDirty}
                      type="submit"
                      variant={"green"}
                    >
                      Submit
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </form>
      </Form>
      <Dialog
        open={!!changeApiKeyModal}
        onOpenChange={() => {
          !ApiKeyloading && setChangeApiKeyModal(false);
        }}
      >
        <DialogContent
          disabled={ApiKeyloading}
          className="flex flex-col overflow-hidden p-0 max-h-[95vh] md:max-w-[500px] lg:max-w-[600px]"
        >
          <DialogTitle className="p-4">Change User Card Id</DialogTitle>
          <DialogDescription className="sr-only">
            Modal for changing User Card Id.
          </DialogDescription>
          <div className="p-4 pt-0 space-y-4">
            This action will invalidate the current ID on the user's card and
            the card will stop working. You will need to issue a new card ID to
            the user.
            <div className="text-lg font-semibold pt-1 space-x-2">
              <Button
                disabled={loading}
                variant={"gray"}
                size={"sm"}
                onClick={() => setChangeApiKeyModal(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={loading}
                variant={"red"}
                size={"sm"}
                onClick={handleDeleteUserCardInfo}
              >
                Delete Card Id
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserCardInfoForm;
