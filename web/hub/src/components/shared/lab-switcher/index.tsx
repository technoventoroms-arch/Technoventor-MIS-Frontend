"use client";

import { ILabType } from "@/interfaces/labs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@mono/shared_ui/components/ui/avatar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@mono/shared_ui/components/ui/sidebar";
import { Skeleton } from "@mono/shared_ui/components/ui/skeleton";

export function LabSwitcher({
  lab,

  loading,
}: {
  lab: ILabType | null;

  loading?: boolean;
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground "
        >
          {loading || !lab ? (
            <Skeleton className="h-8 w-full" />
          ) : (
            <>
              <Avatar className="size-10 rounded-lg ">
                <AvatarImage src={(lab as any)?.avatar} alt={lab.name} />
                <AvatarFallback className="rounded-lg uppercase">
                  {lab.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{lab.name}</span>
                <span className="truncate text-xs">
                  {lab.organisation_name}
                </span>
              </div>
            </>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
