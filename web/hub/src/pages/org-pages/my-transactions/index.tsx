import { routeConstants } from "@/constants/route.constants";
import { useActiveOrganization } from "@/providers/active-organization-provider";
import { useOrgContext } from "@/providers/organization-provider";
import { getMySubscriptions } from "@/services/organization.service";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@mono/shared_ui/components/ui/table";
import { ISubscription } from "@mono/shared_ui/interfaces/plans";
import { DataWithLoading } from "@mono/shared_ui/interfaces/utils";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { format } from "date-fns";
import { Receipt, Replace } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import InvoiceDrawer from "./componnets/invoice-drawer";

const MyTransactions = () => {
  const [mySubs, setMySubs] = useState<DataWithLoading<ISubscription[]>>({
    data: [],
    loading: false,
  });

  const [showInvoiceId, setShowInvoiceId] = useState<ISubscription | null>(
    null
  );

  const navigate = useNavigate();
  const { orgId } = useOrgContext();
  const { currentSub } = useActiveOrganization();
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
    getAllSubscriptions();
  }, []);

  const showInvoice = (sub: ISubscription) => {
    setShowInvoiceId(sub);
  };

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
                      variant={"indigo"}
                      onClick={() => showInvoice(currentSub)}
                    >
                      <Receipt />
                      <span> View Invoice</span>
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
                It seems you don't have any active subscription. If you have
                done payment in last 5mins please be patient it may take little
                time to sync.
              </div>
            )}
          </div>
          {mySubs.data?.length > 1 && (
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

      <ResponsiveDrawer
        open={!!showInvoiceId}
        onOpenChange={() => {
          setShowInvoiceId(null);
        }}
        onAnimationEnd={() => {
          setShowInvoiceId(null);
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
