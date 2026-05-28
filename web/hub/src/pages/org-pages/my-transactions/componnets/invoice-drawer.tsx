import { getSubscriptionInvoices } from "@/services/payment.services";
import RepeatElement from "@mono/shared_ui/components/shared/repeat-element";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Skeleton } from "@mono/shared_ui/components/ui/skeleton";
import { useLoading } from "@mono/shared_ui/hooks/use-loading";
import { IInvoice } from "@mono/shared_ui/interfaces/invoices";
import { ISubscription } from "@mono/shared_ui/interfaces/plans";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  subscription: ISubscription;
  orgId: number;
};

const InvoiceDrawer = ({ subscription, orgId }: Props) => {
  const { hideLoading, loading, showLoading } = useLoading();
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const getInvoices = async () => {
    showLoading();
    try {
      const res = await getSubscriptionInvoices(orgId, subscription.id);
      if (!res.error) {
        setInvoices(res.data);
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      hideLoading();
    }
  };
  useEffect(() => {
    getInvoices();
  }, []);
  return (
    <div className="flex-1 flex flex-col overflow-y-scroll gap-2">
      {loading ? (
        <RepeatElement>
          <Skeleton className="h-40 mx-4" />
        </RepeatElement>
      ) : (
        invoices.map((inv) => {
          return (
            <div className="flex-1 px-6 pb-4 space-y-6 not-last:border-b">
              <section>
                <h3 className="text-md font-medium ">Invoice Info</h3>
                <div className="mt-2 text-sm space-y-1">
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    <Badge variant={"indigo"}>
                      {inv.status?.toUpperCase()}
                    </Badge>
                  </p>
                  <p>
                    <span className="font-medium">Amount:</span>{" "}
                    <Badge variant={"green"}>
                      {" "}
                      {(inv.amount / 100).toFixed(2)} {inv.currency}
                    </Badge>
                  </p>
                  <p>
                    <span className="font-medium">Issued:</span>{" "}
                    <Badge variant={"yellow"}>
                      {format(inv.issued_at, "PPP hh:mm:aa")}
                    </Badge>
                  </p>
                  {inv.paid_at && (
                    <p>
                      <span className="font-medium">Paid:</span>{" "}
                      <Badge variant={"blue"}>
                        {format(inv.paid_at, "PPP hh:mm:aa")}
                      </Badge>
                    </p>
                  )}
                  {inv.provider_invoice_id && (
                    <p>
                      <span className="font-medium">Invoice Id:</span>{" "}
                      <Badge variant={"gray"}>{inv.provider_invoice_id}</Badge>
                    </p>
                  )}
                </div>
              </section>
              <section>
                <h3 className="text-sm font-medium text-gray-500 dark:text-white">
                  Payments
                </h3>
                <div className="mt-3 space-y-3">
                  {inv.payments.map((p) => (
                    <div
                      key={p.id}
                      className="border rounded-lg p-4 shadow-sm bg-gray-50 dark:bg-neutral-900"
                    >
                      <p className="font-medium">
                        {p.method.toUpperCase()} — {(p.amount / 100).toFixed(2)}{" "}
                        {p.currency}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-white">
                        Status: {p.status}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-white">
                        Fee: {(p.fee / 100).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-white">
                        Tax: {(p.tax / 100).toFixed(2)}
                      </p>
                      {p.method === "card" && (
                        <p className="text-sm text-gray-600 dark:text-white">
                          Card: {p.card_network} •••• {p.card_last4} (
                          {p.card_type})
                        </p>
                      )}
                      {p.method === "upi" && (
                        <p className="text-sm text-gray-600 dark:text-white">
                          VPA: {p.vpa}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 dark:text-white">
                        Contact: {p.contact}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-white">
                        Email: {p.email}
                      </p>
                      {p.provider_payment_id && (
                        <p>
                          <span className="text-sm text-gray-600 dark:text-white">
                            Payment Id:
                          </span>{" "}
                          <Badge variant={"gray"}>
                            {p.provider_payment_id}
                          </Badge>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          );
        })
      )}
    </div>
  );
};

export default InvoiceDrawer;
