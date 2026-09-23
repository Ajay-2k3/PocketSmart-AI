import type { ReactNode } from "react";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function PlannerProgress({
  steps,
  current,
  onStepSelect,
}: {
  steps: string[];
  current: number;
  onStepSelect?: (index: number) => void;
}) {
  const percent = Math.round(((current + 1) / steps.length) * 100);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <p className="font-medium text-foreground">
          Step {current + 1} of {steps.length}: {steps[current]}
        </p>
        <p className="text-muted-foreground">{percent}% complete</p>
      </div>
      <Progress value={percent} aria-label={`Planner progress: ${percent}%`} />
      <ol className="hidden flex-wrap gap-2 md:flex">
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li key={step}>
              <button
                type="button"
                onClick={() => onStepSelect?.(index)}
                disabled={!onStepSelect || index > current}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:cursor-default ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : done
                      ? "border-success/40 bg-success/10 text-success"
                      : "border-border bg-card text-muted-foreground"
                }`}
              >
                {done ? <Check className="size-3" aria-hidden="true" /> : null}
                {step}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function StepCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  );
}

export function StepNav({
  onBack,
  onNext,
  nextLabel = "Continue",
  isFirst,
  isLast,
  isSubmitting,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  isFirst: boolean;
  isLast: boolean;
  isSubmitting?: boolean;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
      <Button type="button" variant="outline" onClick={onBack} disabled={isFirst || isSubmitting}>
        <ChevronLeft className="size-4" aria-hidden="true" />
        Back
      </Button>
      <Button type="button" onClick={onNext} disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <ChevronRight className="size-4" aria-hidden="true" />
        )}
        {isLast ? nextLabel : "Continue"}
      </Button>
    </div>
  );
}
