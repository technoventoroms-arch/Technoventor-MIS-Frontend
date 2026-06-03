import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";

import { formatFieldErrors, humanizeErrorMessage, humanizeFieldErrors } from "./humanize-api-error";

export { formatFieldErrors, humanizeErrorMessage, humanizeFieldErrors } from "./humanize-api-error";

export type ApiPage<T> = {
  next: string | null;
  previous: string | null;
  results: T[];
};

export type ApiEnvelope<T> = {
  error?: boolean;
  message?: string;
  data?: T;
};

export type ApiError = {
  status?: number;
  message: string;
  fields?: Record<string, string[]>;
  raw?: unknown;
};

export type AuthUser = {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  image_url?: string | null;
  is_active?: boolean;
  last_login_at?: string | null;
};

export type AuthSession = {
  access: string;
  refresh: string;
  user?: AuthUser;
};

export type Entity = {
  id: number | string;
  name?: string;
  title?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export type MachineApiKey = {
  id: number;
  name: string;
  api_key: string;
};

/** ESP32 NVS values — machine API key only (no lab key). */
export type MachineFirmwareConfig = {
  apiUrl: string;
  consumeMachine: string;
  machineStatus: string;
  machineApiKey: string;
};

export type MachineIoTConfigResponse = {
  error: boolean;
  data: MachineFirmwareConfig;
};

export type MachineIoTDeviceResponse = {
  machine_id: number;
  machine_name: string;
  linked: boolean;
  last_iot_seen_at: string | null;
  reader_ready: boolean;
};

export type MachineIoTInstallResponse = {
  setup_code: string;
  machine_name: string;
  api_url: string;
  instructions: string;
};

export type ImageKitAuthPayload = {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RequestOptions = AxiosRequestConfig & {
  orgId?: string | number;
  pageUrl?: string | null;
};

const SESSION_KEY = "mis.jwt.session";
const FALLBACK_API_BASE_URL = "https://technoventor-mis-django-backend.onrender.com/api/v1/";

function getEnvBaseUrl(): string {
  const meta = import.meta as ImportMeta & {
    env?: Record<string, string | undefined>;
  };
  const configured = meta.env?.VITE_PUBLIC_API_ENDPOINT?.trim();
  if (configured) {
    return configured;
  }
  return FALLBACK_API_BASE_URL;
}

function normalizeBaseUrl(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export const tokenStorage = {
  read(): AuthSession | null {
    if (!isBrowser()) return null;
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
  },
  write(session: AuthSession): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },
  clear(): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(SESSION_KEY);
  },
};

export function normalizeApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const data = axiosError.response?.data as
      | string
      | Record<string, unknown>
      | undefined;

    if (typeof data === "string") {
      return {
        status: axiosError.response?.status,
        message: data,
        raw: data,
      };
    }

    if (data && typeof data === "object") {
      const fields = extractApiFieldErrors(data);
      const humanizedFields = humanizeFieldErrors(fields);
      const fieldMessage = formatFieldErrors(fields);

      const envelopeMessage = stringValue(data.message);
      const detailMessage =
        typeof data.detail === "string" ? stringValue(data.detail) : undefined;
      const rawMessage =
        fieldMessage ??
        (envelopeMessage && envelopeMessage !== "Validation error"
          ? envelopeMessage
          : undefined) ??
        detailMessage ??
        envelopeMessage ??
        stringValue(data.error) ??
        stringValue(data.data) ??
        axiosError.message ??
        "Request failed";
      const message = humanizeErrorMessage(rawMessage);

      return {
        status: axiosError.response?.status,
        message,
        fields: Object.keys(humanizedFields).length ? humanizedFields : undefined,
        raw: data,
      };
    }

    return {
      status: axiosError.response?.status,
      message: humanizeErrorMessage(axiosError.message || "Request failed"),
      raw: axiosError,
    };
  }

  if (error instanceof Error) {
    return { message: humanizeErrorMessage(error.message), raw: error };
  }

  return { message: humanizeErrorMessage("An unknown API error occurred"), raw: error };
}

