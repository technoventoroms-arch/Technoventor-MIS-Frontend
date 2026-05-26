import { Button } from "@mono/shared_ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@mono/shared_ui/components/ui/card";
import { SubscriptionPlan } from "@mono/shared_ui/interfaces/plans";
import { cn } from "@mono/shared_ui/lib/utils";
import { CheckCircle2Icon, IndianRupee, Loader, Send } from "lucide-react";
type Props = {
  plans: SubscriptionPlan[];
  handlePlanSelect: (planId: number, plan: SubscriptionPlan) => void;
  selectedPlan: number | null;
  handlePayment: () => void;
  loading: boolean;
  cardContainerClassName?: string;
};

const Plans = ({
  plans,
  handlePlanSelect,
  selectedPlan,
  handlePayment,
  loading,
  cardContainerClassName = "",
}: Props) => {
  return (
    <div className="flex flex-col gap-4 items-center">
      <div
        className={cn(
          "flex flex-wrap gap-4 mx-auto justify-center",
          cardContainerClassName
        )}
      >
        {plans.map((i) => (
          <Card
            key={i.id}
            onClick={() => handlePlanSelect(i.id, i)}
            role="button"
            className="min-w-xs hover:scale-105 transition-transform cursor-pointer"
          >
            <CardHeader>
              <CardTitle className="text-3xl flex items-end gap-1">
                <IndianRupee className="" />
                <span className="-mb-1">{i.amount / 100}</span>
                <span className="font-normal text-sm">/month</span>
                {selectedPlan == i.id && (
                  <CheckCircle2Icon className="ml-auto text-green-600" />
                )}
              </CardTitle>
              <CardDescription className="text-md">{i.name}</CardDescription>
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
        ))}
      </div>
      <div>
        <Button
          onClick={handlePayment}
          disabled={!selectedPlan}
          variant={"green"}
          size={"lg"}
        >
          {loading ? (
            <>
              <Loader className="animate-spin" /> Processing you subscription...
            </>
          ) : (
            <>
              <Send /> Checkout
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Plans;
