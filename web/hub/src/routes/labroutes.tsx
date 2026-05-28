import { routeConstants } from "@/constants/route.constants";
import InventoryItemDetails from "@/pages/lab-pages/inventory-item-details";
import LabDashBoardPage from "@/pages/lab-pages/lab-dashboard";
import MachineDetails from "@/pages/lab-pages/machine-details";
import MachineLogsPage from "@/pages/lab-pages/machine-logs";
import MachineSchedule from "@/pages/lab-pages/machine-schedule";
import ManageInventoryPage from "@/pages/lab-pages/manage-inventory";
import ManageLabUsersPage from "@/pages/lab-pages/manage-lab-user";
import ManageMachine from "@/pages/lab-pages/manage-machine";
import ManageProjectPage from "@/pages/lab-pages/manage-projects";
import UserAttendance from "@/pages/lab-pages/user-attendance";
import ViewProjectDetails from "@/pages/lab-pages/view-project-details";

export const labRoutes = [
  { path: "", element: <LabDashBoardPage /> },
  {
    path: routeConstants.PROJECTS,
    children: [
      { path: "", element: <ManageProjectPage /> },
      {
        path: ":projectId",
        element: <ViewProjectDetails />,
      },
    ],
  },
  {
    path: routeConstants.MACHINES,
    children: [
      { path: "", element: <ManageMachine /> },
      { path: ":machineId", element: <MachineSchedule /> },
      {
        path: `:machineId/${routeConstants.DETAILS}`,
        element: <MachineDetails />,
      },
      {
        path: `:machineId/${routeConstants.LOGS}`,
        element: <MachineLogsPage />,
      },
    ],
  },
  {
    path: routeConstants.INVENTORY,
    children: [
      { path: "", element: <ManageInventoryPage /> },
      {
        path: ":itemId",
        element: <InventoryItemDetails />,
      },
    ],
  },

  {
    path: routeConstants.USERS,
    children: [
      {
        path: "",
        element: <ManageLabUsersPage />,
      },
      {
        path: ":userId",
        children: [
          {
            path: routeConstants.ATTENDANCE,
            element: <UserAttendance />,
          },
        ],
      },
    ],
  },
];
