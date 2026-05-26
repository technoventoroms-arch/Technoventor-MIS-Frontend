import {
  machineStatusToVariant,
  reqStatusToVariant,
} from "@/constants/machine-status.constants";
import { MachineQRData } from "@/interfaces/machines";
import { IMachineBookingDetails } from "@/interfaces/reservation";
import {
  consumeMachineReservations,
  getCurrentMachineReservation,
} from "@/services/machine.service";
import { SiteHeader } from "@mono/shared_ui/components/shared/site-header";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Skeleton } from "@mono/shared_ui/components/ui/skeleton";
import { DataWithLoading } from "@mono/shared_ui/interfaces/utils";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import { format } from "date-fns";
import { Html5Qrcode } from "html5-qrcode";
import { Loader } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const checkData = async (data: any) => {
  const array = Object.keys(data);
  for (let index = 0; index < array.length; index++) {
    const element = data[array[index]];
    if (element == undefined) {
      throw new Error("Invalid qr code");
    }
  }
};

const ScanMachine = () => {
  const [data, setData] = useState<MachineQRData | null>();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [noReservation, setNoReservation] = useState(false);
  const scannerId = "reader";
  const [currentReservation, setCurrentReservation] = useState<
    DataWithLoading<IMachineBookingDetails | null>
  >({ data: null, loading: false });
  const [usingMachineLoading, setUsingMachineLoading] = useState(false);

  const consumeMachine = async () => {
    if (!currentReservation.data) return;
    setUsingMachineLoading(true);
    try {
      const machineIsOn = currentReservation.data.machine.status == "ACTIVE";
      const res = await consumeMachineReservations(
        currentReservation.data?.id,
        {
          notes: "",
          status: machineIsOn ? "OFF" : "ACTIVE",
        }
      );
      toast.success(
        `Successfully ${machineIsOn ? "stopped" : "started"} machine "${
          currentReservation.data.machine.name
        }".`
      );
      setUsingMachineLoading(false);
      if (!res.error) {
        setData(null);
        setCurrentReservation({ data: null, loading: false });
        scannerRef.current && startScanner(scannerRef.current);
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    } finally {
      setUsingMachineLoading(false);
    }
  };
  const checkReservation = async (data: MachineQRData) => {
    setCurrentReservation({ data: null, loading: true });
    try {
      const res = await getCurrentMachineReservation(data.id);
      if (!res.error) {
        const reservation = res.data?.[0];
        if (reservation) {
          setCurrentReservation({ data: reservation, loading: false });
        } else {
          setCurrentReservation({ data: null, loading: false });
          toast.error(
            "You don't have any reservation for this machine at this moment."
          );
          setNoReservation(true);
        }
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
      setCurrentReservation({ data: null, loading: false });
    }
  };
  const startScanner = (scanner: Html5Qrcode) => {
    scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      async (decodedText) => {
        try {
          const parsedData = JSON.parse(decodedText) as MachineQRData;

          await checkData(parsedData);
          setData(parsedData);
          checkReservation(parsedData);

          scannerRef.current
            ?.stop()
            .then(() => scannerRef.current?.clear())
            .catch((err) => console.error("Stop failed:", err));
        } catch (error) {
          toast.error(getAxiosErrorMessage(error));
        }
      },
      () => {
        // Ignore errors
      }
    );
  };
  useEffect(() => {
    if (!scannerRef.current) {
      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;
      startScanner(scanner);
    }
    // ✅ Stop camera and cleanup
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current
          ?.stop()
          .then(() => scannerRef.current?.clear())
          .catch((err) => console.error("Stop failed:", err));
      }
    };
  }, []);

  const cancelCurrentScan = () => {
    setData(null);
    setNoReservation(false);
    setCurrentReservation({ data: null, loading: false });
    scannerRef.current && startScanner(scannerRef.current);
  };

  const resInfo = currentReservation.data;
  return (
    <>
      <SiteHeader title="Use Machine" />
      <div className="@container/main flex flex-1 flex-col items-center gap-2 p-2">
        <div className="max-w-lg rounded overflow-hidden w-2xl">
          {!data && !resInfo && (
            <div className="text-xl mb-2">Scan Machine QR</div>
          )}
          <div id={scannerId} className="overflow-hidden rounded" />
        </div>
        {noReservation && (
          <div className="max-w-lg  w-2xl">
            <div className="text-xl mb-2">Scan Machine QR</div>
            <div>
              You don't have any reservation for this machine "{data?.name}" at
              this moment.
            </div>
            <Button
              variant={"purple"}
              className="w-full mt-4"
              onClick={cancelCurrentScan}
            >
              Scan Again
            </Button>
          </div>
        )}
        {data && resInfo && !currentReservation.loading && (
          <div className="max-w-3xl mx-auto mt-8 p-6  rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6  ">Booking Details</h2>

            <div className="mb-6 space-y-2">
              <h3 className="text-lg font-semibold  mb-2">Machine Info</h3>
              <p>
                <span className="font-medium">Name:</span>{" "}
                {resInfo.machine.name}
              </p>
              <p>
                <span className="font-medium">Description:</span>{" "}
                {resInfo.machine.description}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                <Badge
                  variant={
                    machineStatusToVariant[resInfo.machine.status] as any
                  }
                >
                  {resInfo.machine.status}
                </Badge>
              </p>
            </div>

            <div className="mb-6 space-y-2">
              <h3 className="text-lg font-semibold mb-2">Booking Info</h3>
              <p>
                <span className="font-medium">Booked From:</span>{" "}
                <Badge variant={"yellow"}>
                  {format(resInfo.booked_from, "PPP hh:mm aa")}
                </Badge>
              </p>
              <p>
                <span className="font-medium">Booked Till:</span>{" "}
                <Badge variant={"green"}>
                  {format(resInfo.booked_till, "PPP hh:mm aa")}
                </Badge>
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                <Badge variant={reqStatusToVariant[resInfo.status] as any}>
                  {resInfo.status}
                </Badge>
              </p>
              <p>
                <span className="font-medium">Notes:</span> {resInfo.notes}
              </p>
              <p>
                <span className="font-medium">Requested At:</span>{" "}
                <Badge variant={"indigo"}>
                  {format(resInfo.created_at, "PPP hh:mm aa")}
                </Badge>
              </p>
            </div>

            <Button
              onClick={consumeMachine}
              className="w-full"
              variant={resInfo.machine.status == "ACTIVE" ? "red" : "green"}
            >
              {usingMachineLoading ? (
                <Loader className="animate-spin" />
              ) : (
                <>
                  {resInfo.machine.status == "ACTIVE" ? "Stop " : "Start "}
                  Machine
                </>
              )}
            </Button>
            <Button
              variant={"outline"}
              className="w-full mt-4"
              onClick={cancelCurrentScan}
            >
              Cancel
            </Button>
          </div>
        )}
        {data && !resInfo && currentReservation.loading && (
          <div className="max-w-3xl mx-auto mt-8 p-6  rounded-lg shadow-md space-y-2">
            <h2 className="text-2xl font-bold mb-6">Booking Details</h2>
            <Skeleton className="w-full h-28" />
            <Skeleton className="w-full h-28" />
            <Skeleton className="w-full h-28" />
          </div>
        )}
      </div>
    </>
  );
};

export default ScanMachine;
