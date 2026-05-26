import { routeConstants } from "@/constants/route.constants";
import { useOrgContext } from "@/providers/organization-provider";
import {
  getSubscriptionPlans,
  updateSubscription,
} from "@/services/payment.services";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@mono/shared_ui/components/ui/card";
import { useLoading } from "@mono/shared_ui/hooks/use-loading";
import {
  ISubscription,
  SubscriptionPlan,
} from "@mono/shared_ui/interfaces/plans";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Plans from "../create-organization/componnets/plans";

import { useActiveOrganization } from "@/providers/active-organization-provider";
import GenericModal from "@mono/shared_ui/components/shared/generic-modal";
import { SiteHeader } from "@mono/shared_ui/components/shared/site-header";
import { format } from "date-fns";
import OTPHandler from "@/components/shared/otp-handler";
import { OtpVerificationResponse } from "@mono/shared_ui/interfaces/otp";

const ChangePlan = () => {
  const location = useLocation();
  const { orgId } = useOrgContext();
  const { activeOrganization } = useActiveOrganization();

  const { currentSub } = useActiveOrganization();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const { hideLoading, loading, showLoading } = useLoading();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );
  const subscriptionRef = useRef<ISubscription | null>(null);
  const [otpToken, setOtpToken] = useState<OtpVerificationResponse | null>(
    null,
  );
  const [confirmModal, setConfirmModal] = useState(false);
  const navigate = useNavigate();
  const getPlans = async () => {
    try {
      const res = await getSubscriptionPlans();
      if (!res.error) {
        setPlans(res.data.filter((i) => i.name !== currentSub?.plan_name));
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
  };

  const handelConfirmPayment = async () => {
    if (!subscriptionRef.current) {
      showLoading();
      try {
        const res = await updateSubscription(
          activeOrganization!.id,
          currentSub!.id,
          {
            plan_id: selectedPlan!.id,
          },
          otpToken?.verification_token,
        );
        if (!res.error) {
          subscriptionRef.current = res.data;
          setOtpToken(null);
          navigate(`/${routeConstants.PAYMENT_SUCCESSFUL}`, {
            state: {
              org_name: activeOrganization?.name,
              org_id: activeOrganization?.id,
              type: "payment-updated",
            },
            replace: true,
          });
        }
      } catch (error) {
        toast.error(getAxiosErrorMessage(error));
        return;
      } finally {
        hideLoading();
      }
    }
  };
  useEffect(() => {
    if (currentSub) {
      getPlans();
    }
  }, [currentSub]);

  if (location.key == "default") {
    return <Navigate to={"/"} />;
  }

  return (
    <div className={"h-screen overflow-hidden flex flex-col"}>
      <SiteHeader
        title="Subscription Info"
        breadCrumbs={[
          {
            title: activeOrganization?.name,
            url: `/${orgId}/${routeConstants.DASHBOARD}`,
          },
          {
            title: "Subscription Info",
            url: `/${orgId}/organization/${routeConstants.TRANSACTIONS}`,
          },
          {
            title: "Change Plan",
            url: ``,
          },
        ]}
      />
      <div className="@container/main  overflow-auto grid grid-cols-1 al p-2 lg:ml-8">
        <div className="col-span-1 row-span-1">
          <div className="mb-2">Current Subscription</div>
          <div>
            {currentSub && (
              <div className="flex flex-wrap gap-2">
                <Card className="min-w-xs gap-2">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-end gap-1">
                      {currentSub.plan_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2  flex-wrap">
                      <span className="space-y-1">
                        <div className="text-sm font-semibold">
                          Subscription Start
                        </div>
                        <Badge variant={"green"}>
                          {format(currentSub.start_at, "PPP hh:mm:aa")}
                        </Badge>
                      </span>
                      <span className="space-y-1">
                        <div className="text-sm font-semibold">
                          Subscription End
                        </div>
                        <Badge variant={"red"}>
                          {format(currentSub.end_at, "PPP hh:mm:aa")}
                        </Badge>
                      </span>
                      <span className="space-y-1">
                        <div className="text-sm font-semibold">
                          Next Billing At
                        </div>

                        <Badge variant={"indigo"}>
                          {currentSub.next_billing_at &&
                            format(currentSub.next_billing_at, "PPP hh:mm:aa")}
                        </Badge>
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="min-w-xs gap-2">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-end gap-1">
                      Allowed Quota
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      {currentSub.quota_usage.map((i) => (
                        <div className="grid grid-cols-6">
                          <div className="col-span-3 capitalize">
                            {i.resource_type.toLowerCase()}
                          </div>
                          <div className="col-span-3 ">
                            {i.allowed_quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 col-span-1 row-span-1">Available Plans</div>
        <div className="w-full max-w-5xl overflow-auto flex-1 py-4 col-span-1 row-span-1">
          <Plans
            handlePayment={() => setConfirmModal(true)}
            handlePlanSelect={(_, plan) => setSelectedPlan(plan)}
            loading={loading}
            plans={plans}
            selectedPlan={selectedPlan?.id || null}
            cardContainerClassName=" !mx-0 w-full"
          />
        </div>
        <GenericModal
          open={confirmModal}
          onOpenChange={() => {
            setConfirmModal(false);
            setOtpToken(null);
          }}
          onConfirmClick={handelConfirmPayment}
          loading={loading}
          title={"Confirm Plan Change"}
          confirmButtonText="Change Plan"
          variant="success"
          descAsChild
          desc={
            <div>
              <div>
                Are you sure you want to change your current plan with{" "}
                <Badge variant={"blue"}>{selectedPlan?.name}</Badge>? This will
                take upto 5 minutes to reflect in the system. The money amount
                <Badge variant={"blue"}>
                  {selectedPlan?.currency}{" "}
                  {selectedPlan ? selectedPlan?.amount / 100 : 0}
                </Badge>{" "}
                will be automatically deduct from you linked payment method.
              </div>

              <div>
                <div className="py-2 font-bold underline">
                  Available Limits.
                </div>
                {selectedPlan?.entitlements.map((i) => (
                  <div className="grid grid-cols-6">
                    <div className="col-span-3 capitalize">
                      {i.resource_type.toLowerCase()}
                    </div>
                    <div className="col-span-3 ">{i.quantity}</div>
                  </div>
                ))}
              </div>
              <div className="my-2 mt-4">
                Please enter the OTP send to your mail to confirm.
              </div>
              <div>
                <OTPHandler
                  onOTPConfirm={setOtpToken}
                  actionType={"CHANGE_PLAN"}
                />
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default ChangePlan;
