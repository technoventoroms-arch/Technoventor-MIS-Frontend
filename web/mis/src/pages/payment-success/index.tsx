import { routeConstants } from "@/constants/route.constants";
import { useOrgContext } from "@/providers/organization-provider";
import { useUser } from "@/providers/user-info-provider";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@mono/shared_ui/components/ui/card";
import { useLoading } from "@mono/shared_ui/hooks/use-loading";
import { cn } from "@mono/shared_ui/lib/utils";
import { Loader } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const { showLoading, loading } = useLoading();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { fetchOrganizations } = useOrgContext();

  const handleNavigateClick = async () => {
    showLoading();
    await new Promise((resolve) => {
      setTimeout(() => resolve(""), 5000);
    });
    if (state.org_id) {
      await fetchOrganizations();
      navigate(`/${state.org_id}/${routeConstants.LABS}`, {
        replace: true,
      });
      return;
    }
    await fetchOrganizations();
    navigate("/", { replace: true });
  };

  if (!state) {
    return <Navigate to={"/"} />;
  }
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Card tabIndex={0} className={cn(`min-w-72 max-w-md`)}>
        <CardHeader>
          <CardTitle className="text-xl">Payment Successful 🎉</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            Hi {user?.first_name} {user?.last_name},
          </div>
          <div>
            We've received your payment for your organization{" "}
            <Badge className="mx-2" variant={"green"}>
              {state?.org_name || "--"}
            </Badge>
            {state?.type == "payment-updated" ? (
              <>
                . Your plan is now updated and ready to use. This may take a
                minute or more to reflect on your system.
              </>
            ) : (
              <>
                . Your organization is now active and ready to use. This may
                take a minute to reflect on your system.
              </>
            )}
          </div>

          <div>
            What`s next: -
            <ul className="list-disc list-inside">
              <li>Create Labs,</li>
              <li>Invite teammates,</li>
              <li>Create Projects and many more</li>
            </ul>
          </div>
          <div>
            If you have any questions, reply to this email or contact support at{" "}
            {import.meta.env["VITE_PUBLIC_SUPPORT_EMAIL"]}.
          </div>

          <Button
            onClick={handleNavigateClick}
            variant={"green"}
            className="w-full"
          >
            {loading ? <Loader className="animate-spin" /> : "Back To Home"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
