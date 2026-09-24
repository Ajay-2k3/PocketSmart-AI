import type { Recommendation } from "@/types";
import { apiRequest } from "./apiClient";

export interface RecommendationApi {
  listForPlan(planId: string): Promise<Recommendation[]>;
  save(recommendationId: string): Promise<void>;
  unsave(recommendationId: string): Promise<void>;
}

export const recommendationApi: RecommendationApi = {
  listForPlan: (planId) => apiRequest<Recommendation[]>(`/api/v1/recommendations/${planId}`),
  save: (id) => apiRequest<void>(`/api/v1/recommendations/${id}/save`, { method: "POST" }),
  unsave: (id) => apiRequest<void>(`/api/v1/recommendations/${id}/save`, { method: "DELETE" }),
};
