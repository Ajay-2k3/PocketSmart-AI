import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppLayout } from "@/components/layout/AppLayout";
import { RequireAuth } from "@/components/layout/RequireAuth";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState, ErrorState, HistorySkeleton } from "@/components/common/states";
import { useDeletePlan, usePlans } from "@/hooks/usePlanQueries";
import { formatCurrency, formatDate, plannerLabel } from "@/lib/format";

export const Route = createFileRoute("/history")({ component: HistoryRoute });

function HistoryRoute() {
  return (
    <RequireAuth>
      <HistoryPage />
    </RequireAuth>
  );
}

function HistoryPage() {
  const { data, isLoading, isError, refetch } = usePlans();
  const deletePlan = useDeletePlan();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("newest");

  const plans = useMemo(() => {
    const list = (data ?? []).filter((plan) => {
      const matchesType = type === "all" || plan.plannerType === type;
      const matchesQuery = plan.title.toLowerCase().includes(query.trim().toLowerCase());
      return matchesType && matchesQuery;
    });
    return list.sort((a, b) => {
      if (sort === "budget") return b.totalBudget - a.totalBudget;
      if (sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [data, query, type, sort]);

  return (
    <AppLayout title="History" description="Every plan you have generated.">
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search plans by name"
              aria-label="Search plans"
              className="pl-9"
            />
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="sm:w-44" aria-label="Filter by planner type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All planners</SelectItem>
              <SelectItem value="home">Home setup</SelectItem>
              <SelectItem value="party">Party</SelectItem>
              <SelectItem value="jewelry">Jewelry</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="sm:w-44" aria-label="Sort plans">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="budget">Largest budget</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <HistorySkeleton />
        ) : isError ? (
          <ErrorState
            title="We couldn't load your history"
            description="Please try again in a moment."
            onRetry={() => void refetch()}
          />
        ) : plans.length === 0 ? (
          <EmptyState
            title={data && data.length > 0 ? "No plans match your filters" : "No plans yet"}
            description={
              data && data.length > 0
                ? "Try a different search term or planner type."
                : "Create a plan and it will appear here."
            }
            action={
              <Button asChild>
                <Link to="/planner/home">Start a plan</Link>
              </Button>
            }
          />
        ) : (
          <ul className="space-y-3">
            {plans.map((plan) => {
              const over = plan.estimatedCost > plan.totalBudget;
              return (
                <li key={plan.id}>
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-medium text-foreground">{plan.title}</p>
                          <Badge variant="secondary">{plannerLabel(plan.plannerType)}</Badge>
                          <Badge
                            variant="outline"
                            className={
                              over
                                ? "border-destructive/40 bg-destructive/10 text-destructive"
                                : "border-success/40 bg-success/10 text-success"
                            }
                          >
                            {over ? "Over budget" : "Within budget"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatDate(plan.createdAt)} · Budget{" "}
                          {formatCurrency(plan.totalBudget, plan.currency)} · Planned{" "}
                          {formatCurrency(plan.estimatedCost, plan.currency)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link to="/history/$planId" params={{ planId: plan.id }}>
                            Open
                          </Link>
                        </Button>
                        <ConfirmDialog
                          title="Delete this plan?"
                          description="This removes the plan and its recommendations. This cannot be undone."
                          confirmLabel="Delete plan"
                          onConfirm={() =>
                            deletePlan.mutate(plan.id, {
                              onSuccess: () => toast.success("Plan deleted"),
                              onError: () => toast.error("Could not delete this plan."),
                            })
                          }
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Delete ${plan.title}`}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="size-4" aria-hidden="true" />
                            </Button>
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppLayout>
  );
}
