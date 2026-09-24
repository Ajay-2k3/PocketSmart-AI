import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Gem, PartyPopper, PiggyBank, Sofa, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
import { RequireAuth } from "@/components/layout/RequireAuth";
import { DashboardSkeleton, EmptyState, ErrorState } from "@/components/common/states";
import { usePlans } from "@/hooks/usePlanQueries";
import { useAuth } from "@/providers/auth";
import { formatCurrency, formatDate, plannerLabel } from "@/lib/format";

export const Route = createFileRoute("/dashboard")({ component: DashboardRoute });

const plannerCards = [
  {
    icon: Sofa,
    title: "Home setup",
    description: "Furnish rooms within a set budget.",
    to: "/planner/home" as const,
  },
  {
    icon: PartyPopper,
    title: "Party",
    description: "Split spend across catering, venue and more.",
    to: "/planner/party" as const,
  },
  {
    icon: Gem,
    title: "Jewelry",
    description: "Find pieces that match your occasion.",
    to: "/planner/jewelry" as const,
  },
];

function DashboardRoute() {
  return (
    <RequireAuth>
      <DashboardPage />
    </RequireAuth>
  );
}

function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = usePlans();
  const plans = data ?? [];

  const totalPlanned = plans.reduce((sum, plan) => sum + plan.estimatedCost, 0);
  const totalBudget = plans.reduce((sum, plan) => sum + plan.totalBudget, 0);
  const saved = Math.max(totalBudget - totalPlanned, 0);

  const firstName = (user?.fullName || user?.email || "")?.split(" ")[0];

  return (
    <AppLayout
      title={firstName ? `Hello, ${firstName}` : "Hello"}
      description="Your plans and budgets at a glance."
    >
      {isLoading ? (
        <DashboardSkeleton />
      ) : isError ? (
        <ErrorState
          title="We couldn't load your plans"
          description="Check your connection and try again."
          onRetry={() => void refetch()}
        />
      ) : (
        <div className="space-y-8">
          {/* Hero Welcome Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-lg">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome, {firstName || "Smart Planner"}!
              </h2>
              <p className="text-blue-200 text-sm sm:text-base leading-relaxed">
                Choose a budget planner to get started with your personalized financial planning
                experience.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Plans created"
              value={String(plans.length)}
              icon={<Wallet className="size-4" />}
            />
            <StatCard
              label="Total budget"
              value={formatCurrency(totalBudget)}
              icon={<Wallet className="size-4" />}
            />
            <StatCard
              label="Planned spend"
              value={formatCurrency(totalPlanned)}
              icon={<Wallet className="size-4" />}
            />
            <StatCard
              label="Kept aside"
              value={formatCurrency(saved)}
              icon={<PiggyBank className="size-4" />}
              tone="success"
            />
          </div>

          {/* Our Smart Budget Planners - Milestone 5 PDF Page 31 */}
          <section aria-labelledby="start-heading" className="space-y-4">
            <div className="text-center py-2 space-y-1">
              <h2 id="start-heading" className="text-xl sm:text-2xl font-bold text-foreground">
                Our Smart Budget Planners
              </h2>
              <p className="text-sm text-muted-foreground">
                Discover how PocketSmart helps you make better financial decisions across different
                areas of your life.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Home Interior Card */}
              <Card className="flex flex-col justify-between transition-all hover:shadow-lg border-t-4 border-t-blue-600">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    <Sofa className="size-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    Home Interior Budget Planner
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Plan your interior design budget efficiently with AI-powered recommendations for
                    furniture, lighting, and decor.
                  </p>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button asChild className="w-full bg-[#1e3a5f] hover:bg-[#152a45] text-white">
                    <Link to="/planner/home">Get Started</Link>
                  </Button>
                </div>
              </Card>

              {/* Party Budget Card */}
              <Card className="flex flex-col justify-between transition-all hover:shadow-lg border-t-4 border-t-indigo-600">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <PartyPopper className="size-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Party Budget Planner</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Plan your perfect event with budget allocations for venue, catering,
                    decorations, and entertainment.
                  </p>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button asChild className="w-full bg-[#1e3a5f] hover:bg-[#152a45] text-white">
                    <Link to="/planner/party">Get Started</Link>
                  </Button>
                </div>
              </Card>

              {/* Jewelry Budget Card */}
              <Card className="flex flex-col justify-between transition-all hover:shadow-lg border-t-4 border-t-amber-600">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                    <Gem className="size-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Jewelry Budget Planner</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Find the ideal jewelry pieces for any occasion that match your outfit and stay
                    within your available budget.
                  </p>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button asChild className="w-full bg-[#1e3a5f] hover:bg-[#152a45] text-white">
                    <Link to="/planner/jewelry">Get Started</Link>
                  </Button>
                </div>
              </Card>
            </div>

            {/* View All Recommendation History Button */}
            <div className="pt-2 text-center">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                <Link to="/history" className="gap-2">
                  View All Recommendation History
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </section>

          {/* Recent Activity */}
          <section aria-labelledby="recent-heading" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2
                id="recent-heading"
                className="text-lg font-bold text-foreground flex items-center gap-2"
              >
                <Wallet className="size-5 text-blue-600" />
                Recent Activity
              </h2>
              <Button asChild variant="ghost" size="sm">
                <Link to="/history">View all</Link>
              </Button>
            </div>

            {plans.length === 0 ? (
              <EmptyState
                title="No plans yet"
                description="Create your first plan and PocketSmart AI will do the budget maths for you."
                action={
                  <Button asChild>
                    <Link to="/planner/home">Create your first plan</Link>
                  </Button>
                }
              />
            ) : (
              <Card>
                <CardContent className="space-y-3 pt-6">
                  {plans.slice(0, 5).map((plan) => (
                    <Link
                      key={plan.id}
                      to="/history/$planId"
                      params={{ planId: plan.id }}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3.5 transition-all hover:bg-secondary/60 hover:shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                          {plan.plannerType === "home" ? (
                            <Sofa className="size-4" />
                          ) : plan.plannerType === "party" ? (
                            <PartyPopper className="size-4" />
                          ) : (
                            <Gem className="size-4" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">{plan.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Budget: {formatCurrency(plan.totalBudget, plan.currency)} · Created on{" "}
                            {formatDate(plan.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={
                            plan.estimatedCost > plan.totalBudget
                              ? "border-destructive/40 bg-destructive/10 text-destructive"
                              : "border-success/40 bg-success/10 text-success"
                          }
                        >
                          {plan.estimatedCost > plan.totalBudget ? "Over budget" : "Within budget"}
                        </Badge>
                        <span className="text-sm font-bold text-foreground">
                          {formatCurrency(plan.estimatedCost, plan.currency)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      )}
    </AppLayout>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: "default" | "success";
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {icon}
          {label}
        </p>
        <p
          className={`mt-2 text-2xl font-semibold ${tone === "success" ? "text-success" : "text-foreground"}`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
