import { LabViewSidebar } from "@/components/shared/lab-view-sidebar";
import LabContextProvider from "@/providers/lab-provider";
import { UnitsProvider } from "@/providers/units-provider";
import { LayoutWithSidebar } from "@mono/shared_ui/components/layout/index";

const LabViewLayout = () => {
  return (
    <LabContextProvider>
      <UnitsProvider>
        <LayoutWithSidebar className="max-h-svh overflow-hidden">
          <LabViewSidebar />
        </LayoutWithSidebar>
      </UnitsProvider>
    </LabContextProvider>
  );
};

export default LabViewLayout;
