import { LabSwitcher } from "@/components/shared/lab-switcher";
import { routeConstants } from "@/constants/route.constants";
import { useLabContext } from "@/providers/lab-provider";
import { useUser } from "@/providers/user-info-provider";
import { SidebarNavUser } from "@mono/shared_ui/components/shared/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@mono/shared_ui/components/ui/sidebar";
import { Skeleton } from "@mono/shared_ui/components/ui/skeleton";
import {
  ArrowLeft,
  Cpu,
  KanbanSquare,
  LayoutDashboard,
  Package,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Session from "supertokens-auth-react/recipe/session";
import { NavMain } from "../nav-main";
import { useOrgContext } from "@/providers/organization-provider";

export function LabViewSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  const { labData, loading } = useLabContext();
  const { orgId } = useOrgContext();
  const navigate = useNavigate();
  const { labId } = useParams();
  const baseUrl = `/${orgId}/${routeConstants.LAB}/${labId}`;
  const logout = async () => {
    await Session.signOut();
    window.location.href = "/login"; // or to wherever your logic page is
  };
  const option = useMemo(() => {
    return [
      {
        title: "Dashboard",
        url: `${baseUrl}/`,
        icon: LayoutDashboard,
      },
      {
        title: "Projects",
        url: `${baseUrl}/${routeConstants.PROJECTS}`,
        icon: KanbanSquare,
      },
      {
        title: "Machines",
        url: `${baseUrl}/${routeConstants.MACHINES}`,
        icon: Cpu,
      },
      {
        title: "Inventory",
        url: `${baseUrl}/${routeConstants.INVENTORY}`,
        icon: Package,
      },
      {
        title: "Users",
        url: `${baseUrl}/${routeConstants.USERS}`,
        icon: Users,
      },
    ];
  }, []);
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <LabSwitcher loading={loading} lab={labData} />
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
            <SidebarMenuButton
              onClick={() => navigate(`/${orgId}/${routeConstants.LABS}`)}
            >
              <ArrowLeft /> Back to Labs
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarNavUser
          user={{
            avatar: "",
            email: user?.email || "",
            name: user?.first_name || "",
          }}
          onLogoutClick={logout}
        ></SidebarNavUser>
      </SidebarFooter>
    </Sidebar>
  );
}
