import OrgPageUsers from "@/components/shared/org-page-user";
import { routeConstants } from "@/constants/route.constants";
import { useOrgContext } from "@/providers/organization-provider";
import { useUser } from "@/providers/user-info-provider";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbPage,
} from "@mono/shared_ui/components/ui/breadcrumb";
import { Button } from "@mono/shared_ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@mono/shared_ui/components/ui/card";
import { cn } from "@mono/shared_ui/lib/utils";
import { DoorOpen, PlusCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const OrganizationsPage = () => {
  const { user } = useUser();
  const { organizationData } = useOrgContext();
  const navigate = useNavigate();
  const handleClick = (id: number) => {
    navigate(`/${id}/${routeConstants.LABS}`);
  };

  return (
    <div className={"max-h-svh flex flex-col overflow-hidden"}>
      <div className="w-full text-lg p-2 px-4 border-b flex justify-between">
        <div className="flex items-center">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbPage className="text-base font-medium">
                My Organizations
              </BreadcrumbPage>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <span className="ml-auto flex items-center">
          {user?.is_verified && (
            <>
              {!!organizationData?.length && (
                <Button
                  className="mr-4"
                  variant={"indigo"}
                  size={"sm"}
                  onClick={() => {
                    navigate(`/${routeConstants.REQUEST_LAB}`);
                  }}
                  title="Join Lab"
                  rounded={"md"}
                >
                  <DoorOpen />
                  <span className="hidden md:block">Join Lab</span>
                </Button>
              )}
              <Button
                variant={"green"}
                size={"sm"}
                onClick={() => {
                  navigate(`/${routeConstants.CREATE_ORGANIZATIONS}`);
                }}
                title="Create New Organization"
                rounded={"md"}
              >
                <PlusCircle />
                <span className="hidden md:block">Create Org</span>
              </Button>
            </>
          )}
          <OrgPageUsers />
        </span>
      </div>
      <div className="@container/main flex-1  gap-2 p-2 overflow-auto mt-2">
        {organizationData?.length ? (
          <div className=" lg:mx-auto max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
            {organizationData?.map((i) => (
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
                <CardContent>
                  <Badge
                    className="rounded-full"
                    variant={i.is_active ? "green" : "red"}
                  >
                    {i.is_active ? "Active" : "InActive"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mx-auto flex flex-col items-center gap-4">
            <Card tabIndex={0} className={cn(`min-w-72 max-w-lg`)}>
              <CardContent>
                You don't have any organizations yet. Please check you
                <Link to={`/${routeConstants.PROFILE}`}>
                  <Badge variant={"indigo"} className="mx-2">
                    profile
                  </Badge>
                </Link>
                to see for organization invites or Create a new organization to
                get started. You can also join existing organizations. Join
                existing lab{" "}
                <Button
                  variant={"indigo"}
                  size={"sm"}
                  onClick={() => {
                    navigate(`/${routeConstants.REQUEST_LAB}`);
                  }}
                  title="Join Lab"
                  rounded={"md"}
                  className="mr-4"
                >
                  <DoorOpen />
                  <span className="hidden md:block">Join Lab</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationsPage;
