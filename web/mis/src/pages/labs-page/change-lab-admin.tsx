import OTPHandler from "@/components/shared/otp-handler";
import { ILabType } from "@/interfaces/labs";
import { UserSearchQuery } from "@/interfaces/users";
import { useActiveOrganization } from "@/providers/active-organization-provider";
import { getOrganizationUsersList } from "@/services/organization.service";
import { changeLabAdmin } from "@/services/user.service";
import ControlledAutocomplete from "@mono/shared_ui/components/controlled-form-component/c-form-auto-compolete";
import GenericModal from "@mono/shared_ui/components/shared/generic-modal";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mono/shared_ui/components/ui/avatar";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { useLoading } from "@mono/shared_ui/hooks/use-loading";
import { OtpVerificationResponse } from "@mono/shared_ui/interfaces/otp";
import { IUser, OrgUser } from "@mono/shared_ui/interfaces/user";
import {
  PaginatedData,
  PaginatedDataWithLoading,
} from "@mono/shared_ui/interfaces/utils";
import { cn, getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { Check, UserCog2 } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

type Props = {
  changeAdminModal: ILabType | null;
  setChangeAdminModal: (data: ILabType | null) => void;
  onLabAdminChange: (lab: ILabType, admin: IUser) => void;
};

const ChangeLabAdmin = ({
  changeAdminModal,
  setChangeAdminModal,
  onLabAdminChange,
}: Props) => {
  const { activeOrganization } = useActiveOrganization();
  const [otpToken, setOtpToken] = useState<OtpVerificationResponse | null>(
    null
  );
  const { AdminChangeloading, hideAdminChangeLoading, showAdminChangeLoading } =
    useLoading("AdminChange");
  const [users, setUsers] = useState<PaginatedDataWithLoading<OrgUser>>({
    records: [],
    loading: false,
    count: 0,
    skip: 0,
    take: 0,
  });
  const form = useForm({
    defaultValues: { newAdmin: null as OrgUser | null },
  });

  const newAdmin = useWatch({ control: form.control, name: "newAdmin" });

  const handleChangeLabAdmin = async () => {
    showAdminChangeLoading();
    try {
      const res = await changeLabAdmin(
        activeOrganization!.id,
        newAdmin!.identity_provider_id,
        changeAdminModal!.lab_id,
        otpToken!.verification_token
      );

      if (!res.error) {
        onLabAdminChange(changeAdminModal!, res.data);
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      hideAdminChangeLoading();
      setOtpToken(null);
      setChangeAdminModal(null);
    }
  };

  const fetchUsersList = async (params: UserSearchQuery) => {
    let res: PaginatedData<OrgUser> = {
      count: 0,
      records: [],
      skip: 0,
      take: 0,
    };
    try {
      const data = await getOrganizationUsersList(
        activeOrganization!.id,
        params
      );
      if (!data.error) {
        res = data.data;
        res.records =
          res.records?.filter(
            (u) =>
              !(
                u.identity_provider_id ==
                  changeAdminModal?.admin?.identity_provider_id ||
                activeOrganization?.admin.identity_provider_id ==
                  u.identity_provider_id
              )
          ) || [];
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    }
    return res;
  };
  const getUsers = async (param: UserSearchQuery) => {
    setUsers({ count: 0, records: [], skip: 0, take: 0, loading: true });
    const data = await fetchUsersList(param);
    setUsers({ ...data, loading: false });
  };

  return (
    <GenericModal
      open={!!changeAdminModal}
      onOpenChange={() => {
        setChangeAdminModal(null);
        setOtpToken(null);
      }}
      onConfirmClick={handleChangeLabAdmin}
      title={"Change Lab Admin"}
      confirmButtonText={"Change Admin"}
      variant={"danger"}
      disableConfirm={(!otpToken && !newAdmin) || AdminChangeloading}
      customIcon={<UserCog2 />}
      descAsChild
      desc={
        <div className="space-y-2">
          <div>
            Are you sure you want to change admin of lab
            <Badge variant={"red"} className="ml-2" fontWeight={"semibold"}>
              {changeAdminModal?.name}
            </Badge>{" "}
            lab ?
          </div>
          <div>
            <FormProvider {...form}>
              <ControlledAutocomplete
                disabled={AdminChangeloading}
                control={form.control}
                name={"newAdmin"}
                label={"New Admin"}
                loading={users.loading}
                options={users.records || []}
                onDebouncedChange={(t) => getUsers({ searchQuery: t })}
                getItemLabel={(e) => `${e.first_name} ${e.last_name}`}
                getItemValue={(e) => `${e.user_id}`}
                emptyText={"No Users found."}
                formItemClassName="h-auto"
                comboboxProps={{
                  customFilter: (e) =>
                    `${e.first_name} ${e.last_name} ${e.email}`,
                  renderOptions: ({ getItemValue, item, value }) => (
                    <>
                      <div className="flex gap-2 items-center w-max">
                        <Avatar className="size-12 rounded-full">
                          <AvatarImage
                            src={(item as any)?.image_link}
                            alt={item?.first_name}
                          />
                          <AvatarFallback className="rounded-lg uppercase">
                            {item?.first_name?.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate text-sm font-medium">
                            {item?.first_name}
                          </span>
                          <span className="truncate text-sm text-muted-foreground">
                            {item?.email}
                          </span>
                        </div>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto",
                          value && getItemValue(value) === getItemValue(item)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </>
                  ),
                }}
              />
            </FormProvider>
          </div>
          <div>Please enter the OTP send to your mail to confirm.</div>
          <div>
            <OTPHandler
              onOTPConfirm={setOtpToken}
              actionType={"CHANGE_LAB_ADMIN"}
            />
          </div>
        </div>
      }
    />
  );
};

export default ChangeLabAdmin;
