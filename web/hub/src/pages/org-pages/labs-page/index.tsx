import { routeConstants } from "@/constants/route.constants";
import { ILabType } from "@/interfaces/labs";
import { useOrgContext } from "@/providers/organization-provider";
import { getAllLabs } from "@/services/labs.service";
import { SiteHeader } from "@mono/shared_ui/components/shared/site-header";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mono/shared_ui/components/ui/avatar";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@mono/shared_ui/components/ui/card";
import { Skeleton } from "@mono/shared_ui/components/ui/skeleton";
import { DataWithLoading } from "@mono/shared_ui/interfaces/utils";
import { cn, getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { Circle, CircleDot, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const LabsPage = () => {
  const [labs, setLabs] = useState<DataWithLoading<ILabType[]>>({
    data: [],
    loading: false,
  });
  const { orgId } = useOrgContext();
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

  return (
    <>
      <SiteHeader title="My Labs"></SiteHeader>
      <div className="@container/main flex flex-1 flex-col gap-2 p-2 overflow-hidden mt-2">
        {labs?.data.length ? (
          <div className="lg:mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2 overflow-auto">
            {labs?.data?.map((i) => (
              <Card
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
    </>
  );
};

export default LabsPage;
