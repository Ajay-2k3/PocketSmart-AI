import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { RequireAuth } from "@/components/layout/RequireAuth";
import { PlanResults } from "@/components/plan/PlanResults";
import { CardSkeleton, ErrorState, RecommendationSkeleton } from "@/components/common/states";
import { usePlan } from "@/hooks/usePlanQueries";

export type PlannerEditTarget = "/planner/home" | "/planner/party" | "/planner/jewelry";

export function PlanResultsPage({
  planId,
  title,
  editTo,
}: {
  planId: string;
  title: string;
  editTo: PlannerEditTarget;
}) {
  return (
    <RequireAuth>
      <ResultsContent planId={planId} title={title} editTo={editTo} />
    </RequireAuth>
  );
}

function ResultsContent({
  planId,
  title,
  editTo,
}: {
  planId: string;
  title: string;
  editTo: PlannerEditTarget;
}) {
  const { data: plan, isLoading, isError, refetch } = usePlan(planId);

  return (
    <AppLayout title={title} description="Your budget, allocation and recommendations.">
      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton lines={4} />
          <RecommendationSkeleton />
        </div>
      ) : isError || !plan ? (
        <ErrorState
          title="We couldn't load this plan"
          description="The plan may still be generating, or the link is incorrect."
          onRetry={() => void refetch()}
          extraAction={
            <>
              <Button asChild variant="outline">
                <Link to={editTo}>Start again</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/dashboard">Go to dashboard</Link>
              </Button>
            </>
          }
        />
      ) : (
        <PlanResults plan={plan} editTo={editTo} />
      )}
    </AppLayout>
  );
}
