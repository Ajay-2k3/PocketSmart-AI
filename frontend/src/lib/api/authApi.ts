import type { AuthSession, UserProfile } from "@/types";
import { apiRequest, setToken } from "./apiClient";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthApi {
  login(payload: LoginPayload): Promise<AuthSession>;
  register(payload: RegisterPayload): Promise<AuthSession>;
  logout(): Promise<void>;
  currentUser(): Promise<UserProfile | null>;
}

function normalizeAuthSession(raw: Record<string, unknown>): AuthSession {
  const token = (raw?.token as string) || "";
  const rawUser = (raw?.user as Record<string, unknown>) || raw;
  const name =
    (rawUser?.fullName as string) ||
    (rawUser?.full_name as string) ||
    (rawUser?.email ? (rawUser.email as string).split("@")[0] : "PocketSmart User");
  const user: UserProfile = {
    id: (rawUser?.id as string) || "user",
    fullName: name,
    email: (rawUser?.email as string) || "",
    createdAt:
      (rawUser?.createdAt as string) || (rawUser?.created_at as string) || new Date().toISOString(),
    avatarUrl: (rawUser?.avatarUrl as string) || (rawUser?.avatar_url as string) || undefined,
  };
  return { token, user };
}

export const authApi: AuthApi = {
  async login(payload) {
    const raw = await apiRequest<Record<string, unknown>>("/api/v1/auth/login", {
      method: "POST",
      body: payload,
    });
    const session = normalizeAuthSession(raw);
    setToken(session.token);
    return session;
  },
  async register(payload) {
    const raw = await apiRequest<Record<string, unknown>>("/api/v1/auth/register", {
      method: "POST",
      body: {
        email: payload.email,
        password: payload.password,
        full_name: payload.fullName,
        fullName: payload.fullName,
      },
    });
    const session = normalizeAuthSession(raw);
    setToken(session.token);
    return session;
  },
  async logout() {
    setToken(null);
  },
  async currentUser() {
    try {
      const raw = await apiRequest<Record<string, unknown>>("/api/v1/profile");
      if (!raw) return null;
      const name =
        (raw.fullName as string) ||
        (raw.full_name as string) ||
        (raw.email ? (raw.email as string).split("@")[0] : "PocketSmart User");
      return {
        id: (raw.id as string) || "user",
        fullName: name,
        email: (raw.email as string) || "",
        createdAt:
          (raw.createdAt as string) || (raw.created_at as string) || new Date().toISOString(),
        avatarUrl: (raw.avatarUrl as string) || (raw.avatar_url as string) || undefined,
      };
    } catch {
      return null;
    }
  },
};
