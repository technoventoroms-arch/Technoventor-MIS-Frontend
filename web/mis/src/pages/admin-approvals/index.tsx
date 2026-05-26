import { routeParams } from "@/constants/route.constants";
import { SiteHeader } from "@mono/shared_ui/components/shared/site-header";
import { ScrollArea } from "@mono/shared_ui/components/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@mono/shared_ui/components/ui/tabs";
import { Package, UserCheck, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AttendanceRequest, {
  useAdminAttendanceRequest,
} from "./attendance-request";
import InventoryOrders, { useAdminOrderLogs } from "./inventory-order";
import LabJoinRequest, { useLabJoinRequest } from "./lab-join-request";

const tabs = [
  {
    value: routeParams.INVENTORY_TAB,
    label: "Inventory Request",
    icon: Package,
  },
  {
    value: routeParams.ATTENDANCE_TAB,
    label: "Attendance Request",
    icon: UserCheck,
  },
  {
    value: routeParams.LAB_JOIN_TAB,
    label: "Lab Join Request",
    icon: UserPlus,
  },
];

const AdminApprovalPage = () => {
  const adminOrderLogs = useAdminOrderLogs();
  const adminAttendanceRequest = useAdminAttendanceRequest();
  const labJoinRequest = useLabJoinRequest();
  const [searchParams, setSearchParam] = useSearchParams();

  const [tabValue, setTabValue] = useState(() => {
    const tabValue = searchParams.get(routeParams.TAB_ID);
    if (tabValue == routeParams.ATTENDANCE_TAB) {
      return routeParams.ATTENDANCE_TAB;
    }
    if (tabValue == routeParams.LAB_JOIN_TAB) {
      return routeParams.LAB_JOIN_TAB;
    }
    return routeParams.INVENTORY_TAB;
  });

  useEffect(() => {
    adminOrderLogs.fetchOrderLogs();
    adminAttendanceRequest.getAllAttendance();
    labJoinRequest.getLabJoinRequest();
  }, []);
  return (
    <>
      <SiteHeader title="My Approvals" />

      <Tabs
        value={tabValue}
        onValueChange={(e) => {
          setTabValue(e);
          setSearchParam(new URLSearchParams({ [routeParams.TAB_ID]: e }));
        }}
        className="@container/main flex flex-1 flex-col gap-2 p-2 overflow-hidden "
      >
        <ScrollArea className="w-full border-b">
          <TabsList className="text-foreground h-auto gap-2 rounded-none  bg-transparent px-0 py-1 ">
            {tabs.map((i) => (
              <TabsTrigger
                key={i.value}
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

        <TabsContent value={routeParams.INVENTORY_TAB} asChild>
          <InventoryOrders {...adminOrderLogs} />
        </TabsContent>

        <TabsContent value={routeParams.ATTENDANCE_TAB} asChild>
          <AttendanceRequest {...adminAttendanceRequest} />
        </TabsContent>

        <TabsContent value={routeParams.LAB_JOIN_TAB} asChild>
          <LabJoinRequest {...labJoinRequest} />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default AdminApprovalPage;
