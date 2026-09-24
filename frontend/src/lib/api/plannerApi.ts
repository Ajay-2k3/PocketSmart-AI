import type { HomePlannerInput, JewelryPlannerInput, PartyPlannerInput, Plan } from "@/types";
import { apiRequest } from "./apiClient";

export interface PlannerApi {
  generateHomePlan(input: HomePlannerInput): Promise<Plan>;
  generatePartyPlan(input: PartyPlannerInput): Promise<Plan>;
  generateJewelryPlan(input: JewelryPlannerInput): Promise<Plan>;
}

export const plannerApi: PlannerApi = {
  generateHomePlan: (input) =>
    apiRequest<Plan>("/api/v1/planners/home/generate", { method: "POST", body: input }),
  generatePartyPlan: (input) =>
    apiRequest<Plan>("/api/v1/planners/party/generate", { method: "POST", body: input }),
  generateJewelryPlan: (input) =>
    apiRequest<Plan>("/api/v1/planners/jewelry/generate", { method: "POST", body: input }),
};
