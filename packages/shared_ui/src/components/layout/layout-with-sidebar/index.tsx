import {
  SidebarInset,
  SidebarProvider,
} from "@mono/shared_ui/components/ui/sidebar";
import { PropsWithChildren } from "react";
import { Outlet } from "react-router-dom";
type Props = { className?: string };
const LayoutWithSidebar = ({
  children,
  className,
}: PropsWithChildren<Props>) => {
  return (
    <SidebarProvider className={className}>
      {children}
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default LayoutWithSidebar;
