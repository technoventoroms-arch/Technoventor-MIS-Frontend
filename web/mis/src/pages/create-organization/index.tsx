import OrgPageUsers from "@/components/shared/org-page-user";
import { routeConstants } from "@/constants/route.constants";
import { useOrgContext } from "@/providers/organization-provider";
import {
  getSubscriptionData,
  getSubscriptionPlans,
} from "@/services/payment.services";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@mono/shared_ui/components/ui/breadcrumb";
import { Button } from "@mono/shared_ui/components/ui/button";
import { useLoading } from "@mono/shared_ui/hooks/use-loading";
import { Organization } from "@mono/shared_ui/interfaces/organization";
import { ISubscription } from "@mono/shared_ui/interfaces/plans";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import OrgInfo from "./componnets/org-info";
import Plans from "./componnets/plans";
import { loadScript } from "@/utils/razorpay-script";

const CreateOrganization = () => {
  const { addOrganization } = useOrgContext();
  const razorPayRef = useRef(null);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const subscriptionRef = useRef<ISubscription | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const { hideLoading, loading, showLoading } = useLoading();
  const [orgInfo, setOrgInfo] = useState<Organization | null>(null);
  const navigate = useNavigate();
  const getPlans = async () => {
    try {
      const res = await getSubscriptionPlans();
      if (!res.error) {
        setPlans(res.data);
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
  };
  const setupRazorPay = async () => {
    const res = await loadScript(import.meta.env["VITE_PUBLIC_RPAY_SCRIPT"]);
    if (!res) {
      toast.error("Unable to load payment gateway. Please try again later.");
      return;
    }
  };

  const handlePayment = async () => {
    if (!subscriptionRef.current) {
      showLoading();
      try {
        const res = await getSubscriptionData(orgInfo!.id, {
          plan_id: selectedPlan!,
        });
        if (!res.error) {
          subscriptionRef.current = res.data;
        }
      } catch (error) {
        toast.error(getAxiosErrorMessage(error));
        return;
      } finally {
        hideLoading();
      }
    }
    const subscription = subscriptionRef.current;

    const options = {
      key: import.meta.env["VITE_PUBLIC_RPAY_FE_KEY"], // Enter the Key ID generated from the Dashboard
      subscription_id: subscription!.provider_subscription_id,
      name: `Billing for ${orgInfo?.name}`,
      description: `Billing for ${orgInfo?.name} subscription`,
      handler: function (paymentResult: any) {
        navigate(`/${routeConstants.PAYMENT_SUCCESSFUL}`, {
          state: { ...paymentResult, org_name: orgInfo?.name },
          replace: true,
        });
      },
    };
    const rzp1 = new (window as any).Razorpay(options);
    razorPayRef.current = rzp1;
    rzp1.open();
  };
  useEffect(() => {
    getPlans();
    setupRazorPay();
  }, []);
  const handleSelectPlanStep = (e: any) => {
    addOrganization(e);

    setOrgInfo(e);
    setStep(2);
  };
  return (
    <div className={"h-screen overflow-hidden flex flex-col"}>
      <div className="w-full text-lg p-2 px-4 border-b flex justify-between">
        <div className="flex items-center">
          <Breadcrumb>
            <BreadcrumbList>
              <NavLink className="text-base font-medium" to={"/"}>
                <BreadcrumbItem>My Organizations</BreadcrumbItem>
              </NavLink>
              <BreadcrumbSeparator />
              <BreadcrumbPage>Create Organization</BreadcrumbPage>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <span className="ml-auto flex items-center">
          <OrgPageUsers />
        </span>
      </div>
      <div className="@container/main flex flex-1 flex-col gap-2 p-2 overflow-hidden mt-2">
        <div className="max-w-sm mx-auto w-full text-xl mb-2 flex items-center gap-2">
          {step != 1 && (
            <Button variant={"ghost"} onClick={() => setStep(1)}>
              <ArrowLeft />
              Back
            </Button>
          )}{" "}
          Create Organization Step{" "}
          <span className="font-bold underline">{step}</span> of 2
        </div>
        {step == 1 && (
          <div className="w-full max-w-3xl mx-auto overflow-auto flex-1">
            <OrgInfo
              defaultValues={orgInfo!}
              handleSubmit={handleSelectPlanStep}
              passToPayment={() => setStep(2)}
            />
          </div>
        )}
        {step == 2 && (
          <div className="w-full max-w-3xl mx-auto overflow-auto flex-1">
            <Plans
              plans={plans}
              handlePlanSelect={setSelectedPlan}
              selectedPlan={selectedPlan}
              handlePayment={handlePayment}
              loading={loading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateOrganization;
