import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Pencil, Printer, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetSummaryCard, AllocationBreakdown } from "@/components/budget/BudgetSummary";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { EmptyState } from "@/components/common/states";
import { formatDate, plannerLabel } from "@/lib/format";
import { useSaveRecommendation } from "@/hooks/usePlanQueries";
import type { Plan } from "@/types";

export function PlanResults({ plan, editTo }: { plan: Plan; editTo?: string }) {
  const saveMutation = useSaveRecommendation(plan.id);
  const overBudget = plan.budget.estimatedCost > plan.budget.totalBudget;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">{plan.title}</h2>
            <Badge variant="secondary">{plannerLabel(plan.plannerType)}</Badge>
            {plan.partial ? <Badge variant="outline">Partial results</Badge> : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Created {formatDate(plan.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {editTo ? (
            <Button asChild variant="outline">
              <Link to={editTo}>
                <Pencil className="size-4" aria-hidden="true" />
                Edit inputs
              </Link>
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="size-4" aria-hidden="true" />
            Print / save PDF
          </Button>
          <Button asChild>
            <Link to="/dashboard">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to dashboard
            </Link>
          </Button>
        </div>
      </div>

      {overBudget ? (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" aria-hidden="true" />
          <AlertTitle>This plan is over your budget</AlertTitle>
          <AlertDescription>
            The estimated cost exceeds the budget you entered. Review the highest-impact items or
            raise the budget and generate again.
          </AlertDescription>
        </Alert>
      ) : null}

      {plan.partial ? (
        <Alert>
          <AlertTriangle className="size-4" aria-hidden="true" />
          <AlertTitle>Some results are still incomplete</AlertTitle>
          <AlertDescription>
            A few categories could not be filled this time. Everything shown below is usable; you can
            generate again for the remaining items.
          </AlertDescription>
        </Alert>
      ) : null}

      <BudgetSummaryCard budget={plan.budget} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            AI summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">{plan.aiSummary}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Budget allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <AllocationBreakdown
            allocations={plan.allocations}
            currency={plan.budget.currency}
          />
        </CardContent>
      </Card>

      {plan.warnings.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Things to watch</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan.warnings.map((warning) => (
                <li
                  key={warning}
                  className="flex gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-foreground"
                >
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
                  {warning}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <section aria-labelledby="recommendations-heading" className="space-y-4">
        <h3 id="recommendations-heading" className="text-lg font-semibold text-foreground">
          Recommendations ({plan.recommendations.length})
        </h3>
        {plan.recommendations.length === 0 ? (
          <EmptyState
            title="No recommendations in this plan"
            description="Generate the plan again with a slightly higher budget or fewer constraints."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {plan.recommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                isSaving={saveMutation.isPending}
                onToggleSave={(item) =>
                  saveMutation.mutate(
                    { id: item.id, saved: item.saved },
                    {
                      onSuccess: () =>
                        toast.success(item.saved ? "Removed from saved" : "Saved to your plan"),
                      onError: () => toast.error("Could not update this item. Try again."),
                    },
                  )
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
