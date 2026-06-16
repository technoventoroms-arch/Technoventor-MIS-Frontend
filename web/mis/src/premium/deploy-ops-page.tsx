import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowLeftCircle,
  Container,
  Globe,
  Loader2,
  RefreshCw,
  Server,
} from "lucide-react";
import { PremiumSurface } from "@mono/shared_ui/components/premium";

import {
  fetchDeployLogs,
  fetchDeployStatus,
  OpsApiError,
  rollbackDeploy,
  type DeployServiceState,
} from "./ops-api";

const REFRESH_MS = 15000;

function shortSha(tag: string) {
  if (!tag) return "—";
  return tag.length > 12 ? `${tag.slice(0, 7)}…${tag.slice(-7)}` : tag;
}

function ServiceCard({
  title,
  subtitle,
  icon: Icon,
  accent,
  state,
  logs,
  logsLoading,
  rollingBack,
  onRollback,
  onRefreshLogs,
  logsPaused,
}: {
  title: string;
  subtitle: string;
  icon: typeof Server;
  accent: string;
  state?: DeployServiceState;
  logs: string;
  logsLoading: boolean;
  rollingBack: boolean;
  logsPaused?: boolean;
  onRollback: () => void;
  onRefreshLogs: () => void;
}) {
  const running = state?.running;

  return (
    <PremiumSurface className="overflow-hidden rounded-[28px] p-0">
      <div className={`h-1.5 ${accent}`} />
      <div className="space-y-5 p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accent} bg-opacity-15`}
            >
              <Icon size={22} className="text-slate-800 dark:text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
            </div>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
              running
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
            }`}
          >
            {running ? "Running" : "Check status"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/60 bg-white/60 px-4 py-3 dark:border-white/10 dark:bg-slate-800/50">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current deploy</p>
            <p className="mt-1 break-all font-mono text-sm text-slate-800 dark:text-slate-100" title={state?.tag}>
              {shortSha(state?.tag || "")}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/60 bg-white/60 px-4 py-3 dark:border-white/10 dark:bg-slate-800/50">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Previous (rollback)</p>
            <p
              className="mt-1 break-all font-mono text-sm text-slate-800 dark:text-slate-100"
              title={state?.previous}
            >
              {shortSha(state?.previous || "")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRollback}
            disabled={rollingBack || !state?.previous}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-40 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            {rollingBack ? <Loader2 size={14} className="animate-spin" /> : <ArrowLeftCircle size={14} />}
            Rollback to previous
          </button>
          <button
            type="button"
            onClick={onRefreshLogs}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-700 dark:border-white/15 dark:bg-slate-800/60 dark:text-slate-200"
          >
            <RefreshCw size={14} className={logsLoading ? "animate-spin" : ""} />
            Refresh logs
          </button>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Live container logs
            {logsPaused && (
              <span className="ml-2 font-semibold normal-case tracking-normal text-slate-500 dark:text-slate-400">
                · auto-refresh paused (service is live)
              </span>
            )}
          </p>
          <div className="relative max-h-[320px] overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0f172a] shadow-inner">
            {logsLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/50">
                <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
              </div>
            )}
            <pre className="custom-scrollbar max-h-[320px] overflow-auto whitespace-pre-wrap break-all p-4 font-mono text-[11px] leading-relaxed text-emerald-300/90">
              {logs || "Waiting for logs…"}
            </pre>
          </div>
        </div>
      </div>
    </PremiumSurface>
  );
}

export function DeployOpsPage() {
  const [status, setStatus] = useState<{ api?: DeployServiceState; web?: DeployServiceState }>({});
  const [apiLogs, setApiLogs] = useState("");
  const [webLogs, setWebLogs] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiLogsLoading, setApiLogsLoading] = useState(false);
  const [webLogsLoading, setWebLogsLoading] = useState(false);
  const [apiRolling, setApiRolling] = useState(false);
  const [webRolling, setWebRolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const apiLiveRef = useRef(false);
  const webLiveRef = useRef(false);

  const loadStatus = useCallback(async () => {
    try {
      const data = await fetchDeployStatus();
      setStatus({ api: data.api, web: data.web });
      apiLiveRef.current = data.api?.running === true;
      webLiveRef.current = data.web?.running === true;
      setError(null);
    } catch (e) {
      setError(e instanceof OpsApiError ? e.message : "Failed to load deploy status");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadApiLogs = useCallback(async () => {
    setApiLogsLoading(true);
    try {
      const data = await fetchDeployLogs("api");
      setApiLogs(data.logs || "");
    } catch {
      setApiLogs("Unable to load API logs.");
    } finally {
      setApiLogsLoading(false);
    }
  }, []);

  const loadWebLogs = useCallback(async () => {
    setWebLogsLoading(true);
    try {
      const data = await fetchDeployLogs("web");
      setWebLogs(data.logs || "");
    } catch {
      setWebLogs("Unable to load frontend logs.");
    } finally {
      setWebLogsLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadStatus(), loadApiLogs(), loadWebLogs()]);
  }, [loadStatus, loadApiLogs, loadWebLogs]);

  const autoRefresh = useCallback(async () => {
    await loadStatus();
    if (!webLiveRef.current) {
      await loadWebLogs();
    }
  }, [loadStatus, loadWebLogs]);

  useEffect(() => {
    refreshAll();
    const id = setInterval(autoRefresh, REFRESH_MS);
    return () => clearInterval(id);
  }, [refreshAll, autoRefresh]);

  async function handleRollback(service: "api" | "web") {
    const label = service === "api" ? "Backend API" : "Frontend";
    if (!confirm(`Roll back ${label} to the previous image? The site may be briefly unavailable.`)) return;

    const setRolling = service === "api" ? setApiRolling : setWebRolling;
    setRolling(true);
    setMessage(null);
    setError(null);
    if (service === "api") {
      apiLiveRef.current = false;
    } else {
      webLiveRef.current = false;
    }
    try {
      const res = await rollbackDeploy(service);
      setMessage(`${label} rolled back to ${shortSha(res.tag)}`);
      await refreshAll();
    } catch (e) {
      setError(e instanceof OpsApiError ? e.message : "Rollback failed");
    } finally {
      setRolling(false);
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <PremiumSurface className="rounded-[28px] px-5 py-6 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-teal-600 dark:text-teal-400">
              Technoventor Innovations Pvt Ltd.
            </p>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
              <Activity size={24} className="text-teal-600" />
              Production Deploy Ops
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-400">
              Live container status, logs, and one-click rollback for MIS backend and frontend on the VPS. Status
              auto-refreshes every {REFRESH_MS / 1000}s; logs refresh manually once each service is live.
            </p>
          </div>
          <button
            type="button"
            onClick={refreshAll}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-teal-600 px-5 py-3 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-teal-600/25 hover:bg-teal-500"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh all
          </button>
        </div>
      </PremiumSurface>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ServiceCard
          title="Backend API"
          subtitle="api.makerspaceops.com · Django / Gunicorn"
          icon={Server}
          accent="bg-teal-500"
          state={status.api}
          logs={apiLogs}
          logsLoading={apiLogsLoading}
          rollingBack={apiRolling}
          logsPaused={status.api?.running === true}
          onRollback={() => handleRollback("api")}
          onRefreshLogs={loadApiLogs}
        />
        <ServiceCard
          title="Frontend Web"
          subtitle="makerspaceops.com · Vite / nginx"
          icon={Globe}
          accent="bg-cyan-500"
          state={status.web}
          logs={webLogs}
          logsLoading={webLogsLoading}
          rollingBack={webRolling}
          logsPaused={status.web?.running === true}
          onRollback={() => handleRollback("web")}
          onRefreshLogs={loadWebLogs}
        />
      </div>

      <PremiumSurface className="flex items-center gap-3 rounded-2xl px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
        <Container size={16} />
        <span>
          CI/CD emails no longer include logs — use this dashboard for live monitoring. Rollback uses the image tagged
          in <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">.deploy-state</code> on the server.
        </span>
      </PremiumSurface>
    </div>
  );
}
