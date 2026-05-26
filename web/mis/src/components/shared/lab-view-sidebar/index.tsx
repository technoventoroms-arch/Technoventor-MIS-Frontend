import { LabSwitcher } from "@/components/shared/lab-info";
import { routeConstants } from "@/constants/route.constants";
import { useLabContext } from "@/providers/lab-provider";
import { useOrgContext } from "@/providers/organization-provider";
import { useUser } from "@/providers/user-info-provider";
import { SidebarNavUser } from "@mono/shared_ui/components/shared/nav-user";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@mono/shared_ui/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@mono/shared_ui/components/ui/sidebar";
import { Skeleton } from "@mono/shared_ui/components/ui/skeleton";
import {
  ArrowLeft,
  Cpu,
  CreditCardIcon,
  FileText,
  KanbanSquare,
  LayoutDashboard,
  Package,
  ScanBarcode,
  ShoppingCart,
  ThumbsUp,
  UserCheck,
  UserCircleIcon,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Session from "supertokens-auth-react/recipe/session";
import { NavMain } from "../nav-main";
import { PERMISSIONS } from "@mono/shared_ui/interfaces/permissions";

export function LabViewSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { orgId } = useOrgContext();
  const { user } = useUser();
  const { labData, loading, labId, permissions } = useLabContext();

  const navigate = useNavigate();
  const logout = async () => {
    await Session.signOut();
    window.location.href = "/login"; // or to wherever your logic page is
  };
  const baseUrl = `/${orgId}/${routeConstants.LAB}/${labId}`;

  const option = useMemo(() => {
    const options = [
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
      {
        title: "Cart",
        url: `${baseUrl}/${routeConstants.CART}`,
        icon: ShoppingCart,
      },
      {
        title: "My Orders",
        url: `${baseUrl}/${routeConstants.ORDERS}`,
        icon: FileText,
      },
      {
        title: "My Attendance",
        url: `${baseUrl}/${routeConstants.ATTENDANCE}`,
        icon: UserCheck,
      },
      {
        title: "Scan Machine",
        url: `${baseUrl}/${routeConstants.SCAN_MACHINE}`,
        icon: ScanBarcode,
      },
    ];

    if (
      permissions?.has(PERMISSIONS.APPROVE_INVENTORY) &&
      permissions?.has(PERMISSIONS.APPROVE_ATTENDANCE)
    ) {
      options.push({
        title: "Approvals",
        url: `${baseUrl}/${routeConstants.APPROVALS}`,
        icon: ThumbsUp,
      });
    }
    return options;
  }, [permissions]);
  const handleEditLabClick = () => {
    navigate(`${baseUrl}/${routeConstants.EDIT_LAB}`);
  };
  const handleEditProfileClick = () => {
    navigate(`/${routeConstants.PROFILE}`);
  };
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
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip={"Back To My Labs"}
            variant={"default"}
            onClick={() => navigate(`/${orgId}/${routeConstants.LABS}`)}
            className="cursor-pointer"
          >
            <ArrowLeft /> Back to Labs
          </SidebarMenuButton>
        </SidebarMenuItem>
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
            <DropdownMenuItem onClick={handleEditLabClick}>
              <UserCircleIcon />
              Lab
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEditProfileClick}>
              <CreditCardIcon />
              Profile
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </SidebarNavUser>
      </SidebarFooter>
    </Sidebar>
  );
}
