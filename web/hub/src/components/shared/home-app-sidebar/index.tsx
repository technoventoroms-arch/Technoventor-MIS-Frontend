import { routeConstants } from "@/constants/route.constants";
import { useUser } from "@/providers/user-info-provider";
import { SidebarNavUser } from "@mono/shared_ui/components/shared/nav-user";
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
import {
  Boxes,
  LayoutDashboard,
  Network,
  PieChartIcon,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Session from "supertokens-auth-react/recipe/session";
import { NavMain } from "../nav-main";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: `/${routeConstants.DASHBOARD}`,
      icon: LayoutDashboard,
    },
    {
      title: "Organizations",
      url: `/${routeConstants.ORGANIZATIONS}`,
      icon: Network,
    },
    {
      title: "Plans",
      url: `/${routeConstants.PLANS}`,
      icon: Users,
    },
  ],
  navSecondary: [],
};

export function HomeAppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  const navigate = useNavigate();
  const handleLogOut = async () => {
    await Session.signOut();
    navigate(`/${routeConstants.LOGIN}`);
  };
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Boxes />
              <span className="text-base font-semibold">Fab-Manage</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent className="flex flex-col gap-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={"Manage Reporting"}
                variant={"default"}
                className="cursor-pointer"
                asChild
              >
                <a
                  href={import.meta.env["VITE_PUBLIC_METABASE_ENDPOINT"]}
                  target="_blank"
                >
                  <PieChartIcon />
                  <span>{"Manage Reporting"}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarFooter>
        <SidebarNavUser
          onLogoutClick={handleLogOut}
          user={{
            avatar: "",
            email: user?.email || "",
            name: user?.first_name || "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
