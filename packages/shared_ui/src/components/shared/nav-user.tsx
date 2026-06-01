"use client";

import { LogOutIcon, Moon, MoreVerticalIcon, Sun } from "lucide-react";

import ThemeSwitcher from "@mono/shared_ui/components/shared/theme-switcher";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mono/shared_ui/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@mono/shared_ui/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@mono/shared_ui/components/ui/sidebar";
import { JSX, PropsWithChildren, useState } from "react";

export function SidebarNavUser(
  props: PropsWithChildren<{
    user: {
      name: string;
      email: string;
      avatar: string;
    };
    onLogoutClick?: () => void;
  }>
) {
  const { isMobile } = useSidebar();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <NavUser
          {...props}
          isMobile={isMobile}
          trigger={
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg ">
                <AvatarImage
                  src={props?.user?.avatar}
                  alt={props?.user?.name}
                />
                <AvatarFallback className="rounded-lg uppercase">
                  {props?.user?.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {props?.user?.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {props?.user?.email}
                </span>
              </div>
              <MoreVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          }
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export const NavUser = ({
  user,
  children,
  onLogoutClick,
  trigger,
  isMobile,
}: PropsWithChildren<{
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  trigger: JSX.Element;
  onLogoutClick?: () => void;
  isMobile?: boolean;
}>) => {
  const [dropDownOpen, setDropDownOpen] = useState(false);
  return (
    <DropdownMenu onOpenChange={setDropDownOpen} open={dropDownOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        {children}
        {/* Temporarily hide theme switcher
        <DropdownMenuSeparator />
        <ThemeSwitcher
          isMobile={!!isMobile}
          className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          {(darkMode) => (
            <>
              <Avatar className="size-4 flex items-center rounded-lg my-auto mr-2">
                {darkMode ? <Moon /> : <Sun />}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Theme</span>
              </div>
            </>
          )}
        </ThemeSwitcher>
        */}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setDropDownOpen(false);
            onLogoutClick?.();
          }}
        >
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
