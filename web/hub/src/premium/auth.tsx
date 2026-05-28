import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import {
  apiClient,
  normalizeApiError,
  tokenStorage,
  type AuthUser,
} from "@mono/api_client";

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => tokenStorage.read()?.user ?? null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const refreshUser = useCallback(async () => {
    const session = tokenStorage.read();
    if (!session?.access) {
      setUser(null);
      return;
    }

    const currentUser = await apiClient.currentUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    refreshUser()
      .catch(() => {
        tokenStorage.clear();
        setUser(null);
      })
      .finally(() => setIsBootstrapping(false));
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const session = await apiClient.login({ email, password });
      setUser(session.user ?? (await apiClient.currentUser()));
    } catch (error) {
      throw normalizeApiError(error);
    }
  }, []);

  const logout = useCallback(() => {
    apiClient.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isAuthenticated: Boolean(user || tokenStorage.read()?.access),
      isBootstrapping,
      login,
      logout,
      refreshUser,
    }),
    [isBootstrapping, login, logout, refreshUser, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

export function AuthenticatedRoute() {
  const location = useLocation();
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <PremiumBootScreen label="Preparing the Admin Hub" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <PremiumBootScreen label="Checking your operator session" />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function PremiumBootScreen({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="text-center">
        <div className="mx-auto mb-5 size-12 animate-pulse rounded-3xl bg-indigo-500 shadow-lg shadow-indigo-500/30" />
        <p className="text-sm font-medium text-slate-300">{label}</p>
      </div>
    </div>
  );
}
