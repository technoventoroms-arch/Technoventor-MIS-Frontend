import { routeConstants } from "@/constants/route.constants";
import { useActiveOrganization } from "@/providers/active-organization-provider";
import { useOrgContext } from "@/providers/organization-provider";
import { getMySubscriptions } from "@/services/organization.service";
import { cancelSubscription } from "@/services/payment.services";
import { loadScript } from "@/utils/razorpay-script";
import GenericModal from "@mono/shared_ui/components/shared/generic-modal";
import ResponsiveDrawer from "@mono/shared_ui/components/shared/responsive-drawer";
import { SiteHeader } from "@mono/shared_ui/components/shared/site-header";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@mono/shared_ui/components/ui/card";
import { DrawerContent } from "@mono/shared_ui/components/ui/drawer";
import { Input } from "@mono/shared_ui/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@mono/shared_ui/components/ui/table";
import { useLoading } from "@mono/shared_ui/hooks/use-loading";
import { ISubscription } from "@mono/shared_ui/interfaces/plans";
import { DataWithLoading } from "@mono/shared_ui/interfaces/utils";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { format } from "date-fns";
import { CreditCard, Receipt, Replace, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import InvoiceDrawer from "./componnets/invoice-drawer";

const MyTransactions = () => {
  const [mySubs, setMySubs] = useState<DataWithLoading<ISubscription[]>>({
    data: [],
    loading: false,
  });
  const [cancelSubModal, setCancelSubModal] = useState<ISubscription | null>(
    null
  );
  const [showInvoiceId, setShowInvoiceId] = useState<ISubscription | null>(
    null
  );
  const { hideLoading, loading, showLoading } = useLoading();
  const [orgName, setOrgName] = useState("");
  const razorPayRef = useRef(null);
  const navigate = useNavigate();
  const { fetchOrganizations, orgId } = useOrgContext();

  const { currentSub, activeOrganization, isOrgAdmin } =
    useActiveOrganization();
  const getAllSubscriptions = async () => {
    setMySubs({ data: [], loading: true });
    try {
      const res = await getMySubscriptions(orgId);
      if (!res.error) {
        setMySubs({ data: res.data, loading: true });
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
  };
  useEffect(() => {
    isOrgAdmin && getAllSubscriptions();
  }, []);

  const setupRazorPay = async () => {
    const res = await loadScript(import.meta.env["VITE_PUBLIC_RPAY_SCRIPT"]);
    if (!res) {
      toast.error("Unable to load payment gateway. Please try again later.");
      return;
    }
  };

  const handlePaymentMethodChange = () => {
    const options = {
      key: import.meta.env["VITE_PUBLIC_RPAY_FE_KEY"], // Enter the Key ID generated from the Dashboard
      subscription_id: currentSub!.provider_subscription_id,
      name: `Billing for ${activeOrganization?.name}`,
      description: `Billing for ${activeOrganization?.name} subscription`,
      subscription_card_change: true,

      handler: function () {
        toast.success("Payment Method Updated Successfully");
      },
    };
    const rzp1 = new (window as any).Razorpay(options);
    razorPayRef.current = rzp1;
    rzp1.open();
  };
  useEffect(() => {
    setupRazorPay();
  }, []);

  const showInvoice = (sub: ISubscription) => {
    setShowInvoiceId(sub);
  };

  const handleCancelSubscription = async () => {
    showLoading();
    try {
      const res = await cancelSubscription(orgId, cancelSubModal!.id);
      if (!res.error) {
        toast.success("Subscription Cancelled Successfully");
      }
      setOrgName("");
      setCancelSubModal(null);
      await fetchOrganizations();
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      hideLoading();
    }
  };
  if (!isOrgAdmin) {
    return <Navigate to={`/${routeConstants.UNAUTHORIZED}`} />;
  }
  return (
    <>
      <SiteHeader title="Subscription Info" />
      <div className="@container/main flex flex-1 overflow-auto flex-col gap-2 p-2 max-w-4xl lg:ml-8">
        <div className="min-w-full ">
          <div className="mb-2">Current Subscription</div>
          <div>
            {currentSub ? (
              <Card role="button" className="min-w-xs gap-2">
                <CardHeader>
                  <CardTitle className="text-xl flex items-end gap-1">
                    {currentSub.plan_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
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
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      rounded={"xs"}
                      variant={"purple"}
                      onClick={handlePaymentMethodChange}
                    >
                      <CreditCard /> Change Payment Method
                    </Button>
                    <Button
                      rounded={"xs"}
                      variant={"indigo"}
                      onClick={() => showInvoice(currentSub)}
                    >
                      <Receipt />
                      <span> View Invoice</span>
                    </Button>
                    <Button
                      rounded={"xs"}
                      variant={"red"}
                      onClick={() => {
                        setOrgName("");
                        setCancelSubModal(currentSub);
                      }}
                    >
                      <X />
                      <span>Cancel Subscription</span>
                    </Button>
                    <Button
                      rounded={"xs"}
                      variant={"yellow"}
                      onClick={() => {
                        navigate(
                          `/${orgId}/${routeConstants.ORGANIZATION}/${routeConstants.CHANGE_PLAN}`
                        );
                      }}
                    >
                      <Replace />
                      <span>Change Plan</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div>
                If you have done payment in last 5mins please be paitient it may
                take little time to sync.
              </div>
            )}
          </div>
          {mySubs.data.length > 1 && (
            <div className="mt-4">
              <div className="mb-2">Past Subscription</div>
              <Table containerClassName="rounded-lg border ">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Plan Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mySubs.data.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">
                        {sub.plan_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant={"indigo"}>{sub.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={"green"}>
                          {format(sub.start_at, "PPP hh:mm:aa")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={"red"}>
                          {sub.end_at
                            ? format(sub.end_at, "PPP hh:mm:aa")
                            : "--"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {sub.status?.toLowerCase() == "active" && (
                          <Button
                            onClick={() => showInvoice(sub)}
                            size={"sm"}
                            variant={"blue"}
                          >
                            <Receipt />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <GenericModal
        open={!!cancelSubModal}
        onOpenChange={() => {
          setOrgName("");
          setCancelSubModal(null);
        }}
        onConfirmClick={handleCancelSubscription}
        loading={loading}
        title={"Cancel Subscription"}
        confirmButtonText="Confirm"
        variant="danger"
        descAsChild
        disableConfirm={!(orgName == activeOrganization?.name)}
        desc={
          <div className="flex flex-col gap-2">
            Are you sure you want to cancel your current subscription ? This
            can't be undone. Please type the organization name{" "}
            <Badge variant={"red"}>{activeOrganization?.name}</Badge> below to
            confirm.
            <Input
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Enter organization name to confirm"
            />
          </div>
        }
      />

      <ResponsiveDrawer
        open={!!showInvoiceId}
        onOpenChange={() => {
          !loading && setShowInvoiceId(null);
        }}
        onAnimationEnd={() => {
          !loading && setShowInvoiceId(null);
        }}
      >
        <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[90vh] data-[vaul-drawer-direction=bottom]:mt-4!">
          <ResponsiveDrawer.Header
            title={`Invoice For ${showInvoiceId?.provider_subscription_id}`}
            description=" Modal for editing Inventory Item."
          />
          <InvoiceDrawer subscription={showInvoiceId!} orgId={orgId} />
        </DrawerContent>
      </ResponsiveDrawer>
    </>
  );
};

export default MyTransactions;
