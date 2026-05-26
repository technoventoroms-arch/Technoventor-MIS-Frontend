import { routeConstants } from "@/constants/route.constants";
import { useLabContext } from "@/providers/lab-provider";
import { useOrgContext } from "@/providers/organization-provider";
import { useUser } from "@/providers/user-info-provider";
import { SidebarNavUser } from "@mono/shared_ui/components/shared/nav-user";
import { Avatar, AvatarFallback } from "@mono/shared_ui/components/ui/avatar";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@mono/shared_ui/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@mono/shared_ui/components/ui/sidebar";
import { Skeleton } from "@mono/shared_ui/components/ui/skeleton";
import {
  ArrowLeft,
  Building,
  Building2,
  CreditCardIcon,
  LayoutDashboard,
  User2Icon,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Session from "supertokens-auth-react/recipe/session";
import { NavMain } from "../nav-main";
import { useActiveOrganization } from "@/providers/active-organization-provider";

export function AllLabsSidebar({
  labCount,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  labCount: number;
}) {
  const { orgId } = useOrgContext();
  const { activeOrganization, isOrgAdmin, limits } = useActiveOrganization();

  const { user } = useUser();
  const { loading } = useLabContext();
  const navigate = useNavigate();
  const logout = async () => {
    await Session.signOut();
    window.location.href = "/login"; // or to wherever your logic page is
  };

  const handleEditOrgClick = () => {
    navigate(`/${orgId}/${routeConstants.ORGANIZATION}`);
  };
  const handleEditProfileClick = () => {
    navigate(`/${routeConstants.PROFILE}`);
  };
  const handleOrgSubscriptionClick = () => {
    navigate(
      `/${orgId}/${routeConstants.ORGANIZATION}/${routeConstants.TRANSACTIONS}`
    );
  };

  const option = useMemo(() => {
    const options = [];

    if (isOrgAdmin) {
      options.push({
        title: "Dashboard",
        url: `/${orgId}/${routeConstants.DASHBOARD}`,
        icon: LayoutDashboard,
      });
    }
    options.push({
      title: "Labs",
      url: `/${orgId}/${routeConstants.LABS}`,
      icon: Building2,
    });
    if (isOrgAdmin) {
      options.push({
        title: "Users",
        url: `/${orgId}/${routeConstants.USERS}`,
        icon: Users,
      });
    }

    return options;
  }, [isOrgAdmin]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground "
            >
              {loading || !activeOrganization ? (
                <Skeleton className="h-8 w-full" />
              ) : (
                <>
                  <Avatar className="size-10 rounded-lg ">
                    <AvatarFallback className="rounded-lg uppercase">
                      {activeOrganization.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {activeOrganization.name}
                    </span>
                    <span className="truncate text-xs">
                      {activeOrganization.description}
                    </span>
                  </div>
                </>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {isOrgAdmin && limits.LAB?.allowed_quantity && (
          <SidebarGroup className="py-0">
            <SidebarGroupContent className="relative">
              <div>
                Lab Limit{" "}
                <span className="font-semibold">
                  {limits.LAB?.used_quantity}
                </span>{" "}
                / {limits.LAB?.allowed_quantity}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarHeader>
      <SidebarContent>
        {loading ? (
          <div className="p-4 space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <NavMain items={option} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => navigate(`/`)}>
              <ArrowLeft /> Back to My Organization
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarNavUser
          user={{
            avatar: user?.image_link || "",
            email: user?.email || "",
            name: user?.first_name || "",
          }}
          onLogoutClick={logout}
        >
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleEditOrgClick}>
              <Building />
              Organization
            </DropdownMenuItem>
            {isOrgAdmin && (
              <DropdownMenuItem onClick={handleOrgSubscriptionClick}>
                <CreditCardIcon />
                Subscriptions
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleEditProfileClick}>
              <User2Icon />
              Profile
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </SidebarNavUser>
      </SidebarFooter>
    </Sidebar>
  );
}
