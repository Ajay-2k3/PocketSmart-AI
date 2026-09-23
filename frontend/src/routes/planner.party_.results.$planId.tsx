import { createFileRoute, useParams } from "@tanstack/react-router";
import { PlanResultsPage } from "@/components/plan/PlanResultsPage";

export const Route = createFileRoute("/planner/party_/results/$planId")({
  component: PartyResultsRoute,
});

function PartyResultsRoute() {
  const { planId } = useParams({ from: "/planner/party_/results/$planId" });
  return <PlanResultsPage planId={planId} title="Party plan results" editTo="/planner/party" />;
}
