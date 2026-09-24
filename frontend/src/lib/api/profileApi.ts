import type { UserProfile } from "@/types";
import { apiRequest } from "./apiClient";

export interface ProfileApi {
  get(): Promise<UserProfile>;
  update(patch: Partial<Pick<UserProfile, "fullName" | "avatarUrl">>): Promise<UserProfile>;
}

function normalizeProfile(raw: Record<string, unknown> | null): UserProfile {
  if (!raw) {
    return {
      id: "user",
      fullName: "PocketSmart User",
      email: "user@example.com",
      createdAt: new Date().toISOString(),
    };
  }
  const name =
    (raw.fullName as string) ||
    (raw.full_name as string) ||
    (raw.email ? (raw.email as string).split("@")[0] : "PocketSmart User");
  return {
    id: (raw.id as string) || "user",
    fullName: name,
    email: (raw.email as string) || "",
    createdAt: (raw.createdAt as string) || (raw.created_at as string) || new Date().toISOString(),
    avatarUrl: (raw.avatarUrl as string) || (raw.avatar_url as string) || undefined,
  };
}

export const profileApi: ProfileApi = {
  get: async () => {
    const raw = await apiRequest<Record<string, unknown>>("/api/v1/profile");
    return normalizeProfile(raw);
  },
  update: async (patch) => {
    const body = {
      full_name: patch.fullName,
      fullName: patch.fullName,
      avatar_url: patch.avatarUrl,
      avatarUrl: patch.avatarUrl,
    };
    const raw = await apiRequest<Record<string, unknown>>("/api/v1/profile", {
      method: "PUT",
      body,
    });
    return normalizeProfile(raw);
  },
};
