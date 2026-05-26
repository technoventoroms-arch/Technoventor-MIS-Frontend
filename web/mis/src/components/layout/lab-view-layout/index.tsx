import { LabViewSidebar } from "@/components/shared/lab-view-sidebar";
import CartProvider from "@/providers/cart-provider";
import LabContextProvider from "@/providers/lab-provider";
import { UnitsProvider } from "@/providers/units-provider";
import { LayoutWithSidebar } from "@mono/shared_ui/components/layout/index";

const LabViewLayout = () => {
  return (
    <LabContextProvider>
      <UnitsProvider>
        <CartProvider>
          <LayoutWithSidebar className="max-h-svh overflow-hidden">
            <LabViewSidebar />
          </LayoutWithSidebar>
        </CartProvider>
      </UnitsProvider>
    </LabContextProvider>
  );
};

export default LabViewLayout;
