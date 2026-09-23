import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { ImageUploader } from "@/components/planner/ImageUploader";
import { ErrorState } from "@/components/common/states";
import { jewelryPlannerSchema, type JewelryPlannerValues } from "@/schemas";
import { useGenerateJewelryPlan } from "@/hooks/usePlanQueries";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/planner/jewelry")({ component: JewelryPlannerRoute });

const steps = ["Occasion", "Budget", "Preferences", "Review"];

const stepFields: Array<Array<keyof JewelryPlannerValues>> = [
  ["occasion", "jewelryType", "style"],
  ["totalBudget"],
  ["metalPreference", "colorPreference"],
  [],
];

function JewelryPlannerRoute() {
  return (
    <RequireAuth>
      <JewelryPlannerPage />
    </RequireAuth>
  );
}

function JewelryPlannerPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const generate = useGenerateJewelryPlan();

  const form = useForm<JewelryPlannerValues>({
    resolver: zodResolver(jewelryPlannerSchema),
    mode: "onTouched",
    defaultValues: {
      totalBudget: 25000,
      currency: "INR",
      occasion: "wedding",
      jewelryType: "necklace",
      style: "traditional",
      metalPreference: "",
      colorPreference: "",
      additionalRequirements: "",
      outfitImageName: "",
    },
  });

  const values = form.watch();

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

  const onSubmit = (data: JewelryPlannerValues) => {
    if (generate.isPending) return;
    generate.mutate(data, {
      onSuccess: (plan) => {
        toast.success("Your jewelry plan is ready");
        navigate({ to: "/planner/jewelry/results/$planId", params: { planId: plan.id } });
      },
      onError: () => toast.error("We couldn't generate this plan. Please try again."),
    });
  };

  if (generate.isPending) {
    return (
      <AppLayout title="Jewelry planner" description="Generating your plan…">
        <GenerationState />
      </AppLayout>
    );
  }

  if (generate.isError) {
    return (
      <AppLayout title="Jewelry planner" description="Something went wrong.">
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
    <AppLayout title="Jewelry planner" description="Pieces matched to your occasion and budget.">
      <div className="mx-auto max-w-3xl space-y-6">
        <PlannerProgress steps={steps} current={step} onStepSelect={setStep} />

        <Form {...form}>
          <form onSubmit={(event) => event.preventDefault()} className="space-y-6" noValidate>
            {step === 0 ? (
              <StepCard title="What is this for?">
                <FormField
                  control={form.control}
                  name="occasion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occasion</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="wedding">Wedding</SelectItem>
                          <SelectItem value="engagement">Engagement</SelectItem>
                          <SelectItem value="festival">Festival</SelectItem>
                          <SelectItem value="gift">Gift</SelectItem>
                          <SelectItem value="daily">Daily wear</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jewelryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type of jewelry</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="necklace">Necklace</SelectItem>
                          <SelectItem value="earrings">Earrings</SelectItem>
                          <SelectItem value="ring">Ring</SelectItem>
                          <SelectItem value="bangles">Bangles</SelectItem>
                          <SelectItem value="full-set">Full set</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="style"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Style</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="traditional">Traditional</SelectItem>
                          <SelectItem value="contemporary">Contemporary</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="statement">Statement</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </StepCard>
            ) : null}

            {step === 1 ? (
              <StepCard title="Your budget">
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
              </StepCard>
            ) : null}

            {step === 2 ? (
              <StepCard
                title="Preferences"
                description="Add an outfit photo if you want pieces that match it."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="metalPreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Metal</FormLabel>
                        <FormControl>
                          <Input placeholder="Gold, silver, rose gold" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="colorPreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stone / colour</FormLabel>
                        <FormControl>
                          <Input placeholder="Emerald green accents" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <ImageUploader
                  onChange={(file) => form.setValue("outfitImageName", file?.name ?? "")}
                />
                <p className="text-xs text-muted-foreground">
                  Your photo stays in this browser. It is only used to describe the outfit with your
                  plan.
                </p>

                <FormField
                  control={form.control}
                  name="additionalRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anything else?</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Lightweight, hallmarked only…" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </StepCard>
            ) : null}

            {step === 3 ? (
              <StepCard title="Review" description="Check this before we generate.">
                <dl className="space-y-3 text-sm">
                  <Row label="Occasion" value={values.occasion} />
                  <Row label="Type" value={values.jewelryType} />
                  <Row label="Style" value={values.style} />
                  <Row label="Budget" value={formatCurrency(values.totalBudget || 0)} />
                  <Row label="Metal" value={values.metalPreference || "No preference"} />
                  <Row label="Colour" value={values.colorPreference || "No preference"} />
                  <Row label="Outfit photo" value={values.outfitImageName || "Not added"} />
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
