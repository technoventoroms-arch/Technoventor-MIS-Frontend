import { SiteHeader } from "@mono/shared_ui/components/shared/site-header";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@mono/shared_ui/components/ui/tabs";
import InventoryOrders, { useOrderLogs } from "./inventory-order";
import MachineRequests, { useMachineRequest } from "./machine-request";
import { useEffect } from "react";
import { ScrollArea } from "@mono/shared_ui/components/ui/scroll-area";
import { Package, Cpu } from "lucide-react";

const tabs = [
  {
    value: "inventory-request",
    label: "Inventory Orders",
    icon: Package,
  },
  {
    value: "machine-request",
    label: "Machine Request",
    icon: Cpu,
  },
];
const MyOrdersPage = () => {
  const orderProps = useOrderLogs();
  const machineProps = useMachineRequest();
  useEffect(() => {
    orderProps.fetchOrderLogs();
    machineProps.fetchMachineRequest();
  }, []);
  return (
    <>
      <SiteHeader title="My Orders" />

      <Tabs
        defaultValue="inventory-request"
        className="@container/main flex flex-1 flex-col gap-2 p-2 overflow-hidden "
      >
        <ScrollArea className="w-full border-b">
          <TabsList className="text-foreground h-auto gap-2 rounded-none  bg-transparent px-0 py-1 ">
            {tabs.map((i) => (
              <TabsTrigger
                value={i.value}
                className="  hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <i.icon
                  className="-ms-0.5 me-1.5 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                {i.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>
        <TabsContent value="inventory-request" asChild>
          <InventoryOrders {...orderProps} />
        </TabsContent>
        <TabsContent value="machine-request" asChild>
          <MachineRequests {...machineProps} />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default MyOrdersPage;
