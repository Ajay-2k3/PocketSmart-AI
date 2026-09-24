import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { historyApi, plannerApi, profileApi, recommendationApi } from "@/lib/api";
import { useAuth } from "@/providers/auth";
import type {
  HomePlannerInput,
  JewelryPlannerInput,
  PartyPlannerInput,
  UserProfile,
} from "@/types";

export const queryKeys = {
  plans: (userId?: string | null) => (userId ? (["plans", userId] as const) : (["plans"] as const)),
  plan: (id: string, userId?: string | null) =>
    userId ? (["plans", userId, id] as const) : (["plans", id] as const),
  recommendations: (planId: string, userId?: string | null) =>
    userId ? (["recommendations", userId, planId] as const) : (["recommendations", planId] as const),
  profile: (userId?: string | null) =>
    userId ? (["profile", userId] as const) : (["profile"] as const),
};

export function usePlans() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.plans(user?.id),
    queryFn: () => historyApi.listPlans(),
    enabled: Boolean(user?.id),
  });
}

export function usePlan(planId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.plan(planId, user?.id),
    queryFn: () => historyApi.getPlan(planId),
    enabled: Boolean(planId) && Boolean(user?.id),
    retry: false,
  });
}

export function useRecommendations(planId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.recommendations(planId, user?.id),
    queryFn: () => recommendationApi.listForPlan(planId),
    enabled: Boolean(planId) && Boolean(user?.id),
  });
}

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.profile(user?.id),
    queryFn: () => profileApi.get(),
    enabled: Boolean(user?.id),
    retry: false,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuth();
  return useMutation({
    mutationFn: (patch: Partial<Pick<UserProfile, "fullName" | "avatarUrl">>) =>
      profileApi.update(patch),
    onSuccess: (updated) => {
      if (updated) setUser(updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(user?.id) });
    },
  });
}

function usePlanInvalidation() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["plans"] });
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
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, saved }: { id: string; saved: boolean }) =>
      saved ? recommendationApi.unsave(id) : recommendationApi.save(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plan(planId, user?.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendations(planId, user?.id) });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => historyApi.deletePlan(planId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["plans"] }),
  });
}
