import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Gem,
  LineChart,
  PartyPopper,
  ShieldCheck,
  Sofa,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "PocketSmart AI — Plan Smarter. Spend Better." },
      {
        name: "description",
        content:
          "PocketSmart AI turns your budget into a complete plan for home setup, parties and jewelry, with real recommendations that fit what you can spend.",
      },
      { property: "og:title", content: "PocketSmart AI — Plan Smarter. Spend Better." },
      {
        property: "og:description",
        content:
          "Budget-aware planning for your home, your events and your jewelry, with AI recommendations that respect your limit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const planners = [
  {
    icon: Sofa,
    title: "Home Setup Planner",
    description:
      "Furnish rooms one by one with a budget split that covers essentials before extras.",
    points: ["Room-by-room requirements", "Priority-based allocation", "Style and quality filters"],
    to: "/planner/home" as const,
  },
  {
    icon: PartyPopper,
    title: "Party Planner",
    description: "Catering, decoration, venue and entertainment balanced against your guest count.",
    points: ["Live allocation preview", "Per-guest cost check", "Buffer kept aside"],
    to: "/planner/party" as const,
  },
  {
    icon: Gem,
    title: "Jewelry Planner",
    description: "Match pieces to an occasion, an outfit and a spend limit you are comfortable with.",
    points: ["Occasion-led picks", "Optional outfit photo", "Metal and style preferences"],
    to: "/planner/jewelry" as const,
  },
];

const steps = [
  {
    title: "Tell us your budget",
    description: "Enter what you can spend and how flexible that number is.",
  },
  {
    title: "Share your requirements",
    description: "Rooms, guests or occasion — a few guided steps, nothing technical.",
  },
  {
    title: "Get a costed plan",
    description: "A split of your budget, recommendations and warnings before you spend.",
  },
];

const benefits = [
  {
    icon: Wallet,
    title: "Budget first, always",
    description: "Every plan is built to land inside your limit, and says so plainly when it can't.",
  },
  {
    icon: BadgeCheck,
    title: "Only verified links shown",
    description: "If an item has no confirmed product page, we don't show a link at all.",
  },
  {
    icon: LineChart,
    title: "See where money goes",
    description: "A clear category-by-category split, not one vague total.",
  },
  {
    icon: ShieldCheck,
    title: "Your photos stay yours",
    description: "Outfit images are previewed in your browser and never sent to a third party.",
  },
];

function LandingPage() {
  return (
    <PublicLayout>
      <section className="border-b border-border bg-gradient-to-b from-secondary/60 to-background">
        <div className="mx-auto grid w-full max-w-[1280px] items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Budget-aware AI planning
            </Badge>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Plan Smarter. <span className="text-primary">Spend Better.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Give PocketSmart AI your budget and it returns a complete, costed plan for your home,
              your party or your jewelry — with recommendations that actually fit what you can spend.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/register">
                  Start planning free
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#how-it-works">See how it works</a>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No card needed · Works for budgets from ₹5,000 to ₹50,00,000
            </p>
          </div>

          <div id="example">
            <Card className="mx-auto w-full max-w-md shadow-lg">
              <CardContent className="space-y-5 pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Sample home plan</p>
                  <Badge variant="secondary">Under budget</Badge>
                </div>

                <BudgetRow label="Your budget" value={50000} tone="default" />
                <BudgetRow label="Planned spend" value={42500} tone="primary" />
                <BudgetRow label="You keep" value={7500} tone="success" />

                <div className="space-y-2">
                  <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full w-[85%] rounded-full bg-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">85% of budget used across 4 rooms</p>
                </div>

                <ul className="space-y-2 text-sm">
                  {[
                    ["Living room", 18500],
                    ["Bedroom", 14000],
                    ["Kitchen", 6500],
                    ["Study", 3500],
                  ].map(([label, amount]) => (
                    <li
                      key={label as string}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                    >
                      <span className="text-foreground">{label as string}</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(amount as number)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="planners" className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 lg:py-20">
        <SectionHeading
          eyebrow="Three planners"
          title="Pick the plan you need today"
          description="Each planner asks only what matters for that decision, then does the budget maths for you."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {planners.map((planner) => {
            const Icon = planner.icon;
            return (
              <Card key={planner.title} className="flex h-full flex-col transition-shadow hover:shadow-md">
                <CardContent className="flex flex-1 flex-col pt-6">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{planner.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{planner.description}</p>
                  <ul className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
                    {planner.points.map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <BadgeCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="outline" className="mt-6">
                    <Link to={planner.to}>
                      Open planner
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section id="how-it-works" className="border-y border-border bg-card">
        <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 lg:py-20">
          <SectionHeading
            eyebrow="How it works"
            title="Three steps to a plan you can act on"
            description="No spreadsheets, no guesswork about what things cost."
          />
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="rounded-xl border border-border bg-background p-6">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="benefits" className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 lg:py-20">
        <SectionHeading
          eyebrow="Why PocketSmart"
          title="Built around the number you care about"
          description="The budget is the constraint, not an afterthought."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.title} className="rounded-xl border border-border bg-card p-6">
                <Icon className="size-5 text-primary" aria-hidden="true" />
                <h3 className="mt-4 text-base font-semibold text-foreground">{benefit.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1280px] px-4 pb-20 sm:px-6">
        <div className="rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
          <h2 className="text-3xl font-bold tracking-tight">Ready to plan your next spend?</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/85">
            Create an account and get your first costed plan in a couple of minutes.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-7">
            <Link to="/register">
              Create free account
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h2>
      <p className="mt-3 text-muted-foreground">{description}</p>
    </div>
  );
}

function BudgetRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "default" | "primary" | "success";
}) {
  const toneClass =
    tone === "primary" ? "text-primary" : tone === "success" ? "text-success" : "text-foreground";
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-2xl font-bold ${toneClass}`}>{formatCurrency(value)}</span>
    </div>
  );
}