function extractApiFieldErrors(data: Record<string, unknown>): Record<string, string[]> {
  const fields: Record<string, string[]> = {};
  const sources: Record<string, unknown>[] = [data];

  if (data.detail && typeof data.detail === "object" && !Array.isArray(data.detail)) {
    sources.push(data.detail as Record<string, unknown>);
  }

  for (const source of sources) {
    for (const [key, value] of Object.entries(source)) {
      if (key === "error" || key === "message" || key === "code" || key === "detail") {
        continue;
      }
      if (Array.isArray(value)) {
        fields[key] = value.map(String);
      }
    }
  }

  return fields;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export class MisApiClient {
  private readonly http: AxiosInstance;
  private refreshPromise: Promise<AuthSession | null> | null = null;

  constructor(baseURL = getEnvBaseUrl()) {
    this.http = axios.create({
      baseURL: normalizeBaseUrl(baseURL),
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.http.interceptors.request.use((config) => {
      const session = tokenStorage.read();
      if (session?.access) {
        config.headers.Authorization = `Bearer ${session.access}`;
      }

      const orgId = (config as RequestOptions).orgId;
      if (orgId) {
        config.headers["X-Org-Id"] = String(orgId);
      }

      return config;
    });

    this.http.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
        if (error.response?.status !== 401 || !original || original._retry) {
          throw error;
        }

        original._retry = true;
        const refreshed = await this.refreshSession();
        if (!refreshed?.access) {
          tokenStorage.clear();
          throw error;
        }

        original.headers = {
          ...(original.headers ?? {}),
          Authorization: `Bearer ${refreshed.access}`,
        };
        return this.http.request(original);
      }
    );
  }

  async login(payload: LoginPayload): Promise<AuthSession> {
    const { data } = await this.http.post<AuthSession>("users/auth/login/", payload);
    tokenStorage.write(data);
    return data;
  }

  async refreshSession(): Promise<AuthSession | null> {
    const session = tokenStorage.read();
    if (!session?.refresh) return null;

    if (!this.refreshPromise) {
      this.refreshPromise = this.http
        .post<Pick<AuthSession, "access">>("users/auth/refresh/", {
          refresh: session.refresh,
        })
        .then((response) => {
          const nextSession: AuthSession = {
            ...session,
            access: response.data.access,
          };
          tokenStorage.write(nextSession);
          return nextSession;
        })
        .catch(() => {
          tokenStorage.clear();
          return null;
        })
        .finally(() => {
          this.refreshPromise = null;
        });
    }

    return this.refreshPromise;
  }

  logout(): void {
    tokenStorage.clear();
  }

  async currentUser(): Promise<AuthUser> {
    const { data } = await this.http.get<AuthUser>("users/me/");
    const session = tokenStorage.read();
    if (session) {
      tokenStorage.write({ ...session, user: data });
    }
    return data;
  }

  async health(): Promise<{ status: string; checks: Record<string, boolean> }> {
    const { data } = await this.http.get("health/");
    return data;
  }

  async getImageKitAuth(): Promise<ImageKitAuthPayload> {
    const { data } = await this.http.get<ImageKitAuthPayload>(endpoints.uploads.imagekitAuth);
    return data;
  }

  async list<T = Entity>(path: string, options: RequestOptions = {}): Promise<ApiPage<T>> {
    if (options.pageUrl) {
      const { data } = await axios.get<ApiPage<T> | T[]>(options.pageUrl, {
        headers: this.authHeaders(options.orgId),
      });
      return normalizePage(data);
    }
    const { data } = await this.http.get<ApiPage<T> | T[]>(path, options);
    return normalizePage(data);
  }

  async listUnpaginated<T = Entity>(path: string, options: RequestOptions = {}): Promise<T[]> {
    const { data } = await this.http.get<T[]>(path, options);
    return data;
  }

  async get<T = Entity>(path: string, options: RequestOptions = {}): Promise<T> {
    const { data } = await this.http.get<T>(path, options);
    return data;
  }

  async create<T = Entity, P = Record<string, unknown>>(
    path: string,
    payload: P,
    options: RequestOptions = {}
  ): Promise<T> {
    const { data } = await this.http.post<T>(path, payload, options);
    return data;
  }

  async update<T = Entity, P = Record<string, unknown>>(
    path: string,
    payload: P,
    options: RequestOptions = {}
  ): Promise<T> {
    const { data } = await this.http.patch<T>(path, payload, options);
    return data;
  }

  async remove(path: string, options: RequestOptions = {}): Promise<void> {
    await this.http.delete(path, options);
  }

  private authHeaders(orgId?: string | number): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const session = tokenStorage.read();
    if (session?.access) {
      headers.Authorization = `Bearer ${session.access}`;
    }
    if (orgId) {
      headers["X-Org-Id"] = String(orgId);
    }
    return headers;
  }
}

