import { createFileRoute, useParams } from "@tanstack/react-router";
import { PlanResultsPage } from "@/components/plan/PlanResultsPage";

export const Route = createFileRoute("/planner/home_/results/$planId")({
  component: HomeResultsRoute,
});

function HomeResultsRoute() {
  const { planId } = useParams({ from: "/planner/home_/results/$planId" });
  return <PlanResultsPage planId={planId} title="Home plan results" editTo="/planner/home" />;
}
