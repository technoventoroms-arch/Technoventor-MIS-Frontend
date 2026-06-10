import { apiClient, normalizeApiError } from "@mono/api_client";

export type DeployServiceState = {
  service: string;
  tag: string;
  previous: string;
  running: boolean;
  status_text: string;
  ps: string;
};

export type DeployStatusResponse = {
  ok: boolean;
  api: DeployServiceState;
  web: DeployServiceState;
};

export type DeployLogsResponse = {
  ok: boolean;
  service: string;
  logs: string;
};

export type DeployActionResponse = {
  ok: boolean;
  service: string;
  tag: string;
  logs?: string;
  error?: string;
};

export class OpsApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpsApiError";
  }
}

function wrapOpsError(error: unknown): never {
  throw new OpsApiError(normalizeApiError(error).message);
}

export async function fetchDeployStatus(): Promise<DeployStatusResponse> {
  try {
    return await apiClient.get<DeployStatusResponse>("ops/deploy/status/");
  } catch (error) {
    wrapOpsError(error);
  }
}

export async function fetchDeployLogs(
  service: "api" | "web",
  tail = 200
): Promise<DeployLogsResponse> {
  try {
    return await apiClient.get<DeployLogsResponse>(`ops/deploy/logs/${service}/?tail=${tail}`);
  } catch (error) {
    wrapOpsError(error);
  }
}

export async function rollbackDeploy(
  service: "api" | "web",
  tag = "previous"
): Promise<DeployActionResponse> {
  try {
    return await apiClient.create<DeployActionResponse, { tag: string }>(
      `ops/deploy/rollback/${service}/`,
      { tag }
    );
  } catch (error) {
    wrapOpsError(error);
  }
}
