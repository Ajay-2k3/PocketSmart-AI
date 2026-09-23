import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { RequireAuth } from "@/components/layout/RequireAuth";
import { PlanResults } from "@/components/plan/PlanResults";
import { CardSkeleton, ErrorState } from "@/components/common/states";
import { usePlan } from "@/hooks/usePlanQueries";

export const Route = createFileRoute("/history_/$planId")({ component: PlanDetailRoute });

function PlanDetailRoute() {
  return (
    <RequireAuth>
      <PlanDetailPage />
    </RequireAuth>
  );
}

const editTargets = {
  home: "/planner/home",
  party: "/planner/party",
  jewelry: "/planner/jewelry",
} as const;

function PlanDetailPage() {
  const { planId } = useParams({ from: "/history_/$planId" });
  const { data: plan, isLoading, isError, refetch } = usePlan(planId);

  return (
    <AppLayout title="Plan detail" description="Full breakdown of this plan.">
      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton lines={4} />
          <CardSkeleton lines={6} />
        </div>
      ) : isError || !plan ? (
        <ErrorState
          title="We couldn't find this plan"
          description="It may have been deleted, or the link is incorrect."
          onRetry={() => void refetch()}
          extraAction={
            <Button asChild variant="outline">
              <Link to="/history">Back to history</Link>
            </Button>
          }
        />
      ) : (
        <PlanResults plan={plan} editTo={editTargets[plan.plannerType]} />
      )}
    </AppLayout>
  );
}
