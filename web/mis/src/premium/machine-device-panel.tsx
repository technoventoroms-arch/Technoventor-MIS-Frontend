import { useEffect, useState } from "react";
import { Copy, Loader2, Radio, Wifi } from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner";

import {
  apiClient,
  endpoints,
  normalizeApiError,
  type MachineIoTDeviceResponse,
  type MachineIoTInstallResponse,
} from "@mono/api_client";
import { PremiumSurface } from "@mono/shared_ui/components/premium";
import { formatLocalDateTime } from "@mono/shared_ui/lib/format-datetime";
import { Button } from "@mono/shared_ui/components/ui/button";
import { StatusBadge } from "@mono/shared_ui/components/premium/status-badge";

import { isAttendanceMachine } from "./machine-mode";

type MachineDevicePanelProps = {
  orgId: string;
  labId: string;
  machineId: string;
  /** Lab managers and organisation admins can fetch the one-time install setup code. */
  canViewInstallSetup: boolean;
  /** Backend machine.mode — attendance kiosks skip booking and only record check-in. */
  machineMode?: unknown;
  enabled?: boolean;
};

export type PanelAccessState = {
  isForbidden: boolean;
  message: string;
};

export function toAccessState(error: unknown): PanelAccessState {
  const normalized = normalizeApiError(error);
  const statusCode = typeof normalized.status === "number" ? normalized.status : undefined;
  if (statusCode === 403) {
    return {
      isForbidden: true,
      message: "You can access machine status, but installer setup code requires lab manager or organisation admin access.",
    };
  }
  return {
    isForbidden: false,
    message: normalized.message,
  };
}

function formatLastSeen(iso: string | null | undefined): string {
  if (!iso) return "Never";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown";
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours} h ago`;
  return formatLocalDateTime(iso);
}

export function MachineDevicePanel({
  orgId,
  labId,
  machineId,
  canViewInstallSetup,
  machineMode,
  enabled = true,
}: MachineDevicePanelProps) {
  const attendanceKiosk = isAttendanceMachine({ mode: machineMode });
  const [device, setDevice] = useState<MachineIoTDeviceResponse | null>(null);
  const [install, setInstall] = useState<MachineIoTInstallResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isForbiddenState, setIsForbiddenState] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDevice(null);
      setInstall(null);
      setLoadError(null);
      setIsForbiddenState(false);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    setIsForbiddenState(false);

    const requests: Promise<unknown>[] = [
      apiClient.get<{ error?: boolean; data?: MachineIoTDeviceResponse }>(
        endpoints.machines.iotDevice(labId, machineId),
        { orgId }
      ),
    ];
    if (canViewInstallSetup) {
      requests.push(
        apiClient.get<{ error?: boolean; data?: MachineIoTInstallResponse }>(
          endpoints.machines.iotInstall(labId, machineId),
          { orgId }
        )
      );
    }

    void Promise.all(requests)
      .then((results) => {
        if (cancelled) return;
        const deviceRes = results[0] as { error?: boolean; data?: MachineIoTDeviceResponse };
        setDevice(deviceRes?.data ?? null);
        if (canViewInstallSetup && results[1]) {
          const installRes = results[1] as { error?: boolean; data?: MachineIoTInstallResponse };
          setInstall(installRes?.data ?? null);
        } else {
          setInstall(null);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        if (!cancelled) {
          const accessState = toAccessState(error);
          setLoadError(accessState.message);
          setIsForbiddenState(accessState.isForbidden);
          setDevice(null);
          setInstall(null);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [orgId, labId, machineId, canViewInstallSetup, enabled]);

  if (!enabled) return null;

  const copyText = async (label: string, value: string | undefined) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Unable to copy ${label}`);
    }
  };

  const qrPayload = install?.setup_code
    ? `MIS-SETUP:${install.setup_code}`
    : "";

  return (
    <PremiumSurface className="p-6 space-y-4">
      <div className="flex items-start gap-3">
        <Radio className="size-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            {attendanceKiosk ? "Attendance reader" : "RFID reader"}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {attendanceKiosk
              ? "Install this reader as an attendance kiosk. Students tap their lab RFID card to check in — no slot booking or machine unlock."
              : "Lab managers register equipment, approve bookings, and install readers. Students tap their lab card during an approved slot — unlock, attendance, and release are automatic."}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="size-4 animate-spin" />
          Checking reader…
        </div>
      ) : loadError ? (
        <p className={`text-sm rounded-xl p-3 border ${
          isForbiddenState
            ? "text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40"
            : "text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20"
        }`}>
          {loadError}
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge tone={device?.linked ? "success" : "warning"}>
              {device?.linked ? "Reader online" : "Awaiting reader"}
            </StatusBadge>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Wifi className="size-3.5" />
              Last seen: {formatLastSeen(device?.last_iot_seen_at)}
            </span>
          </div>

          {!device?.linked ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              After install, the reader polls the server every minute. If this stays offline,
              verify WiFi and the setup code on the device.
            </p>
          ) : null}

          {canViewInstallSetup && install ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                One-time install
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{install.instructions}</p>
              <div className="flex flex-wrap gap-6 items-start">
                {qrPayload ? (
                  <div className="rounded-lg bg-white p-3">
                    <QRCode value={qrPayload} size={120} />
                  </div>
                ) : null}
                <div className="space-y-2 min-w-[12rem]">
                  <p className="text-xs text-slate-500">Setup code (on device label)</p>
                  <p className="font-mono text-lg font-bold tracking-widest text-slate-950 dark:text-white">
                    {install.setup_code}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void copyText("Setup code", install.setup_code)}
                  >
                    <Copy className="size-4" />
                    Copy code
                  </Button>
                  <p className="text-xs text-slate-500 pt-2">
                    ESP32 setup: join <strong>Machine-Setup</strong> WiFi → enter lab WiFi + this
                    code at <strong>192.168.4.1</strong>. No API keys for daily staff.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </PremiumSurface>
  );
}
