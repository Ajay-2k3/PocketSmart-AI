import { createFileRoute, useParams } from "@tanstack/react-router";
import { PlanResultsPage } from "@/components/plan/PlanResultsPage";

export const Route = createFileRoute("/planner/jewelry_/results/$planId")({
  component: JewelryResultsRoute,
});

function JewelryResultsRoute() {
  const { planId } = useParams({ from: "/planner/jewelry_/results/$planId" });
  return <PlanResultsPage planId={planId} title="Jewelry plan results" editTo="/planner/jewelry" />;
}
