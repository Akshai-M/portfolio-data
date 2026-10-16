"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchAllPortfolios, PortfolioApiError } from "@/lib/api";
import { mergeExportedPortfolios } from "@/lib/mapper";
import {
  clearStoredCredentials,
  readStoredCredentials,
  writeStoredCredentials,
} from "@/lib/session";
import type { AuthStatus, PublishFilter, ViewerPortfolio } from "@/lib/types";

interface AuthContextValue {
  status: AuthStatus;
  portfolios: ViewerPortfolio[];
  isPublished: PublishFilter;
  error: string | null;
  warning: string | null;
  login: (username: string, password: string, isPublished: PublishFilter) => Promise<void>;
  logout: () => void;
  reload: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [portfolios, setPortfolios] = useState<ViewerPortfolio[]>([]);
  const [isPublished, setIsPublished] = useState<PublishFilter>(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const loadWithCredentials = useCallback(
    async (username: string, password: string, publishFilter: PublishFilter) => {
      const result = await fetchAllPortfolios(username, password, publishFilter);
      setPortfolios(mergeExportedPortfolios(result.published, result.drafts));
      setIsPublished(publishFilter);
      setWarning(null);
      setError(null);
      writeStoredCredentials(username, password, publishFilter);
      setStatus("authenticated");
    },
    [],
  );

  useEffect(() => {
    const stored = readStoredCredentials();
    if (!stored) {
      setStatus("unauthenticated");
      return;
    }
    loadWithCredentials(stored.username, stored.password, stored.isPublished).catch((err) => {
      clearStoredCredentials();
      setPortfolios([]);
      setStatus("unauthenticated");
      setError(err instanceof PortfolioApiError ? err.message : "Session expired. Sign in again.");
    });
  }, [loadWithCredentials]);

  const login = useCallback(
    async (username: string, password: string, publishFilter: PublishFilter) => {
      setError(null);
      setWarning(null);
      await loadWithCredentials(username, password, publishFilter);
    },
    [loadWithCredentials],
  );

  const logout = useCallback(() => {
    clearStoredCredentials();
    setPortfolios([]);
    setWarning(null);
    setError(null);
    setStatus("unauthenticated");
  }, []);

  const reload = useCallback(async () => {
    const stored = readStoredCredentials();
    if (!stored) {
      setStatus("unauthenticated");
      return;
    }
    await loadWithCredentials(stored.username, stored.password, stored.isPublished);
  }, [loadWithCredentials]);

  const value = useMemo(
    () => ({ status, portfolios, isPublished, error, warning, login, logout, reload }),
    [status, portfolios, isPublished, error, warning, login, logout, reload],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
