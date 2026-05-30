import { useEffect, useState } from "react";
import { Copy, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  apiClient,
  endpoints,
  normalizeApiError,
  type MachineApiKey,
} from "@mono/api_client";
import { PremiumSurface } from "@mono/shared_ui/components/premium";
import { Button } from "@mono/shared_ui/components/ui/button";

type MachineApiKeySectionProps = {
  orgId: string;
  labId: string;
  machineId: string;
};

export function MachineApiKeySection({
  orgId,
  labId,
  machineId,
}: MachineApiKeySectionProps) {
  const [apiKeyData, setApiKeyData] = useState<MachineApiKey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    void apiClient
      .get<MachineApiKey>(endpoints.machines.apiKey(labId, machineId), { orgId })
      .then((data) => {
        if (!cancelled) {
          setApiKeyData(data);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(normalizeApiError(error).message);
          setApiKeyData(null);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [orgId, labId, machineId]);

  const handleCopy = async () => {
    const key = apiKeyData?.api_key;
    if (!key) return;

    try {
      await navigator.clipboard.writeText(key);
      toast.success("IoT API key copied to clipboard");
    } catch {
      toast.error("Unable to copy IoT API key");
    }
  };

  return (
    <PremiumSurface className="p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <KeyRound className="size-5 text-teal-600 dark:text-teal-400" />
            IoT API Key
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            UUID credential used by this machine to authenticate with lab IoT services.
          </p>
        </div>
        {apiKeyData?.api_key ? (
          <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="size-4" />
            Copy
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Loader2 className="size-4 animate-spin" />
          Loading IoT API key…
        </div>
      ) : loadError ? (
        <p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 border border-amber-200 dark:border-amber-900/30">
          {loadError}
        </p>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Machine
          </p>
          <p className="mt-1 text-sm font-medium text-slate-950 dark:text-white">
            {apiKeyData?.name ?? "—"}
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            API Key
          </p>
          <p className="mt-1 font-mono text-sm break-all text-slate-950 dark:text-white">
            {apiKeyData?.api_key ?? "—"}
          </p>
        </div>
      )}
    </PremiumSurface>
  );
}
