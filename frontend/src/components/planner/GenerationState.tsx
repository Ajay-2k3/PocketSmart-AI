import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const stages = [
  "Analyzing your requirements…",
  "Optimizing your budget…",
  "Finding suitable recommendations…",
  "Preparing your plan…",
];

export function GenerationState() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current < stages.length - 1 ? current + 1 : current));
    }, 900);
    return () => clearInterval(timer);
  }, []);

  const percent = Math.round(((index + 1) / stages.length) * 100);

  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex max-w-md flex-col items-center rounded-xl border border-border bg-card px-6 py-14 text-center"
    >
      <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      <h2 className="mt-5 text-lg font-semibold text-foreground">Generating your plan</h2>
      <p className="mt-1 text-sm text-muted-foreground">{stages[index]}</p>
      <div className="mt-6 w-full">
        <Progress value={percent} aria-label={`Generation progress: ${percent}%`} />
      </div>
      <ul className="mt-6 w-full space-y-1.5 text-left text-sm">
        {stages.map((stage, i) => (
          <li
            key={stage}
            className={i <= index ? "text-foreground" : "text-muted-foreground opacity-60"}
          >
            {i < index ? "✓ " : "• "}
            {stage}
          </li>
        ))}
      </ul>
    </div>
  );
}
