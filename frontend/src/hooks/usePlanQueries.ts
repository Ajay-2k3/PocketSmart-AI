import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { historyApi, plannerApi, profileApi, recommendationApi } from "@/lib/api";
import type {
  HomePlannerInput,
  JewelryPlannerInput,
  PartyPlannerInput,
  UserProfile,
} from "@/types";

export const queryKeys = {
  plans: ["plans"] as const,
  plan: (id: string) => ["plans", id] as const,
  recommendations: (planId: string) => ["recommendations", planId] as const,
  profile: ["profile"] as const,
};

export function usePlans() {
  return useQuery({ queryKey: queryKeys.plans, queryFn: () => historyApi.listPlans() });
}

export function usePlan(planId: string) {
  return useQuery({
    queryKey: queryKeys.plan(planId),
    queryFn: () => historyApi.getPlan(planId),
    enabled: Boolean(planId),
    retry: false,
  });
}

export function useRecommendations(planId: string) {
  return useQuery({
    queryKey: queryKeys.recommendations(planId),
    queryFn: () => recommendationApi.listForPlan(planId),
    enabled: Boolean(planId),
  });
}

export function useProfile() {
  return useQuery({ queryKey: queryKeys.profile, queryFn: () => profileApi.get(), retry: false });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Pick<UserProfile, "fullName" | "avatarUrl">>) =>
      profileApi.update(patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.profile }),
  });
}

function usePlanInvalidation() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.plans });
}

export function useGenerateHomePlan() {
  const invalidate = usePlanInvalidation();
  return useMutation({
    mutationFn: (input: HomePlannerInput) => plannerApi.generateHomePlan(input),
    onSuccess: invalidate,
  });
}

export function useGeneratePartyPlan() {
  const invalidate = usePlanInvalidation();
  return useMutation({
    mutationFn: (input: PartyPlannerInput) => plannerApi.generatePartyPlan(input),
    onSuccess: invalidate,
  });
}

export function useGenerateJewelryPlan() {
  const invalidate = usePlanInvalidation();
  return useMutation({
    mutationFn: (input: JewelryPlannerInput) => plannerApi.generateJewelryPlan(input),
    onSuccess: invalidate,
  });
}

export function useSaveRecommendation(planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, saved }: { id: string; saved: boolean }) =>
      saved ? recommendationApi.unsave(id) : recommendationApi.save(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plan(planId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendations(planId) });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => historyApi.deletePlan(planId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.plans }),
  });
}
