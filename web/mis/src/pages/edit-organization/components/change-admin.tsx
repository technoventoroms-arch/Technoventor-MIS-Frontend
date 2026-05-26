import OTPHandler from "@/components/shared/otp-handler";
import { UserSearchQuery } from "@/interfaces/users";
import {
  getOrganizationUsersList,
  transferOrg,
} from "@/services/organization.service";
import ControlledAutocomplete from "@mono/shared_ui/components/controlled-form-component/c-form-auto-compolete";
import GenericModal from "@mono/shared_ui/components/shared/generic-modal";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@mono/shared_ui/components/ui/avatar";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { useLoading } from "@mono/shared_ui/hooks/use-loading";
import { Organization } from "@mono/shared_ui/interfaces/organization";
import { OtpVerificationResponse } from "@mono/shared_ui/interfaces/otp";
import { OrgUser } from "@mono/shared_ui/interfaces/user";
import {
  PaginatedData,
  PaginatedDataWithLoading,
} from "@mono/shared_ui/interfaces/utils";
import { cn, getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { Check, MoveRight } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

type Props = {
  open: boolean;
  close: () => void;
  organization: Organization;
};

const ChangeAdmin = ({ close, open, organization }: Props) => {
  const [otpToken, setOtpToken] = useState<OtpVerificationResponse | null>(
    null
  );
  const { OrgTransferloading, hideOrgTransferLoading, showOrgTransferLoading } =
    useLoading("OrgTransfer");
  const [confirmOrgTransferModal, setConfirmOrgTransferModal] = useState(false);
  const [users, setUsers] = useState<PaginatedDataWithLoading<OrgUser>>({
    records: [],
    loading: false,
    count: 0,
    skip: 0,
    take: 0,
  });
  const form = useForm({
    defaultValues: { newOwner: null as OrgUser | null },
  });

  const fetchUsersList = async (params: UserSearchQuery) => {
    let res: PaginatedData<OrgUser> = {
      count: 0,
      records: [],
      skip: 0,
      take: 0,
    };
    try {
      const data = await getOrganizationUsersList(organization.id, params);
      if (!data.error) {
        res = data.data;
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    }
    return res;
  };
  const getUsers = async (param: UserSearchQuery) => {
    setUsers({ count: 0, records: [], skip: 0, take: 0, loading: true });
    const data = await fetchUsersList(param);
    data.records =
      data.records?.filter(
        (i) =>
          organization.admin.identity_provider_id !== i.identity_provider_id
      ) || [];
    setUsers({ ...data, loading: false });
  };

  const ownerSelected = useWatch({ control: form.control, name: "newOwner" });
  const handleTransferOrg = async () => {
    showOrgTransferLoading();
    try {
      const res = await transferOrg(
        organization.id,
        (ownerSelected as OrgUser).identity_provider_id,
        otpToken?.verification_token || ""
      );
      if (!res.error) {
        toast.success("Organization ownership transferred successfully.");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
      hideOrgTransferLoading();
    }
  };
  return (
    <>
      <GenericModal
        open={open}
        onOpenChange={() => {
          close();
          setOtpToken(null);
          form.reset({ newOwner: null });
        }}
        onConfirmClick={() => setConfirmOrgTransferModal(true)}
        title={"Transfer Organization"}
        confirmButtonText="Transfer"
        variant="danger"
        descAsChild
        customIcon={<MoveRight />}
        disableConfirm={!ownerSelected}
        desc={
          <div className="space-y-4">
            <div>
              Are you sure you want to transfer organization? Select a user to
              make the new owner of this Organization.{" "}
              <span className="text-red-500 dark:text-red-400 font-semibold">
                This action is irreversible. Once you transfer the organization,
                you will lose all admin access to this organization unless the
                new owner decides changes your role.
              </span>
            </div>
            <FormProvider {...form}>
              <ControlledAutocomplete
                control={form.control}
                name={"newOwner"}
                label={"New Owner"}
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
        }
      />
      <GenericModal
        open={confirmOrgTransferModal}
        onOpenChange={() => {
          setConfirmOrgTransferModal(false);
          setOtpToken(null);
        }}
        onConfirmClick={handleTransferOrg}
        loading={OrgTransferloading}
        title={"Confirm Organization Transfer"}
        confirmButtonText="Transfer"
        variant="danger"
        disableConfirm={!otpToken}
        descAsChild
        customIcon={<MoveRight />}
        desc={
          <div className="space-y-4">
            <div>
              Are you sure you want to transfer the ownership of{" "}
              <Badge variant={"red"} className="ml-2" fontWeight={"semibold"}>
                {organization.name}
              </Badge>{" "}
              to
              <div className="flex gap-2 items-center w-max mt-4">
                <Avatar className="size-10 rounded-full">
                  <AvatarImage
                    src={(ownerSelected as any)?.image_link}
                    alt={ownerSelected?.first_name}
                  />
                  <AvatarFallback className="rounded-lg uppercase">
                    {ownerSelected?.first_name?.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-sm font-medium">
                    {ownerSelected?.first_name} {ownerSelected?.last_name}
                  </span>
                  <span className="truncate text-sm text-muted-foreground">
                    {ownerSelected?.email}
                  </span>
                </div>
              </div>
            </div>
            <div>
              Please enter the OTP send to your mail to confirm org transfer.
            </div>
            <div>
              <OTPHandler
                onOTPConfirm={setOtpToken}
                actionType={"CHANGE_ORGANISATION_ADMIN"}
              />
            </div>
          </div>
        }
      />
    </>
  );
};

export default ChangeAdmin;
