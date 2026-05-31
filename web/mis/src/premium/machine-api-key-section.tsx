import { useEffect, useState } from "react";
import { Copy, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  apiClient,
  endpoints,
  normalizeApiError,
  type MachineApiKey,
  type MachineFirmwareConfig,
  type MachineIoTConfigResponse,
} from "@mono/api_client";
import { PremiumSurface } from "@mono/shared_ui/components/premium";
import { Button } from "@mono/shared_ui/components/ui/button";

type MachineApiKeySectionProps = {
  orgId: string;
  labId: string;
  machineId: string;
  enabled?: boolean;
};

export function MachineApiKeySection({
  orgId,
  labId,
  machineId,
  enabled = true,
}: MachineApiKeySectionProps) {
  const [apiKeyData, setApiKeyData] = useState<MachineApiKey | null>(null);
  const [firmwareConfig, setFirmwareConfig] = useState<MachineFirmwareConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setApiKeyData(null);
      setFirmwareConfig(null);
      setLoadError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    void Promise.all([
      apiClient.get<MachineApiKey>(endpoints.machines.apiKey(labId, machineId), { orgId }),
      apiClient.get<MachineIoTConfigResponse>(endpoints.machines.iotConfig(labId, machineId), {
        orgId,
      }),
    ])
      .then(([keyRes, configRes]) => {
        if (cancelled) return;
        setApiKeyData(keyRes);
        setFirmwareConfig(configRes.error === false ? configRes.data : null);
        setIsLoading(false);
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(normalizeApiError(error).message);
          setApiKeyData(null);
          setFirmwareConfig(null);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [orgId, labId, machineId, enabled]);

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

  const firmwareJson =
    firmwareConfig != null ? JSON.stringify(firmwareConfig, null, 2) : null;

  return (
    <PremiumSurface className="p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <KeyRound className="size-5 text-teal-600 dark:text-teal-400" />
            Machine IoT credential
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The machine API key is the only credential on the ESP32. The backend resolves the lab
            from the machine and records attendance automatically when a registered user unlocks or
            releases this machine.
          </p>
        </div>
        {apiKeyData?.api_key ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void copyText("Machine API key", apiKeyData.api_key)}
          >
            <Copy className="size-4" />
            Copy key
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Loader2 className="size-4 animate-spin" />
          Loading IoT settings…
        </div>
      ) : loadError ? (
        <p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 border border-amber-200 dark:border-amber-900/30">
          {loadError}
        </p>
      ) : (
        <>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Machine
            </p>
            <p className="mt-1 text-sm font-medium text-slate-950 dark:text-white">
              {apiKeyData?.name ?? "—"}
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              API key (program into ESP32 as machineApiKey)
            </p>
            <p className="mt-1 font-mono text-sm break-all text-slate-950 dark:text-white">
              {apiKeyData?.api_key ?? "—"}
            </p>
          </div>

          {firmwareJson ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Firmware config (no lab key)
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void copyText("Firmware config", firmwareJson)}
                >
                  <Copy className="size-4" />
                  Copy JSON
                </Button>
              </div>
              <pre className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 text-xs p-4 overflow-x-auto font-mono">
                {firmwareJson}
              </pre>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                POST body:{" "}
                <code className="text-teal-700 dark:text-teal-300">
                  {"{ machine_api_key, user_rfid }"}
                </code>
                . Do not send <code className="text-teal-700 dark:text-teal-300">X-Lab-Key</code>.
              </p>
            </div>
          ) : null}
        </>
      )}
    </PremiumSurface>
  );
}
