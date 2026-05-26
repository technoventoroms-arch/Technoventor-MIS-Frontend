import { routeConstants, routeParams } from "@/constants/route.constants";
import { SSEType } from "@/interfaces/notification";
import { getNotifications } from "@/services/notification";
import { Button } from "@mono/shared_ui/components/ui/button";
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type SSEContext = {};
const SSEContext = createContext({} as SSEContext);

interface SSEventType {
  message: string;
  type: `${SSEType}`; // literal type since it seems fixed
  action_required: boolean;
  entity_id: number;
}

export const SSEContextProvider = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();
  const [error, setError] = useState(true);
  const poolNotifications = async () => {
    const poolData = async () => {
      const response = await getNotifications();
      // consume response

      if (!response.body) {
        throw new Error("ReadableStream not supported in this environment");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      setError(false);
      while (true) {
        const { value, done } = await reader.read();
        const message = decoder.decode(value);

        if (message.startsWith("data: ")) {
          try {
            const eventData = JSON.parse(message.substring(6)) as SSEventType;
            if (
              eventData.type == SSEType.AttendanceApproval ||
              eventData.type == SSEType.AttendanceEvent ||
              eventData.type == SSEType.ProjectOrderApproval
            ) {
              const inventoryEvent =
                eventData.type == SSEType.ProjectOrderApproval;
              toast.info(eventData.message, {
                action: (
                  <Button
                    rounded={"md"}
                    variant={"blue"}
                    onClick={() =>
                      navigate(
                        `/${routeConstants.APPROVALS}?${routeParams.TAB_ID}=${
                          inventoryEvent
                            ? routeParams.INVENTORY_TAB
                            : routeParams.ATTENDANCE_TAB
                        }`
                      )
                    }
                  >
                    {inventoryEvent ? "View Orders" : "View Attendance"}
                  </Button>
                ),
              });
            } else if (eventData.type == SSEType.MachineEvent) {
              toast.info(eventData.message, {
                action: (
                  <Button
                    rounded={"md"}
                    variant={"blue"}
                    onClick={() =>
                      navigate(
                        `/${routeConstants.MACHINES}/${eventData.entity_id}`
                      )
                    }
                  >
                    View Reservations
                  </Button>
                ),
              });
            } else if (eventData.type == SSEType.ProjectEvent) {
              toast.info(eventData.message, {
                action: (
                  <Button
                    rounded={"md"}
                    variant={"blue"}
                    onClick={() =>
                      navigate(
                        `/${routeConstants.PROJECTS}/${eventData.entity_id}`
                      )
                    }
                  >
                    View Project
                  </Button>
                ),
              });
            }
          } catch (e) {
            console.error("Failed to get notification.");
          }
        }
        if (done) break;
      }
    };
    try {
      await poolData();
    } catch (err) {
      setError(true);
    }
  };
  useEffect(() => {
    if (error) poolNotifications();
  }, [error]);

  return <SSEContext.Provider value={{}}>{children}</SSEContext.Provider>;
};
