import { HomeAppSidebar } from "@/components/shared/home-app-sidebar";
import { LayoutWithSidebar } from "@mono/shared_ui/components/layout/index";

const MainLayout = () => {
  return (
    <LayoutWithSidebar className="max-h-svh overflow-hidden">
      <HomeAppSidebar />
    </LayoutWithSidebar>
  );
};

export default MainLayout;
