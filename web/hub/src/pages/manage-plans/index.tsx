import { SiteHeader } from "@mono/shared_ui/components/shared/site-header";
import { cn, getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { CirclePlus, IndianRupee, MoveRight } from "lucide-react";
import { useEffect, useState } from "react";

import OTPHandler from "@/components/shared/otp-handler";
import {
  createSubscriptionPlans,
  deleteSubscriptionPlans,
  editSubscriptionPlans,
  getSubscriptionPlans,
} from "@/services/payment.services";
import GenericModal from "@mono/shared_ui/components/shared/generic-modal";
import RepeatElement from "@mono/shared_ui/components/shared/repeat-element";
import ResponsiveDrawer from "@mono/shared_ui/components/shared/responsive-drawer";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@mono/shared_ui/components/ui/card";
import { DrawerContent } from "@mono/shared_ui/components/ui/drawer";
import { Skeleton } from "@mono/shared_ui/components/ui/skeleton";
import { useLoading } from "@mono/shared_ui/hooks/use-loading";
import { OtpVerificationResponse } from "@mono/shared_ui/interfaces/otp";
import {
  Entitlement,
  SubscriptionPlan,
} from "@mono/shared_ui/interfaces/plans";
import { toast } from "sonner";
import PlanForm from "./component/plan-form";

type EntitlementsObject = {
  LAB?: number;
  MACHINE?: number;
  PROJECT?: number;
  USER?: number;
};
export const convertEntitlements = (
  entitlements: EntitlementsObject
): Entitlement[] => {
  return Object.entries(entitlements)
    .filter(([_, value]) => value !== undefined && value > 0)
    .map(([key, value]) => ({
      resource_type: key,
      quantity: value as number,
    })) as any;
};

export const reverseEntitlements = (
  entitlements: Entitlement[]
): EntitlementsObject => {
  return entitlements.reduce<EntitlementsObject>(
    (acc, { resource_type, quantity }) => {
      acc[resource_type as keyof EntitlementsObject] = quantity;
      return acc;
    },
    {}
  );
};
const ManagePlansPage = () => {
  const [otpToken, setOtpToken] = useState<OtpVerificationResponse | null>(
    null
  );
  const [confirmDeletePlanModal, setConfirmDeletePlanModal] = useState(false);
  const { hideLoading, loading, showLoading } = useLoading();
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [editPlan, setEditPlan] = useState<SubscriptionPlan | null>(null);
  const {
    hideLoading: hideCPlanLoading,
    loading: cplanLoading,
    showLoading: showCPlanLoading,
  } = useLoading();
  const {
    hideLoading: hideDeletePlanLoading,
    loading: deleteplanLoading,
    showLoading: showDeletePlanLoading,
  } = useLoading();
  const [createNewPlanModal, setCreateNewPlanModal] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const getPlans = async () => {
    showLoading();
    try {
      const res = await getSubscriptionPlans();
      if (!res.error) {
        setPlans(res.data);
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      hideLoading();
    }
  };
  useEffect(() => {
    getPlans();
  }, []);
  const createNewPlan = async (e: any) => {
    showCPlanLoading();
    try {
      e.entitlements = convertEntitlements(e.entitlements);
      e.amount = Math.round(e.amount * 100);
      const res = await createSubscriptionPlans(e);
      if (!res.error) {
        setPlans([res.data, ...plans]);
        setCreateNewPlanModal(false);
        toast.success("Plan Created Successfully.");
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      hideCPlanLoading();
    }
  };
  const handelEditPlan = async (e: any) => {
    showCPlanLoading();
    try {
      const entitlements = editPlan!.entitlements.map((prev) => {
        prev.quantity = e.entitlements[prev.resource_type as any]
          ? e.entitlements[prev.resource_type as any]
          : 0;
        return prev;
      });
      Object.entries(e.entitlements as EntitlementsObject).forEach(
        ([key, value]) => {
          if (!entitlements.find((i) => i.resource_type == key)) {
            entitlements.push({ quantity: value, resource_type: key as any });
          }
        }
      );

      const res = await editSubscriptionPlans(editPlan!.id, {
        ...e,
        entitlements,
      });
      if (!res.error) {
        setPlans(plans.map((i) => (i.id == res.data.id ? res.data : i)));
        toast.success("Plan Updated Successfully.");
        setEditPlan(null);
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      hideCPlanLoading();
    }
  };
  const deletePlan = async (id: number) => {
    showDeletePlanLoading();
    try {
      const res = await deleteSubscriptionPlans(
        id,
        otpToken?.verification_token!
      );
      if (!res.error) {
        setPlans(plans.filter((i) => i.id != id));
        setShowDeleteModal(false);
        setConfirmDeletePlanModal(false);
        setOtpToken(null);
        setEditPlan(null);
        toast.success("Plan Deleted Successfully.");
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      hideDeletePlanLoading();
    }
  };
  return (
    <>
      <SiteHeader title="Labs">
        <Button onClick={() => setCreateNewPlanModal(true)}>
          <CirclePlus /> <span className="hidden lg:inline">Add New Plan</span>
        </Button>
      </SiteHeader>{" "}
      <div className="@container/main  flex flex-1 flex-col gap-2 p-2 overflow-auto ">
        <div className="flex flex-col gap-4 items-center">
          <div className={cn("flex flex-wrap gap-4 mx-auto justify-center")}>
            {loading ? (
              <RepeatElement>
                <Skeleton className="h-54 min-w-sm w-sm " />
              </RepeatElement>
            ) : (
              plans.map((i) => (
                <Card
                  key={i.id}
                  onClick={() => {
                    setEditPlan(i);
                  }}
                  role="button"
                  className="min-w-xs hover:scale-105 transition-transform cursor-pointer"
                >
                  <CardHeader>
                    <CardTitle className="text-3xl flex items-end gap-1">
                      <IndianRupee className="" />
                      <span className="-mb-1">{i.amount / 100}</span>
                      <span className="font-normal text-sm">/month</span>
                    </CardTitle>
                    <CardDescription className="text-md">
                      {i.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <div className="mb-2 pb-2 border-b">{i.description}</div>
                      <div>
                        {i.entitlements.map((i) => (
                          <div className="grid grid-cols-6">
                            <div className="col-span-3 capitalize">
                              {i.resource_type.toLowerCase()}
                            </div>
                            <div className="col-span-3 ">{i.quantity}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
      <ResponsiveDrawer
        open={createNewPlanModal}
        onOpenChange={() => {
          !loading && setCreateNewPlanModal(false);
        }}
        onAnimationEnd={() => {
          !loading && setCreateNewPlanModal(false);
        }}
      >
        <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[90vh] data-[vaul-drawer-direction=bottom]:mt-4!">
          <ResponsiveDrawer.Header
            title="Create New Plan"
            description=" Modal for creating new plan."
          />
          <PlanForm handleSubmit={createNewPlan} loading={cplanLoading} />
        </DrawerContent>
      </ResponsiveDrawer>
      <ResponsiveDrawer
        open={!!editPlan}
        onOpenChange={() => {
          !loading && setEditPlan(null);
        }}
        onAnimationEnd={() => {
          !loading && setEditPlan(null);
        }}
      >
        <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[90vh] data-[vaul-drawer-direction=bottom]:mt-4!">
          <ResponsiveDrawer.Header
            title="Edit Plan"
            description=" Modal for editing existing plan."
          />
          <PlanForm
            handleSubmit={handelEditPlan}
            loading={cplanLoading}
            defaultValues={
              editPlan
                ? ({
                    ...editPlan,
                    entitlements: reverseEntitlements(editPlan?.entitlements),
                  } as any)
                : undefined
            }
            editMode
            deleteButton={
              <Button
                type="button"
                className="mr-4"
                variant={"red"}
                onClick={() => setShowDeleteModal(true)}
              >
                Delete
              </Button>
            }
          />
        </DrawerContent>
      </ResponsiveDrawer>
      <GenericModal
        onOpenChange={() => setShowDeleteModal(false)}
        open={showDeleteModal}
        variant="danger"
        onConfirmClick={() => setConfirmDeletePlanModal(true)}
        title={"Confirm Delete"}
        desc={
          <div>
            Are you sure you want to delete plan{" "}
            <Badge variant={"blue"}>{editPlan?.name}</Badge>.
          </div>
        }
        descAsChild
        loading={deleteplanLoading}
      />
      <GenericModal
        open={confirmDeletePlanModal}
        onOpenChange={() => {
          setConfirmDeletePlanModal(false);
          setOtpToken(null);
        }}
        onConfirmClick={() => deletePlan(editPlan!.id)}
        loading={deleteplanLoading}
        title={"Confirm Organization Transfer"}
        confirmButtonText="Transfer"
        variant="danger"
        disableConfirm={!otpToken}
        descAsChild
        customIcon={<MoveRight />}
        desc={
          <div className="space-y-4">
            <div>
              Are you sure you want to delete the plan
              <Badge variant={"blue"}>{editPlan?.name}</Badge>.
            </div>
            <div>
              Please enter the OTP send to your mail to confirm delete plan.
            </div>
            <div>
              <OTPHandler
                onOTPConfirm={setOtpToken}
                actionType={"DELETE_PLAN"}
              />
            </div>
          </div>
        }
      />
    </>
  );
};

export default ManagePlansPage;
