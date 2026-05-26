import { routeConstants } from "@/constants/route.constants";
import { useActiveOrganization } from "@/providers/active-organization-provider";
import {
  getSubscriptionData,
  getSubscriptionPlans,
} from "@/services/payment.services";
import { loadScript } from "@/utils/razorpay-script";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import { useLoading } from "@mono/shared_ui/hooks/use-loading";
import { ISubscription } from "@mono/shared_ui/interfaces/plans";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Plans from "../create-organization/componnets/plans";

const ContinuePayment = ({ showModal }: { showModal: boolean }) => {
  const [showPayModal, setShowPayModal] = useState(showModal);

  const { activeOrganization } = useActiveOrganization();

  const [plans, setPlans] = useState<any[]>([]);
  const { hideLoading, loading, showLoading } = useLoading();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const subscriptionRef = useRef<ISubscription | null>(null);
  const razorPayRef = useRef(null);

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
        const res = await getSubscriptionData(activeOrganization!.id, {
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
      name: `Billing for ${activeOrganization?.name}`,
      description: `Billing for ${activeOrganization?.name} subscription`,
      handler: function (paymentResult: any) {
        navigate(`/${routeConstants.PAYMENT_SUCCESSFUL}`, {
          state: {
            ...paymentResult,
            org_name: activeOrganization?.name,
            org_id: activeOrganization?.id,
          },
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

  return showPayModal
    ? createPortal(
        <div
          className={
            "h-screen overflow-hidden flex flex-col z-[99999] absolute top-0 left-0 right-0 bg-background"
          }
        >
          <div className="@container/main flex flex-1 flex-col gap-2 p-2 overflow-hidden mt-2">
            <Button
              rounded={"md"}
              className="absolute right-10 top-5"
              onClick={() => setShowPayModal(false)}
              variant={"red"}
              title="close"
            >
              <X />
            </Button>
            <div className="max-w-md mx-auto w-full text-xl mb-2  gap-2 text-balance text-center">
              Select a plan to continue using the services for organization{" "}
              <Badge variant={"indigo"} className="text-xl">
                {activeOrganization?.name}
              </Badge>
            </div>
            <div className="w-full max-w-5xl mx-auto overflow-auto flex-1 py-4">
              <Plans
                handlePayment={handlePayment}
                handlePlanSelect={setSelectedPlan}
                loading={loading}
                plans={plans}
                selectedPlan={selectedPlan}
              />
            </div>
          </div>
        </div>,
        document.body
      )
    : null;
};

export default ContinuePayment;
