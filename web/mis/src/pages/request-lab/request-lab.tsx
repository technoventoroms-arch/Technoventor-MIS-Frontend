import OrgPageUsers from "@/components/shared/org-page-user";
import { routeConstants } from "@/constants/route.constants";
import { IAvailableLab } from "@/interfaces/labs";
import { useUser } from "@/providers/user-info-provider";
import {
  fetchAllNotJoinedLabs,
  requestLabToJoin,
} from "@/services/labs.service";
import GenericModal from "@mono/shared_ui/components/shared/generic-modal";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@mono/shared_ui/components/ui/breadcrumb";
import { Button } from "@mono/shared_ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@mono/shared_ui/components/ui/card";
import { Input } from "@mono/shared_ui/components/ui/input";
import { Skeleton } from "@mono/shared_ui/components/ui/skeleton";
import { useLoading } from "@mono/shared_ui/hooks/use-loading";
import {
  IGenericQueryParam,
  PaginatedData,
  PaginatedDataWithLoading,
} from "@mono/shared_ui/interfaces/utils";
import { cn, debounce, getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { Building2, Loader, PlusCircle } from "lucide-react";
import { BaseSyntheticEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const RequestLab = () => {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [availableLabs, setOrganizations] = useState<
    PaginatedDataWithLoading<IAvailableLab>
  >({
    records: [],
    loading: false,
    count: 0,
    skip: 0,
    take: 0,
  });
  const navigate = useNavigate();
  const [confirmJoinLab, setConfirmJoinLab] = useState<IAvailableLab | null>();
  const { hideJoiningLabLoading, JoiningLabloading, showJoiningLabLoading } =
    useLoading("JoiningLab");

  const handleClick = (lab: IAvailableLab) => {
    setConfirmJoinLab(lab);
  };

  const fetchLabs = async (params: IGenericQueryParam) => {
    let res: PaginatedData<IAvailableLab> = {
      count: 0,
      records: [],
      skip: 0,
      take: 0,
    };
    try {
      const data = await fetchAllNotJoinedLabs(params);
      if (!data.error) {
        res = data.data;
        res.records = res.records || [];
      }
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
    }
    return res;
  };

  const getOrganizationsToJoin = async () => {
    setOrganizations({
      records: [],
      count: 0,
      skip: 0,
      take: 0,
      loading: true,
    });

    try {
      const res = await fetchLabs({ skip: 0, take: 1 });

      setOrganizations(() => ({
        ...res,
        records: res.records,
        loading: false,
      }));
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
      setOrganizations({
        records: [],
        count: 0,
        skip: 0,
        take: 0,
        loading: false,
      });
    }
  };
  const handleShowMore = async () => {
    setOrganizations((prev) => ({
      ...prev,
      loading: true,
    }));

    try {
      const res = await fetchLabs({
        skip: availableLabs.skip + availableLabs.take,
        take: availableLabs.take,
        searchQuery: encodeURIComponent(searchQuery),
      });

      setOrganizations((prev) => ({
        ...res,
        records: prev.records.concat(res.records),
        loading: false,
      }));
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
      setOrganizations({
        records: [],
        count: 0,
        skip: 0,
        take: 0,
        loading: false,
      });
    }
  };

  useEffect(() => {
    getOrganizationsToJoin();
  }, []);

  const handleConfirmJoinLab = async () => {
    showJoiningLabLoading();
    try {
      const res = await requestLabToJoin(
        confirmJoinLab!.organisation_id,
        confirmJoinLab!.lab_id,
      );
      if (!res.error) {
        toast.success("Join request sent successfully");
        setConfirmJoinLab(null);
        getOrganizationsToJoin();
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      hideJoiningLabLoading();
    }
  };

  const handleSearch = async (e: BaseSyntheticEvent) => {
    setSearchQuery(e.target.value);
    setOrganizations((prev) => ({
      ...prev,
      loading: true,
    }));

    try {
      const res = await fetchLabs({
        skip: 0,
        take: availableLabs.take,
        searchQuery: encodeURIComponent(e.target.value),
      });

      setOrganizations(() => ({
        ...res,
        records: res.records,
        loading: false,
      }));
    } catch (error: any) {
      toast.error(getAxiosErrorMessage(error));
      setOrganizations({
        records: [],
        count: 0,
        skip: 0,
        take: 0,
        loading: false,
      });
    }
  };

  const debounceSearch = useMemo(() => debounce(handleSearch, 500), []);
  return (
    <div className={"max-h-svh flex flex-col overflow-hidden"}>
      <div className="w-full text-lg p-2 px-4 border-b flex justify-between">
        <div className="flex items-center">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbPage className="text-base font-medium">
                <Link to="/">All Organizations</Link>
              </BreadcrumbPage>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="text-base font-medium">
                Join Labs
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <span className="ml-auto flex items-center">
          {user?.is_verified && (
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
          )}
          <OrgPageUsers />
        </span>
      </div>
      <div className="@container/main flex-1  gap-2 p-2 overflow-auto mt-2">
        <div className="sticky top-0 bg-background z-10">
          <div className="px-2 mb-4 flex justify-center">
            <Input
              onChange={debounceSearch}
              placeholder="Search Labs"
              className="max-w-sm"
              disabled={availableLabs.loading}
            />
          </div>
        </div>
        {availableLabs.count > 0 ? (
          <div className=" lg:mx-auto max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
            {availableLabs.records?.map((i) => (
              <Card
                key={i.lab_id}
                role="button"
                tabIndex={0}
                className={cn(`min-w-72`, i.is_active && "cursor-pointer ")}
                onClick={() => handleClick(i)}
              >
                <CardHeader>
                  <CardTitle>{i.name}</CardTitle>
                  <CardDescription className="flex gap-2 mt-1">
                    <Building2 size={16} /> {i.organisation_name || "--"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>Address</div>
                  <div className="text-sm text-muted-foreground my-1 mb-2">
                    <div>
                      {[
                        i.address_1?.trim(),
                        i.address_2?.trim(),
                        i.address_3?.trim(),
                      ]
                        .filter(Boolean)
                        .join(", ") || "--"}
                    </div>
                    <div>
                      {[
                        i.city?.trim(),
                        i.zipcode?.trim(),
                        i.state?.trim(),
                        i.country?.trim(),
                      ]
                        .filter(Boolean)
                        .join(", ") || "--"}
                    </div>
                  </div>
                  <Badge
                    className="rounded-full"
                    variant={i.is_active ? "green" : "red"}
                  >
                    {i.is_active ? "Active" : "InActive"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
            {availableLabs.records.length < availableLabs.count && (
              <div className="col-span-full flex justify-center">
                <Button
                  disabled={availableLabs.loading}
                  variant={"green"}
                  onClick={handleShowMore}
                >
                  Show More Labs{" "}
                  {availableLabs.loading && <Loader className="animate-spin" />}
                </Button>
              </div>
            )}
          </div>
        ) : availableLabs.loading ? (
          <div className=" lg:mx-auto max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
            {Array.from({ length: 5 })?.map(() => (
              <Card className={cn(`min-w-60 min-h-60`)}>
                <Skeleton />
              </Card>
            ))}
          </div>
        ) : (
          <div className="mx-auto">
            <Card tabIndex={0} className={cn(`min-w-72 max-w-80`)}>
              <CardContent>
                There are no active labs to join. Please check back later or
                create a Organization and add lab.
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <GenericModal
        open={!!confirmJoinLab}
        onOpenChange={() => {
          setConfirmJoinLab(null);
        }}
        onConfirmClick={handleConfirmJoinLab}
        loading={JoiningLabloading}
        title={"Confirm Join Lab"}
        confirmButtonText={"Join"}
        variant={"success"}
        descAsChild
        desc={
          <div className="space-y-2">
            <div>
              Are you sure you want to join{" "}
              <Badge
                variant={"indigo"}
                className="mx-2"
                fontWeight={"semibold"}
              >
                {confirmJoinLab?.name}
              </Badge>{" "}
              lab of organization{" "}
              <Badge
                variant={"indigo"}
                className="mx-2"
                fontWeight={"semibold"}
              >
                {confirmJoinLab?.organisation_name}
              </Badge>
              ?
            </div>
          </div>
        }
      />
    </div>
  );
};

export default RequestLab;
