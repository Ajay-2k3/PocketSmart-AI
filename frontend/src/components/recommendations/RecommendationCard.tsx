import { useState } from "react";
import { Bookmark, BookmarkCheck, ExternalLink, ImageOff, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/format";
import type { Recommendation } from "@/types";

const impactLabel: Record<Recommendation["budgetImpact"], string> = {
  low: "Low budget impact",
  medium: "Medium budget impact",
  high: "High budget impact",
};

function impactClass(impact: Recommendation["budgetImpact"]) {
  if (impact === "low") return "border-success/40 bg-success/10 text-success";
  if (impact === "medium") return "border-warning/40 bg-warning/10 text-warning";
  return "border-destructive/40 bg-destructive/10 text-destructive";
}

export function RecommendationCard({
  recommendation,
  onToggleSave,
  isSaving,
}: {
  recommendation: Recommendation;
  onToggleSave?: (recommendation: Recommendation) => void;
  isSaving?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const hasVerifiedUrl = Boolean(recommendation.productUrl);

  return (
    <>
      <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
        <CardHeader className="gap-3">
          <div className="flex h-36 items-center justify-center overflow-hidden rounded-lg bg-secondary">
            {recommendation.imageUrl && !imageFailed ? (
              <img
                src={recommendation.imageUrl}
                alt={recommendation.name}
                loading="lazy"
                onError={() => setImageFailed(true)}
                className="size-full object-cover"
              />
            ) : (
              <ImageOff className="size-6 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-foreground">
                {recommendation.name}
              </h3>
              <p className="text-sm text-muted-foreground">{recommendation.category}</p>
            </div>
            <p className="shrink-0 text-base font-semibold text-foreground">
              {formatCurrency(recommendation.price, recommendation.currency)}
            </p>
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-3">
          <p className="line-clamp-3 text-sm text-muted-foreground">{recommendation.description}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={impactClass(recommendation.budgetImpact)}>
              {impactLabel[recommendation.budgetImpact]}
            </Badge>
            <Badge variant="secondary">{recommendation.matchScore}% match</Badge>
            {recommendation.source ? (
              <Badge variant="outline">{recommendation.source}</Badge>
            ) : null}
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            <Info className="size-4" aria-hidden="true" />
            Details
          </Button>
          {hasVerifiedUrl ? (
            <Button asChild size="sm" variant="secondary">
              <a
                href={recommendation.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${recommendation.name} on the retailer site (opens in a new tab)`}
              >
                <ExternalLink className="size-4" aria-hidden="true" />
                View product
              </a>
            </Button>
          ) : null}
          {onToggleSave ? (
            <Button
              size="sm"
              variant={recommendation.saved ? "default" : "ghost"}
              disabled={isSaving}
              onClick={() => onToggleSave(recommendation)}
              aria-pressed={recommendation.saved}
            >
              {recommendation.saved ? (
                <BookmarkCheck className="size-4" aria-hidden="true" />
              ) : (
                <Bookmark className="size-4" aria-hidden="true" />
              )}
              {recommendation.saved ? "Saved" : "Save"}
            </Button>
          ) : null}
        </CardFooter>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{recommendation.name}</DialogTitle>
            <DialogDescription>
              {recommendation.category} ·{" "}
              {formatCurrency(recommendation.price, recommendation.currency)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">{recommendation.description}</p>
            <div>
              <h4 className="font-semibold text-foreground">Why this was recommended</h4>
              <p className="mt-1 text-muted-foreground">{recommendation.whyRecommended}</p>
            </div>
            {recommendation.metadata ? (
              <dl className="grid gap-2 sm:grid-cols-2">
                {Object.entries(recommendation.metadata).map(([key, value]) => (
                  <div key={key} className="rounded-lg border border-border px-3 py-2">
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">{key}</dt>
                    <dd className="text-sm text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {hasVerifiedUrl ? (
              <Button asChild className="w-full">
                <a href={recommendation.productUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" aria-hidden="true" />
                  Open product page
                </a>
              </Button>
            ) : (
              <p className="rounded-lg border border-border bg-secondary px-3 py-2 text-xs text-muted-foreground">
                No verified retailer link is available for this item yet.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
