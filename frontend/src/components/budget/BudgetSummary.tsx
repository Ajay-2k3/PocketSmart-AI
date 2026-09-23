import { AlertTriangle, PiggyBank, TrendingDown, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/format";
import type { BudgetSummary as BudgetSummaryType, CategoryAllocation } from "@/types";

export function BudgetSummaryCard({ budget }: { budget: BudgetSummaryType }) {
  const overBudget = budget.estimatedCost > budget.totalBudget;
  const utilization = Math.min(Math.round(budget.utilization), 200);

  return (
    <Card>
      <CardContent className="space-y-5 pt-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            label="Total budget"
            value={formatCurrency(budget.totalBudget, budget.currency)}
            icon={<Wallet className="size-4" aria-hidden="true" />}
          />
          <Metric
            label="Estimated cost"
            value={formatCurrency(budget.estimatedCost, budget.currency)}
            icon={<TrendingDown className="size-4" aria-hidden="true" />}
            tone={overBudget ? "danger" : "default"}
          />
          <Metric
            label={overBudget ? "Over budget by" : "Remaining"}
            value={formatCurrency(Math.abs(budget.remaining), budget.currency)}
            icon={
              overBudget ? (
                <AlertTriangle className="size-4" aria-hidden="true" />
              ) : (
                <PiggyBank className="size-4" aria-hidden="true" />
              )
            }
            tone={overBudget ? "danger" : "success"}
          />
          <Metric
            label="Savings vs budget"
            value={formatCurrency(Math.max(budget.savings, 0), budget.currency)}
            icon={<PiggyBank className="size-4" aria-hidden="true" />}
            tone="success"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Budget used</span>
            <span className={overBudget ? "text-destructive" : "text-muted-foreground"}>
              {utilization}%
            </span>
          </div>
          <Progress
            value={Math.min(utilization, 100)}
            aria-label={`Budget used: ${utilization}%`}
            className={overBudget ? "[&>div]:bg-destructive" : ""}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: "default" | "success" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "danger"
        ? "text-destructive"
        : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className={`mt-2 text-xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

const barColors = ["bg-primary", "bg-accent", "bg-success", "bg-warning", "bg-muted-foreground"];

export function AllocationBreakdown({
  allocations,
  currency,
}: {
  allocations: CategoryAllocation[];
  currency: string;
}) {
  if (allocations.length === 0) return null;
  return (
    <div className="@container space-y-4">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary">
        {allocations.map((item, index) => (
          <div
            key={item.category}
            className={barColors[index % barColors.length]}
            style={{ width: `${Math.max(item.percentage, 1)}%` }}
            title={`${item.category}: ${item.percentage}%`}
          />
        ))}
      </div>
      <ul className="grid gap-3 @md:grid-cols-2">
        {allocations.map((item, index) => (
          <li
            key={item.category}
            className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg border border-border bg-background px-4 py-3"
          >
            <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-foreground">
              <span
                className={`size-2.5 shrink-0 rounded-full ${barColors[index % barColors.length]}`}
                aria-hidden="true"
              />
              <span className="truncate">{item.category}</span>
            </span>
            <span className="whitespace-nowrap text-sm text-muted-foreground">
              {formatCurrency(item.amount, currency)} · {item.percentage}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
