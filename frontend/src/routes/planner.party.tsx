import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppLayout } from "@/components/layout/AppLayout";
import { RequireAuth } from "@/components/layout/RequireAuth";
import { PlannerProgress, StepCard, StepNav } from "@/components/planner/PlannerShell";
import { GenerationState } from "@/components/planner/GenerationState";
import { ErrorState } from "@/components/common/states";
import { AllocationBreakdown } from "@/components/budget/BudgetSummary";
import { partyPlannerSchema, type PartyPlannerValues } from "@/schemas";
import { useGeneratePartyPlan } from "@/hooks/usePlanQueries";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/planner/party")({ component: PartyPlannerRoute });

const steps = ["Event", "Budget & guests", "Preferences", "Review"];

const stepFields: Array<Array<keyof PartyPlannerValues>> = [
  ["eventType", "venueType", "eventDate", "location"],
  ["totalBudget", "guestCount"],
  ["foodPreference", "decorationPreference", "entertainmentPreference"],
  [],
];

const allocationSplit = [
  { category: "Catering", share: 0.45 },
  { category: "Decoration", share: 0.2 },
  { category: "Venue", share: 0.2 },
  { category: "Entertainment", share: 0.1 },
  { category: "Buffer", share: 0.05 },
];

function PartyPlannerRoute() {
  return (
    <RequireAuth>
      <PartyPlannerPage />
    </RequireAuth>
  );
}

function PartyPlannerPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const generate = useGeneratePartyPlan();

  const form = useForm<PartyPlannerValues>({
    resolver: zodResolver(partyPlannerSchema),
    mode: "onTouched",
    defaultValues: {
      totalBudget: 60000,
      currency: "INR",
      guestCount: 50,
      eventType: "birthday",
      venueType: "banquet-hall",
      eventDate: "",
      foodPreference: "",
      decorationPreference: "",
      entertainmentPreference: "",
      location: "",
      additionalRequirements: "",
    },
  });

  const values = form.watch();
  const allocations = useMemo(
    () =>
      allocationSplit.map((item) => ({
        category: item.category,
        amount: Math.round((values.totalBudget || 0) * item.share),
        percentage: Math.round(item.share * 100),
      })),
    [values.totalBudget],
  );
  const perGuest =
    values.guestCount > 0 ? Math.round((values.totalBudget || 0) / values.guestCount) : 0;

  const next = async () => {
    const fields = stepFields[step] ?? [];
    const valid = fields.length === 0 ? true : await form.trigger(fields as never);
    if (!valid) return;
    if (step < steps.length - 1) {
      setStep(step + 1);
      return;
    }
    void form.handleSubmit(onSubmit)();
  };

  const onSubmit = (data: PartyPlannerValues) => {
    if (generate.isPending) return;
    generate.mutate(data, {
      onSuccess: (plan) => {
        toast.success("Your party plan is ready");
        navigate({ to: "/planner/party/results/$planId", params: { planId: plan.id } });
      },
      onError: () => toast.error("We couldn't generate this plan. Please try again."),
    });
  };

  if (generate.isPending) {
    return (
      <AppLayout title="Party planner" description="Generating your plan…">
        <GenerationState />
      </AppLayout>
    );
  }

  if (generate.isError) {
    return (
      <AppLayout title="Party planner" description="Something went wrong.">
        <ErrorState
          title="We couldn't generate your plan"
          description="Your answers are still saved. Try again, or adjust them first."
          onRetry={() => form.handleSubmit(onSubmit)()}
          extraAction={
            <Button variant="outline" onClick={() => generate.reset()}>
              Edit my answers
            </Button>
          }
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Party planner" description="Balance catering, venue, decor and more.">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <PlannerProgress steps={steps} current={step} onStepSelect={setStep} />

          <Form {...form}>
            <form onSubmit={(event) => event.preventDefault()} className="space-y-6" noValidate>
              {step === 0 ? (
                <StepCard title="Tell us about the event">
                  <FormField
                    control={form.control}
                    name="eventType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="birthday">Birthday</SelectItem>
                            <SelectItem value="anniversary">Anniversary</SelectItem>
                            <SelectItem value="wedding-function">Wedding function</SelectItem>
                            <SelectItem value="corporate">Corporate event</SelectItem>
                            <SelectItem value="housewarming">Housewarming</SelectItem>
                            <SelectItem value="festival">Festival gathering</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="venueType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="home">At home</SelectItem>
                            <SelectItem value="banquet-hall">Banquet hall</SelectItem>
                            <SelectItem value="restaurant">Restaurant</SelectItem>
                            <SelectItem value="outdoor">Outdoor / garden</SelectItem>
                            <SelectItem value="resort">Resort</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="eventDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Pune" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </StepCard>
              ) : null}

              {step === 1 ? (
                <StepCard
                  title="Budget and guests"
                  description="The split on the right updates live."
                >
                  <FormField
                    control={form.control}
                    name="totalBudget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total budget (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1000}
                            value={field.value}
                            onChange={(event) => field.onChange(Number(event.target.value))}
                          />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(Number(field.value) || 0)}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guestCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of guests</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            value={field.value}
                            onChange={(event) => field.onChange(Number(event.target.value))}
                          />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          About {formatCurrency(perGuest)} per guest
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </StepCard>
              ) : null}

              {step === 2 ? (
                <StepCard title="Preferences" description="Optional, but they improve the picks.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="foodPreference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Food</FormLabel>
                          <FormControl>
                            <Input placeholder="Vegetarian buffet" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="decorationPreference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Decoration</FormLabel>
                          <FormControl>
                            <Input placeholder="Pastel balloons, fairy lights" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="entertainmentPreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entertainment</FormLabel>
                        <FormControl>
                          <Input placeholder="DJ, games for kids" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="additionalRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Anything else?</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={4}
                            placeholder="Nut allergies, evening start…"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </StepCard>
              ) : null}

              {step === 3 ? (
                <StepCard title="Review your event" description="Check this before we generate.">
                  <dl className="space-y-3 text-sm">
                    <Row label="Event" value={values.eventType} />
                    <Row label="Venue" value={values.venueType} />
                    <Row label="Date" value={values.eventDate || "Not set"} />
                    <Row label="Guests" value={String(values.guestCount)} />
                    <Row label="Budget" value={formatCurrency(values.totalBudget || 0)} />
                    <Row label="Per guest" value={formatCurrency(perGuest)} />
                    <Row label="Food" value={values.foodPreference || "No preference"} />
                    <Row
                      label="Decoration"
                      value={values.decorationPreference || "No preference"}
                    />
                    <Row
                      label="Entertainment"
                      value={values.entertainmentPreference || "No preference"}
                    />
                  </dl>
                </StepCard>
              ) : null}

              <StepNav
                onBack={() => setStep((current) => Math.max(current - 1, 0))}
                onNext={next}
                nextLabel="Generate plan"
                isFirst={step === 0}
                isLast={step === steps.length - 1}
                isSubmitting={generate.isPending}
              />
            </form>
          </Form>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Live budget split</CardTitle>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(values.totalBudget || 0)} across {values.guestCount || 0} guests
              </p>
            </CardHeader>
            <CardContent>
              <AllocationBreakdown allocations={allocations} currency="INR" />
            </CardContent>
          </Card>
        </aside>
      </div>
    </AppLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 rounded-lg border border-border px-4 py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium capitalize text-foreground">{value.replace(/-/g, " ")}</dd>
    </div>
  );
}
