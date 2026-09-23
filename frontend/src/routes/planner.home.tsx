import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
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
import { ErrorState } from "@/components/common/states";
import { homePlannerSchema, type HomePlannerValues } from "@/schemas";
import { useGenerateHomePlan } from "@/hooks/usePlanQueries";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/planner/home")({ component: HomePlannerRoute });

const steps = ["Budget", "Rooms", "Requirements", "Preferences", "Review"];

const stepFields: Array<Array<keyof HomePlannerValues>> = [
  ["totalBudget", "flexibility"],
  ["rooms"],
  ["requirements"],
  ["style", "colorPreference", "qualityPreference", "brandPreference"],
  [],
];

function HomePlannerRoute() {
  return (
    <RequireAuth>
      <HomePlannerPage />
    </RequireAuth>
  );
}

function HomePlannerPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const generate = useGenerateHomePlan();

  const form = useForm<HomePlannerValues>({
    resolver: zodResolver(homePlannerSchema),
    mode: "onTouched",
    defaultValues: {
      totalBudget: 50000,
      currency: "INR",
      flexibility: "moderate",
      rooms: [{ name: "Living room", quantity: 1, notes: "" }],
      requirements: [{ category: "Sofa", quantity: 1, priority: "high", preferredStyle: "" }],
      style: "",
      colorPreference: "",
      qualityPreference: "",
      brandPreference: "",
      otherRequirements: "",
    },
  });

  const rooms = useFieldArray({ control: form.control, name: "rooms" });
  const requirements = useFieldArray({ control: form.control, name: "requirements" });

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

  const onSubmit = (values: HomePlannerValues) => {
    if (generate.isPending) return;
    generate.mutate(values, {
      onSuccess: (plan) => {
        toast.success("Your home plan is ready");
        navigate({ to: "/planner/home/results/$planId", params: { planId: plan.id } });
      },
      onError: () => toast.error("We couldn't generate this plan. Please try again."),
    });
  };

  const values = form.watch();

  if (generate.isPending) {
    return (
      <AppLayout title="Home setup planner" description="Generating your plan…">
        <GenerationState />
      </AppLayout>
    );
  }

  if (generate.isError) {
    return (
      <AppLayout title="Home setup planner" description="Something went wrong.">
        <ErrorState
          title="We couldn't generate your plan"
          description="Your answers are still saved. Try again, or go back and adjust them."
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
    <AppLayout title="Home setup planner" description="Five quick steps to a costed plan.">
      <div className="mx-auto max-w-3xl space-y-6">
        <PlannerProgress steps={steps} current={step} onStepSelect={setStep} />

        <Form {...form}>
          <form onSubmit={(event) => event.preventDefault()} className="space-y-6" noValidate>
            {step === 0 ? (
              <StepCard
                title="What is your budget?"
                description="We plan inside this number and tell you if something doesn't fit."
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
                          inputMode="numeric"
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
                  name="flexibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How flexible is this budget?</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="strict">Strict — do not exceed</SelectItem>
                          <SelectItem value="moderate">Moderate — a little room</SelectItem>
                          <SelectItem value="flexible">Flexible — quality first</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </StepCard>
            ) : null}

            {step === 1 ? (
              <StepCard title="Which rooms are you setting up?" description="Add each room you want covered.">
                <div className="space-y-4">
                  {rooms.fields.map((item, index) => (
                    <div key={item.id} className="rounded-lg border border-border p-4">
                      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto]">
                        <FormField
                          control={form.control}
                          name={`rooms.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Room</FormLabel>
                              <FormControl>
                                <Input placeholder="Bedroom" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`rooms.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>How many</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  value={field.value}
                                  onChange={(event) => field.onChange(Number(event.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove room ${index + 1}`}
                            disabled={rooms.fields.length === 1}
                            onClick={() => rooms.remove(index)}
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                      <FormField
                        control={form.control}
                        name={`rooms.${index}.notes`}
                        render={({ field }) => (
                          <FormItem className="mt-3">
                            <FormLabel>Notes (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Small room, needs storage" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => rooms.append({ name: "", quantity: 1, notes: "" })}
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    Add room
                  </Button>
                </div>
              </StepCard>
            ) : null}

            {step === 2 ? (
              <StepCard
                title="What do you need to buy?"
                description="Set a priority so essentials are funded first."
              >
                <div className="space-y-4">
                  {requirements.fields.map((item, index) => (
                    <div key={item.id} className="rounded-lg border border-border p-4">
                      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
                        <FormField
                          control={form.control}
                          name={`requirements.${index}.category`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Item</FormLabel>
                              <FormControl>
                                <Input placeholder="Dining table" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`requirements.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Qty</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  value={field.value}
                                  onChange={(event) => field.onChange(Number(event.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`requirements.${index}.priority`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove item ${index + 1}`}
                            disabled={requirements.fields.length === 1}
                            onClick={() => requirements.remove(index)}
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      requirements.append({
                        category: "",
                        quantity: 1,
                        priority: "medium",
                        preferredStyle: "",
                      })
                    }
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    Add item
                  </Button>
                </div>
              </StepCard>
            ) : null}

            {step === 3 ? (
              <StepCard title="Your preferences" description="All optional — they sharpen the picks.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField control={form.control} name="style" label="Style" placeholder="Modern, minimal" />
                  <TextField
                    control={form.control}
                    name="colorPreference"
                    label="Colours"
                    placeholder="Warm neutrals"
                  />
                  <TextField
                    control={form.control}
                    name="qualityPreference"
                    label="Quality"
                    placeholder="Mid-range, long lasting"
                  />
                  <TextField
                    control={form.control}
                    name="brandPreference"
                    label="Brands"
                    placeholder="Any, or name a few"
                  />
                </div>
                <FormField
                  control={form.control}
                  name="otherRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anything else?</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Pet-friendly fabrics, no glass tables…" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </StepCard>
            ) : null}

            {step === 4 ? (
              <StepCard title="Review your plan inputs" description="Check this before we generate.">
                <dl className="space-y-3 text-sm">
                  <ReviewRow label="Budget" value={formatCurrency(values.totalBudget || 0)} />
                  <ReviewRow label="Flexibility" value={values.flexibility} />
                  <ReviewRow
                    label="Rooms"
                    value={values.rooms.map((room) => `${room.name} ×${room.quantity}`).join(", ")}
                  />
                  <ReviewRow
                    label="Items"
                    value={values.requirements
                      .map((item) => `${item.category} ×${item.quantity} (${item.priority})`)
                      .join(", ")}
                  />
                  <ReviewRow label="Style" value={values.style || "No preference"} />
                  <ReviewRow label="Colours" value={values.colorPreference || "No preference"} />
                  <ReviewRow label="Quality" value={values.qualityPreference || "No preference"} />
                  <ReviewRow label="Brands" value={values.brandPreference || "No preference"} />
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

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 rounded-lg border border-border px-4 py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

function TextField({
  control,
  name,
  label,
  placeholder,
}: {
  control: ReturnType<typeof useForm<HomePlannerValues>>["control"];
  name: "style" | "colorPreference" | "qualityPreference" | "brandPreference";
  label: string;
  placeholder: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input placeholder={placeholder} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
