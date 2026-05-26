import { LabSwitcher } from "@/components/shared/lab-info";
import { routeConstants } from "@/constants/route.constants";
import { useLabContext } from "@/providers/lab-provider";
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
} from "@mono/shared_ui/components/ui/sidebar";
import { Skeleton } from "@mono/shared_ui/components/ui/skeleton";
import {
  Cpu,
  CreditCardIcon,
  FileText,
  KanbanSquare,
  LayoutDashboard,
  Package,
  ScanBarcode,
  ShoppingCart,
  UserCheck,
  UserCircleIcon,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Session from "supertokens-auth-react/recipe/session";
import { NavMain } from "../nav-main";

export function OrgViewSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  const { labData, loading } = useLabContext();
  const navigate = useNavigate();
  const logout = async () => {
    await Session.signOut();
    window.location.href = "/login"; // or to wherever your logic page is
  };

  const option = useMemo(() => {
    const options = [
      {
        title: "Dashboard",
        url: `/`,
        icon: LayoutDashboard,
      },
      {
        title: "Projects",
        url: `/${routeConstants.PROJECTS}`,
        icon: KanbanSquare,
      },
      {
        title: "Machines",
        url: `/${routeConstants.MACHINES}`,
        icon: Cpu,
      },
      {
        title: "Inventory",
        url: `/${routeConstants.INVENTORY}`,
        icon: Package,
      },
      {
        title: "Users",
        url: `/${routeConstants.USERS}`,
        icon: Users,
      },
      {
        title: "Cart",
        url: `/${routeConstants.CART}`,
        icon: ShoppingCart,
      },
      {
        title: "My Orders",
        url: `/${routeConstants.ORDERS}`,
        icon: FileText,
      },
      {
        title: "My Attendance",
        url: `/${routeConstants.ATTENDANCE}`,
        icon: UserCheck,
      },
      {
        title: "Scan Machine",
        url: `/${routeConstants.SCAN_MACHINE}`,
        icon: ScanBarcode,
      },
    ];

    return options;
  }, []);
  const handleEditLabClick = () => {
    navigate(`/${routeConstants.EDIT_LAB}`);
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
