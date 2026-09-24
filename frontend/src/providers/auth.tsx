import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi, getToken } from "@/lib/api";
import type { UserProfile } from "@/types";

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserProfile) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function isAuthenticatedClient() {
  return Boolean(getToken());
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      // No token stored — skip the network call, mark loading done immediately
      if (!getToken()) {
        if (active) {
          queryClient.clear();
          setUserState(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const current = await authApi.currentUser();
        if (active) setUserState(current);
      } catch {
        // Token is invalid/expired — clear it and treat as logged out
        await authApi.logout();
        queryClient.clear();
        if (active) setUserState(null);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void restoreSession();

    return () => {
      active = false;
    };
  }, [queryClient]);

  const login = useCallback(async (email: string, password: string) => {
    queryClient.clear();
    const session = await authApi.login({ email, password });
    setUserState(session.user);
  }, [queryClient]);

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    queryClient.clear();
    const session = await authApi.register({ fullName, email, password });
    setUserState(session.user);
  }, [queryClient]);

  const logout = useCallback(async () => {
    await authApi.logout();
    queryClient.clear();
    setUserState(null);
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      setUser: setUserState,
    }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
