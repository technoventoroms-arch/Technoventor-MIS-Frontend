import OTPHandler from "@/components/shared/otp-handler";
import { routeConstants } from "@/constants/route.constants";
import { ILabType } from "@/interfaces/labs";
import { useOrgContext } from "@/providers/organization-provider";
import {
  activateLab,
  createNewLab,
  deactivateLabs,
  getAllLabs,
} from "@/services/labs.service";
import GenericModal from "@mono/shared_ui/components/shared/generic-modal";
import { SiteHeader } from "@mono/shared_ui/components/shared/site-header";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mono/shared_ui/components/ui/avatar";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@mono/shared_ui/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@mono/shared_ui/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@mono/shared_ui/components/ui/dropdown-menu";
import { Skeleton } from "@mono/shared_ui/components/ui/skeleton";
import { useLoading } from "@mono/shared_ui/hooks/use-loading";
import { OtpVerificationResponse } from "@mono/shared_ui/interfaces/otp";
import { DataWithLoading } from "@mono/shared_ui/interfaces/utils";
import { cn, getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import {
  Circle,
  CircleDot,
  EllipsisVertical,
  MonitorOff,
  MonitorUp,
  PlusCircle,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import LabForm, { NewLabType } from "./lab-form";
import { useActiveOrganization } from "@/providers/active-organization-provider";
import ChangeLabAdmin from "./change-lab-admin";

const LabsPage = () => {
  const [otpToken, setOtpToken] = useState<OtpVerificationResponse | null>(
    null
  );
  const { loading, hideLoading, showLoading } = useLoading();
  const [createNewLabModal, setCreateNewLabModal] = useState(false);
  const [deactivateLabModal, setDeactivateLabModal] = useState<ILabType | null>(
    null
  );
  const [changeLabAdminModal, setChangeLabAdminModal] =
    useState<ILabType | null>(null);
  const [activateLabModal, setActivateLabModal] = useState<ILabType | null>(
    null
  );
  const [labs, setLabs] = useState<DataWithLoading<ILabType[]>>({
    data: [],
    loading: false,
  });
  const { orgId } = useOrgContext();
  const { isOrgAdmin, limits, incrementLabCount } = useActiveOrganization();
  const navigate = useNavigate();

  const getLabs = async (orgId: number) => {
    setLabs({ data: [], loading: true });
    try {
      const res = await getAllLabs(orgId);
      if (!res.error) {
        setLabs({ data: res?.data?.records || [], loading: false });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
      setLabs({ data: [], loading: false });
    }
  };
  const handleClick = (id: number) => {
    navigate(`/${orgId}/${routeConstants.LAB}/${id}`);
  };
  useEffect(() => {
    if (orgId) {
      getLabs(orgId);
    }
  }, [orgId]);
  const handleCreteNewLab = async (data: NewLabType) => {
    showLoading();
    try {
      const res = await createNewLab(orgId, data);
      if (!res.error) {
        toast.success("Lab created successfully.");
        setLabs({
          ...labs,
          data: [...labs.data, res.data],
        });
        setCreateNewLabModal(false);
        incrementLabCount();
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      hideLoading();
    }
  };
  const handleDeactivateLab = async () => {
    if (!deactivateLabModal) return;
    showLoading();
    try {
      const res = await deactivateLabs(
        orgId,
        deactivateLabModal!.lab_id,
        otpToken!.verification_token
      );
      if (!res.error) {
        toast.success("Lab deactivated successfully.");
        setLabs({
          ...labs,
          data: labs.data.map((i) => {
            if (i.lab_id == deactivateLabModal?.lab_id) {
              return { ...i, is_active: false };
            }
            return i;
          }),
        });
        setDeactivateLabModal(null);
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      hideLoading();
    }
  };
  const handleActivateLab = async () => {
    if (!activateLabModal) return;
    showLoading();
    try {
      const res = await activateLab(orgId, activateLabModal!.lab_id);
      if (!res.error) {
        toast.success("Lab Activated successfully.");
        setLabs({
          ...labs,
          data: labs.data.map((i) => {
            if (i.lab_id == activateLabModal?.lab_id) {
              return { ...i, is_active: false };
            }
            return i;
          }),
        });
        setActivateLabModal(null);
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      hideLoading();
    }
  };
  const handleChangeLabAdmin = (lab: ILabType, admin: any) => {
    const temp = labs.data.map((l) => {
      if (l.lab_id === lab.lab_id) {
        return { ...l, admin: admin };
      }
      return l;
    });
    setLabs({ ...labs, data: temp });
  };
  const isLimitsExceeded = limits?.LAB?.resource_type
    ? limits?.LAB?.used_quantity >= limits?.LAB?.allowed_quantity
    : false;
  return (
    <>
      <SiteHeader title="My Labs">
        {isOrgAdmin && !isLimitsExceeded && (
          <Button
            variant={"green"}
            size={"sm"}
            onClick={() => setCreateNewLabModal(true)}
          >
            <PlusCircle />
            <span>Create Lab</span>
          </Button>
        )}
      </SiteHeader>
      <div className="@container/main flex flex-1 flex-col gap-2 p-2 overflow-hidden mt-2">
        {labs?.data.length ? (
          <div className="lg:mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2 overflow-auto">
            {labs?.data?.map((i) => (
              <Card
                key={i.lab_id}
                role="button"
                tabIndex={0}
                className={cn(`min-w-72`, "cursor-pointer ")}
                onClick={() => {
                  handleClick(i.lab_id);
                }}
              >
                <CardHeader>
                  <CardTitle>{i.name}</CardTitle>
                  <CardDescription>
                    {i.city}, {i.state}, {i.zipcode} - {i.country}
                  </CardDescription>
                  {isOrgAdmin && (
                    <CardAction>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost">
                            <EllipsisVertical />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="start">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuGroup>
                            {i.is_active ? (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  setDeactivateLabModal(i);
                                  e.stopPropagation();
                                }}
                              >
                                Set Inactive <MonitorOff className="ml-auto" />
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  setActivateLabModal(i);
                                  e.stopPropagation();
                                }}
                              >
                                Activate <MonitorUp className="ml-auto" />
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                              onClick={(e) => {
                                setChangeLabAdminModal(i);
                                e.stopPropagation();
                              }}
                            >
                              Change Lab Admin
                              <UserCog className="ml-auto" />
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardAction>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2  mb-4">
                    {i.is_active ? (
                      <CircleDot className="h-5 w-5 text-green-700/70 dark:text-green-300/70" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-700 dark:text-green-300/70" />
                    )}
                    <Badge
                      className="rounded-full"
                      variant={i.is_active ? "green" : "red"}
                    >
                      {i.is_active ? "Active" : "InActive"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs mb-1">
                    <ShieldCheck className="h-5 w-5 text-green-700/70 dark:text-green-300/70" />
                    {i.admin?.identity_provider_id ? (
                      <>
                        <div className="flex gap-2 ">
                          <Avatar className="h-8 w-8 rounded-lg ">
                            <AvatarImage
                              src={i.admin.image_link}
                              alt={i.admin.first_name}
                            />
                            <AvatarFallback className="rounded-lg uppercase">
                              {i.admin.first_name?.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">
                              {i.admin.first_name}
                              {i.admin.last_name}
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                              {i.admin.email}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex gap-2 ">
                        <Badge className="rounded-full" variant={"red"}>
                          No Admin
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : labs.loading ? (
          <div className="lg:mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
            <Skeleton className="min-w-72 h-20" />
          </div>
        ) : (
          <div className=" p-3 lg:p-8 flex flex-col items-center justify-center bg-secondary rounded">
            <span className="text-lg"> No Labs Created.</span>
            <span className="text-sm opacity-70"> Please create a lab.</span>
          </div>
        )}
      </div>
      <Dialog
        open={!!createNewLabModal}
        onOpenChange={() => {
          !loading && setCreateNewLabModal(false);
        }}
      >
        <DialogContent
          disabled={loading}
          className="flex flex-col overflow-hidden p-0 max-h-[95vh] md:max-w-[500px] lg:max-w-[600px]"
        >
          <DialogTitle className="p-4">Create New Lab</DialogTitle>
          <DialogDescription className="sr-only">
            Modal for creating new Lab.
          </DialogDescription>
          <LabForm
            loading={loading}
            defaultValues={{
              address_1: "",
              address_2: "",
              address_3: "",
              city: "",
              country: "",
              name: "",
              state: "",
              zipcode: "",
            }}
            handleSubmit={handleCreteNewLab}
          />
        </DialogContent>
      </Dialog>
      <GenericModal
        open={!!deactivateLabModal}
        onOpenChange={() => {
          setDeactivateLabModal(null);
          setOtpToken(null);
        }}
        onConfirmClick={handleDeactivateLab}
        loading={loading}
        title={"Deactivate Lab"}
        confirmButtonText={"Deactivate"}
        variant={"danger"}
        disableConfirm={!otpToken}
        descAsChild
        desc={
          <div className="space-y-2">
            <div>
              Are you sure you want to deactivate{" "}
              <Badge variant={"red"} className="ml-2" fontWeight={"semibold"}>
                {deactivateLabModal?.name}
              </Badge>{" "}
              lab ?
            </div>
            <div>Please enter the OTP send to your mail to confirm.</div>
            <div>
              <OTPHandler
                onOTPConfirm={setOtpToken}
                actionType={"MARK_LAB_AS_INACTIVE"}
              />
            </div>
          </div>
        }
      />
      <GenericModal
        open={!!activateLabModal}
        onOpenChange={() => {
          setActivateLabModal(null);
        }}
        onConfirmClick={handleActivateLab}
        loading={loading}
        title={"Activate Lab"}
        confirmButtonText={"Activate"}
        variant={"success"}
        descAsChild
        desc={
          <div className="space-y-2">
            <div>
              Are you sure you want to activate{" "}
              <Badge variant={"red"} className="ml-2" fontWeight={"semibold"}>
                {deactivateLabModal?.name}
              </Badge>{" "}
              lab ?
            </div>
          </div>
        }
      />
      <ChangeLabAdmin
        changeAdminModal={changeLabAdminModal}
        setChangeAdminModal={setChangeLabAdminModal}
        onLabAdminChange={handleChangeLabAdmin}
      />
    </>
  );
};

export default LabsPage;
