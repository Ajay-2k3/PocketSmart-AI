import type { Plan, PlanListItem } from "@/types";
import { apiRequest } from "./apiClient";

export interface HistoryApi {
  listPlans(): Promise<PlanListItem[]>;
  getPlan(planId: string): Promise<Plan>;
  deletePlan(planId: string): Promise<void>;
}

export const historyApi: HistoryApi = {
  listPlans: () => apiRequest<PlanListItem[]>("/api/v1/plans"),
  getPlan: (planId) => apiRequest<Plan>(`/api/v1/plans/${planId}`),
  deletePlan: (planId) => apiRequest<void>(`/api/v1/plans/${planId}`, { method: "DELETE" }),
};
