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
    <AppLayout
      title="Recommendation History"
      description="View and manage all your previous budget plans and recommendations."
    >
      <div className="space-y-6">
        {/* Banner matching Milestone 5 PDF Page 38 */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 text-center shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Your Recommendation History
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-blue-200">
            View and manage all your previous budget plans and recommendations
          </p>
        </div>

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
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              Recent Recommendations
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => {
                const remaining = Math.max(plan.totalBudget - plan.estimatedCost, 0);

                return (
                  <Card
                    key={plan.id}
                    className="flex flex-col justify-between transition-all hover:shadow-md border border-border"
                  >
                    <CardContent className="p-5 space-y-4">
                      {/* Card Header with Category & Timestamp */}
                      <div className="flex items-start justify-between gap-2 border-b border-border/50 pb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex size-8 items-center justify-center rounded-lg text-white font-bold text-xs ${
                              plan.plannerType === "home"
                                ? "bg-blue-600"
                                : plan.plannerType === "party"
                                  ? "bg-amber-600"
                                  : "bg-purple-600"
                            }`}
                          >
                            {plan.plannerType === "home"
                              ? "🏠"
                              : plan.plannerType === "party"
                                ? "🎉"
                                : "💎"}
                          </span>
                          <div>
                            <h3 className="font-bold text-sm sm:text-base text-foreground capitalize">
                              {plan.plannerType === "home"
                                ? "Home Interior Budget"
                                : plan.plannerType === "party"
                                  ? "Party Planning Budget"
                                  : "Jewelry Budget"}
                            </h3>
                          </div>
                        </div>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {formatDate(plan.createdAt)}
                        </span>
                      </div>

                      {/* Budget Metrics */}
                      <div className="grid grid-cols-2 gap-2 bg-secondary/40 rounded-lg p-3 text-xs">
                        <div>
                          <p className="text-muted-foreground font-medium">Total Budget</p>
                          <p className="text-sm font-bold text-foreground mt-0.5">
                            {formatCurrency(plan.totalBudget, plan.currency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-medium">Remaining</p>
                          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {formatCurrency(remaining, plan.currency)}
                          </p>
                        </div>
                      </div>

                      {/* Context / Input details */}
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        <p className="font-medium text-foreground truncate">{plan.title}</p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <Badge variant="secondary" className="text-[10px] capitalize font-medium">
                            {plan.plannerType}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-medium ${
                              plan.estimatedCost > plan.totalBudget
                                ? "border-destructive/40 bg-destructive/10 text-destructive"
                                : "border-success/40 bg-success/10 text-success"
                            }`}
                          >
                            {plan.estimatedCost > plan.totalBudget
                              ? "Over budget"
                              : "Within budget"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>

                    {/* Card Actions */}
                    <div className="p-5 pt-0 flex gap-2">
                      <Button
                        asChild
                        className="flex-1 bg-[#1e3a5f] hover:bg-[#152a45] text-white"
                        size="sm"
                      >
                        <Link to="/history/$planId" params={{ planId: plan.id }}>
                          View Full Details
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
                            variant="outline"
                            size="sm"
                            aria-label={`Delete ${plan.title}`}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 px-2.5"
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </Button>
                        }
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
