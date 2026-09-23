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

          <section aria-labelledby="start-heading" className="space-y-4">
            <h2 id="start-heading" className="text-lg font-semibold text-foreground">
              Start a new plan
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {plannerCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Card key={card.title} className="transition-shadow hover:shadow-md">
                    <CardContent className="pt-6">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <h3 className="mt-4 text-base font-semibold text-foreground">{card.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
                      <Button asChild variant="outline" className="mt-4 w-full">
                        <Link to={card.to}>
                          Start
                          <ArrowRight className="size-4" aria-hidden="true" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="recent-heading" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="recent-heading" className="text-lg font-semibold text-foreground">
                Recent plans
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
                <CardHeader>
                  <CardTitle className="text-base">
                    Last {Math.min(plans.length, 5)} plans
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {plans.slice(0, 5).map((plan) => (
                    <Link
                      key={plan.id}
                      to="/history/$planId"
                      params={{ planId: plan.id }}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-secondary/60"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{plan.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {plannerLabel(plan.plannerType)} · {formatDate(plan.createdAt)}
                        </p>
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
                        <span className="text-sm font-medium text-foreground">
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
