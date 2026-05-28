import { routeConstants } from "@/constants/route.constants";
import { useUser } from "@/providers/user-info-provider";
import { fetchAllOrganization } from "@/services/organization.service";
import { SiteHeader } from "@mono/shared_ui/components/shared/site-header";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mono/shared_ui/components/ui/avatar";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@mono/shared_ui/components/ui/card";
import { Organization } from "@mono/shared_ui/interfaces/organization";
import { PaginatedDataWithLoading } from "@mono/shared_ui/interfaces/utils";
import { cn } from "@mono/shared_ui/lib/utils";
import {
  Circle,
  CircleDot,
  CreditCard,
  Loader,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const OrganizationsPage = () => {
  const navigate = useNavigate();
  const handleClick = (id: number) => {
    navigate(`/${id}/${routeConstants.LABS}`);
  };
  const { user } = useUser();
  const ref = useRef(true);

  const [organizations, setOrganizations] = useState<
    PaginatedDataWithLoading<Organization>
  >({
    count: 0,
    records: [],
    loading: true,
    skip: 0,
    take: 10,
  });

  const fetchOrganizations = async (skip: number, take: number) => {
    let data: PaginatedDataWithLoading<Organization> = {
      count: 0,
      records: [],
      loading: false,
      skip: 0,
      take: 10,
    };
    try {
      const res = await fetchAllOrganization({
        skip: skip,
        take: take,
      });
      if (!res.error) {
        data = {
          ...res.data,
          loading: false,
        };
      }
    } catch (error: any) {
      toast.error(error.response.data || "Something went wrong");
    }
    return data;
  };
  const getOrganizations = async () => {
    setOrganizations({ ...organizations, loading: true });
    const res = await fetchOrganizations(
      organizations.skip,
      organizations.take,
    );
    setOrganizations(res);
  };
  const getPaginatedOrganizations = async () => {
    setOrganizations({ ...organizations, loading: true });
    const res = await fetchOrganizations(
      organizations.skip + organizations.take,
      organizations.take,
    );
    setOrganizations({
      ...res,
      records: [...organizations.records, ...(res.records || [])],
    });
  };

  useEffect(() => {
    if (user && organizations.records.length == 0 && ref.current) {
      ref.current = false;
      getOrganizations();
    }
  }, [user]);

  return (
    <>
      <SiteHeader title="Organizations" />
      <div className="@container/main flex-1  gap-2 p-2 overflow-auto mt-2">
        {organizations.records?.length ? (
          <div className="pb-8 lg:mx-auto max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
            {organizations.records?.map((i) => (
              <Card
                key={i.id}
                role="button"
                tabIndex={0}
                className={cn(`min-w-72`, i.is_active && "cursor-pointer ")}
                onClick={() => handleClick(i.id)}
              >
                <CardHeader>
                  <CardTitle>{i.name}</CardTitle>
                  <CardDescription>{i.description || "--"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 ">
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
                  <div className="flex items-center gap-2 ">
                    <CreditCard className="h-5 w-5 text-green-700/70 dark:text-green-300/70" />

                    <Badge
                      className="rounded-full"
                      variant={i.has_active_subscription ? "green" : "red"}
                    >
                      {i.has_active_subscription ? "Active" : "InActive"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs mt-2">
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
                  <div className="flex items-center gap-2 ">
                    <MapPin className="h-5 w-5 text-green-700/70 dark:text-green-300/70" />{" "}
                    {i.city}, {i.state}, {i.zipcode} - {i.country}
                  </div>
                </CardContent>
              </Card>
            ))}
            {organizations.count >= organizations.skip + organizations.take && (
              <div className="col-span-full flex items-center justify-center">
                <Button
                  variant={"blue"}
                  onClick={getPaginatedOrganizations}
                  disabled={organizations.loading}
                >
                  {organizations.loading ? (
                    <Loader className="animate-spin" />
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="mx-auto">
            {organizations.loading ? (
              <Loader className="animate-spin" />
            ) : (
              <Card tabIndex={0} className={cn(`min-w-72 max-w-80`)}>
                <CardContent>There are no organizations available.</CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default OrganizationsPage;