export const apiClient = new MisApiClient();

function normalizePage<T>(data: ApiPage<T> | T[]): ApiPage<T> {
  if (Array.isArray(data)) {
    return { next: null, previous: null, results: data };
  }
  return data;
}

export const endpoints = {
  uploads: {
    imagekitAuth: "uploads/imagekit-auth/",
  },
  organisations: {
    list: "organisations/",
    detail: (orgId: string | number) => `organisations/${orgId}/`,
    members: (orgId: string | number) => `organisations/${orgId}/members/`,
    member: (orgId: string | number, memberId: string | number) =>
      `organisations/${orgId}/members/${memberId}/`,
    invites: (orgId: string | number) => `organisations/${orgId}/invites/`,
    invite: (orgId: string | number, inviteId: string | number) =>
      `organisations/${orgId}/invites/${inviteId}/`,
    joinRequests: (orgId: string | number) =>
      `organisations/${orgId}/join-requests/`,
    bulkUserImport: (orgId: string | number) =>
      `organisations/${orgId}/bulk-users/import/`,
  },
  users: {
    notifications: "users/notifications/",
    markNotificationRead: (notificationId: string | number) =>
      `users/notifications/${notificationId}/read/`,
    notificationStream: "users/notifications/stream/",
  },
  iam: {
    permissions: "iam/permissions/",
    roles: (orgId: string | number) => `iam/${orgId}/roles/`,
    rolePermissions: (orgId: string | number, roleId: string | number) =>
      `iam/${orgId}/roles/${roleId}/permissions/`,
  },
  labs: {
    available: "labs/available/",
    list: (orgId: string | number) => `labs/organisations/${orgId}/labs/`,
    detail: (orgId: string | number, labId: string | number) =>
      `labs/organisations/${orgId}/labs/${labId}/`,
    bookingPolicy: (orgId: string | number, labId: string | number) =>
      `labs/organisations/${orgId}/labs/${labId}/booking-policy/`,
    myPermissions: (orgId: string | number, labId: string | number) =>
      `labs/organisations/${orgId}/labs/${labId}/my-permissions/`,
    joinRequest: (labId: string | number) => `labs/${labId}/join-request/`,
    members: (orgId: string | number, labId: string | number) =>
      `labs/organisations/${orgId}/labs/${labId}/members/`,
    rfids: (labId: string | number, labUserId: string | number) =>
      `labs/${labId}/users/${labUserId}/rfids/`,
  },
  attendance: {
    list: (labId: string | number) => `attendance/labs/${labId}/`,
    me: "attendance/me/",
    meRecord: (attendanceId: string | number) => `attendance/me/${attendanceId}/`,
    approve: (labId: string | number, attendanceId: string | number) =>
      `attendance/labs/${labId}/${attendanceId}/approve/`,
  },
  machines: {
    list: (labId: string | number) => `machines/labs/${labId}/`,
    detail: (labId: string | number, machineId: string | number) =>
      `machines/labs/${labId}/${machineId}/`,
    apiKey: (labId: string | number, machineId: string | number) =>
      `machines/labs/${labId}/${machineId}/api-key/`,
    iotConfig: (labId: string | number, machineId: string | number) =>
      `machines/labs/${labId}/${machineId}/iot-config/`,
    iotDevice: (labId: string | number, machineId: string | number) =>
      `machines/labs/${labId}/${machineId}/iot-device/`,
    iotInstall: (labId: string | number, machineId: string | number) =>
      `machines/labs/${labId}/${machineId}/iot-install/`,
    status: (labId: string | number, machineId: string | number) =>
      `machines/labs/${labId}/${machineId}/status/`,
    logs: (labId: string | number, machineId: string | number) =>
      `machines/labs/${labId}/${machineId}/logs/`,
    reservations: (labId: string | number, machineId: string | number) =>
      `machines/labs/${labId}/${machineId}/reservations/`,
    currentReservation: (labId: string | number, machineId: string | number) =>
      `machines/labs/${labId}/${machineId}/reservations/current/`,
    labReservations: (labId: string | number) => `machines/labs/${labId}/reservations/`,
    userReservations: "machines/reservations/me/",
    pendingReservations: "machines/reservations/pending/",
    reservationAction: (reservationId: string | number) =>
      `machines/reservations/${reservationId}/action/`,
    reservationConsume: (reservationId: string | number) =>
      `machines/reservations/${reservationId}/consume/`,
  },
  inventory: {
    categories: (labId: string | number) => `inventory/labs/${labId}/categories/`,
    units: (labId: string | number) => `inventory/labs/${labId}/units/`,
    unitConversions: (labId: string | number) => `inventory/labs/${labId}/unit-conversions/`,
    unitConversion: (labId: string | number, conversionId: string | number) =>
      `inventory/labs/${labId}/unit-conversions/${conversionId}/`,
    items: (labId: string | number) => `inventory/labs/${labId}/items/`,
    itemsBulk: (labId: string | number) => `inventory/labs/${labId}/items/bulk/`,
    item: (labId: string | number, itemId: string | number) =>
      `inventory/labs/${labId}/items/${itemId}/`,
    adjust: (labId: string | number, itemId: string | number) =>
      `inventory/labs/${labId}/items/${itemId}/adjust/`,
    movements: (labId: string | number, itemId: string | number) =>
      `inventory/labs/${labId}/items/${itemId}/movements/`,
    cart: (labId: string | number) => `inventory/labs/${labId}/cart/`,
    cartItem: (labId: string | number, cartItemId: string | number) =>
      `inventory/labs/${labId}/cart/${cartItemId}/`,
    cartCheckout: (labId: string | number) => `inventory/labs/${labId}/cart/checkout/`,
  },
  projects: {
    list: (labId: string | number) => `projects/labs/${labId}/`,
    detail: (labId: string | number, projectId: string | number) =>
      `projects/labs/${labId}/${projectId}/`,
    members: (labId: string | number, projectId: string | number) =>
      `projects/labs/${labId}/${projectId}/members/`,
    orders: (labId: string | number, projectId: string | number) =>
      `projects/labs/${labId}/${projectId}/orders/`,
    userOrders: "projects/orders/me/",
    pendingOrders: "projects/orders/pending/",
    orderAction: (orderId: string | number) => `projects/orders/${orderId}/action/`,
  },
  billing: {
    plans: "billing/plans/",
    subscriptions: (orgId: string | number) =>
      `billing/organisations/${orgId}/subscriptions/`,
    invoices: (subscriptionId: string | number) =>
      `billing/subscriptions/${subscriptionId}/invoices/`,
  },
};

export type {
  OrganisationInvite,
  OrganisationInviteCreate,
  UserInvitation,
  LabMemberAdd,
} from "./organisation-types";
