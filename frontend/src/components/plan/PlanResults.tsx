import React from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Printer,
  Sparkles,
  Lightbulb,
  PieChart,
  Shirt,
  Gem,
  MapPin,
  Utensils,
  Music,
  Tag,
  ExternalLink,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Building,
  Radio,
  Fan,
  Armchair,
  Home as HomeIcon,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, plannerLabel } from "@/lib/format";
import { useSaveRecommendation } from "@/hooks/usePlanQueries";
import type { Plan, Recommendation, ShoppingLink } from "@/types";

// Category icon helper
function getCategoryIcon(category: string) {
  const cat = category.toLowerCase();
  if (cat.includes("light")) return <Lightbulb className="size-5 text-amber-500" />;
  if (cat.includes("fan")) return <Fan className="size-5 text-cyan-500" />;
  if (cat.includes("furniture") || cat.includes("chair") || cat.includes("table")) return <Armchair className="size-5 text-indigo-500" />;
  if (cat.includes("venue")) return <MapPin className="size-5 text-blue-600" />;
  if (cat.includes("cater") || cat.includes("food") || cat.includes("meal")) return <Utensils className="size-5 text-emerald-600" />;
  if (cat.includes("entertain") || cat.includes("music") || cat.includes("game")) return <Music className="size-5 text-purple-600" />;
  if (cat.includes("contingency") || cat.includes("expense") || cat.includes("buffer")) return <Tag className="size-5 text-rose-500" />;
  if (cat.includes("jewel") || cat.includes("ring") || cat.includes("watch") || cat.includes("bracelet")) return <Gem className="size-5 text-amber-600" />;
  return <HomeIcon className="size-5 text-primary" />;
}

// Store search link fallback
function getStoreUrl(storeName: string, query: string): string {
  const q = encodeURIComponent(query);
  const s = storeName.toLowerCase();
  if (s.includes("amazon")) return `https://www.amazon.in/s?k=${q}`;
  if (s.includes("flipkart")) return `https://www.flipkart.com/search?q=${q}`;
  if (s.includes("ikea")) return `https://www.ikea.com/in/en/search/?q=${q}`;
  if (s.includes("myntra")) return `https://www.myntra.com/${q}`;
  if (s.includes("ajio")) return `https://www.ajio.com/search/?text=${q}`;
  if (s.includes("tanishq")) return `https://www.tanishq.co.in/search?q=${q}`;
  if (s.includes("caratlane")) return `https://www.caratlane.com/search?q=${q}`;
  if (s.includes("bluestone")) return `https://www.bluestone.com/search.html?q=${q}`;
  if (s.includes("malabar")) return `https://www.malabargoldanddiamonds.com/search?q=${q}`;
  if (s.includes("mia")) return `https://www.miabytanishq.com/search?q=${q}`;
  if (s.includes("swiggy")) return `https://www.swiggy.com/`;
  if (s.includes("zomato")) return `https://www.zomato.com/`;
  if (s.includes("bookmyshow")) return `https://in.bookmyshow.com/explore/events`;
  if (s.includes("booking")) return `https://www.booking.com/searchresults.html?ss=${q}`;
  if (s.includes("makemytrip")) return `https://www.makemytrip.com/hotels/`;
  if (s.includes("oyo")) return `https://www.oyorooms.com/`;
  if (s.includes("nobroker")) return `https://www.nobroker.in/`;
  return `https://www.google.com/search?q=${q}`;
}

// Shopping links row component
function ShoppingLinksBadgeList({
  links,
  itemName,
}: {
  links?: ShoppingLink[];
  itemName: string;
}) {
  const defaultHomeStores = ["Amazon", "Flipkart", "Ikea", "Myntra", "Ajio"];
  const storeList = links && links.length > 0 ? links : defaultHomeStores.map(name => ({ name, url: getStoreUrl(name, itemName) }));

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {storeList.map((store) => (
        <a
          key={store.name}
          href={store.url && store.url !== "#" ? store.url : getStoreUrl(store.name, itemName)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-blue-200 bg-blue-50/70 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300 transition-colors shadow-2xs"
        >
          <span>{store.name}</span>
          <ExternalLink className="size-2.5 opacity-60" />
        </a>
      ))}
    </div>
  );
}

export function PlanResults({ plan, editTo }: { plan: Plan; editTo?: string }) {
  const saveMutation = useSaveRecommendation(plan.id);

  const currency = plan.budget?.currency || "INR";
  const totalBudget = plan.budget?.totalBudget || 0;
  const estimatedCost = plan.budget?.estimatedCost || 0;
  const remainingBudget = Math.max(totalBudget - estimatedCost, 0);

  // Group recommendations by category
  const groupedRecs: Record<string, Recommendation[]> = {};
  (plan.recommendations || []).forEach((r) => {
    const cat = r.category || "General";
    if (!groupedRecs[cat]) groupedRecs[cat] = [];
    groupedRecs[cat].push(r);
  });

  const additionalSuggestions = plan.additionalSuggestions || [
    "Consider purchasing used furniture for further cost savings.",
    "Look for sales and discounts on online marketplaces.",
    "Prioritize essential items and postpone non-essential purchases."
  ];

  const stylingTips = plan.stylingTips || [
    "Keep the jewelry minimal to match the casual style of the outfit.",
    "Consider the watch as a statement piece, choosing a design that reflects personal style.",
    "Ensure the metal tones of the ring and bracelet (if metal accents are chosen) complement each other."
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            Back to dashboard
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {editTo && (
            <Button asChild variant="outline" size="sm">
              <Link to={editTo}>Edit inputs</Link>
            </Button>
          )}
          <Button
            onClick={() => window.print()}
            className="bg-[#1e3a5f] hover:bg-[#152a45] text-white flex items-center gap-1.5 shadow-sm"
            size="sm"
          >
            <Printer className="size-4" />
            Print / Save
          </Button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. HOME PLANNER VIEW (Matches Image 1)                    */}
      {/* ========================================================= */}
      {plan.plannerType === "home" && (
        <div className="space-y-6">
          <div className="text-center pt-2 pb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              Your Personalized Budget Plan
            </h1>
          </div>

          {/* Budget Summary Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-sm overflow-hidden">
            <div className="bg-[#1e3a5f] text-white px-5 py-3 font-semibold text-base flex items-center gap-2">
              <PieChart className="size-5 text-blue-200" />
              Budget Summary
            </div>
            <div className="p-5 flex flex-wrap items-center justify-between gap-4 text-sm sm:text-base">
              <div className="font-semibold text-slate-700 dark:text-slate-200">
                Total Budget: <span className="text-blue-600 dark:text-blue-400 font-bold">{formatCurrency(totalBudget, currency)}</span>
              </div>
              <div className="font-semibold text-slate-700 dark:text-slate-200">
                Remaining Budget: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(remainingBudget, currency)}</span>
              </div>
            </div>
          </div>

          {/* Category Tables */}
          {Object.entries(groupedRecs).map(([category, items]) => {
            const categoryAlloc = plan.allocations?.find(
              (a) => a.category.toLowerCase() === category.toLowerCase()
            )?.amount || items.reduce((acc, curr) => acc + curr.price * (curr.quantity || 1), 0);

            return (
              <div key={category} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-sm overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 text-base capitalize">
                    {getCategoryIcon(category)}
                    {category}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                    Allocation: {formatCurrency(categoryAlloc, currency)}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100/70 dark:bg-slate-800/50 text-xs font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-3 min-w-[140px]">Item</th>
                        <th className="px-4 py-3 min-w-[200px]">Description</th>
                        <th className="px-4 py-3 text-right">Price</th>
                        <th className="px-4 py-3 text-center">Quantity</th>
                        <th className="px-4 py-3 min-w-[220px]">Shopping Links</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {items.map((item) => (
                        <tr key={item.id || item.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-slate-100">
                            {item.name}
                          </td>
                          <td className="px-4 py-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {item.description}
                          </td>
                          <td className="px-4 py-3.5 text-right font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                            {formatCurrency(item.price, currency)}
                          </td>
                          <td className="px-4 py-3.5 text-center font-medium text-slate-700 dark:text-slate-300">
                            {item.quantity || 1}
                          </td>
                          <td className="px-4 py-3.5">
                            <ShoppingLinksBadgeList links={item.shoppingLinks} itemName={item.name} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {/* Additional Suggestions Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-sm overflow-hidden">
            <div className="bg-[#1e3a5f] text-white px-5 py-3 font-semibold text-base flex items-center gap-2">
              <Lightbulb className="size-5 text-amber-300" />
              Additional Suggestions
            </div>
            <div className="p-5">
              <ul className="space-y-3">
                {additionalSuggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. JEWELRY PLANNER VIEW (Matches Image 2)                 */}
      {/* ========================================================= */}
      {plan.plannerType === "jewelry" && (
        <div className="space-y-6">
          <div className="text-center pt-2 pb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              Your Personalized Jewelry Recommendations
            </h1>
          </div>

          {/* Budget Summary Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-sm overflow-hidden">
            <div className="bg-[#1e3a5f] text-white px-5 py-3 font-semibold text-base flex items-center gap-2">
              <PieChart className="size-5 text-blue-200" />
              Budget Summary
            </div>
            <div className="p-5 flex flex-wrap items-center justify-between gap-4 text-sm sm:text-base">
              <div className="font-semibold text-slate-700 dark:text-slate-200">
                Total Budget: <span className="text-blue-600 dark:text-blue-400 font-bold">{formatCurrency(totalBudget, currency)}</span>
              </div>
              <div className="font-semibold text-slate-700 dark:text-slate-200">
                Remaining Budget: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(remainingBudget, currency)}</span>
              </div>
            </div>
          </div>

          {/* Outfit Analysis Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-sm overflow-hidden">
            <div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-5 py-3 flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 text-base">
              <Shirt className="size-5 text-blue-600" />
              Outfit Analysis
            </div>
            <div className="p-5 flex flex-wrap gap-2.5">
              <Badge variant="secondary" className="px-3 py-1.5 text-xs sm:text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                Colors: {Array.isArray(plan.outfitAnalysis?.colors) ? plan.outfitAnalysis.colors.join(", ") : "blue, white"}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1.5 text-xs sm:text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                Style: {plan.outfitAnalysis?.style || "casual"}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1.5 text-xs sm:text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                Formality: {plan.outfitAnalysis?.formality || "informal"}
              </Badge>
            </div>
          </div>

          {/* Jewelry Recommendations Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-sm overflow-hidden">
            <div className="bg-[#1e3a5f] text-white px-5 py-3 font-semibold text-base flex items-center gap-2">
              <Gem className="size-5 text-amber-300" />
              Jewelry Recommendations
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 p-5 space-y-6">
              {(plan.recommendations || []).map((item) => (
                <div key={item.id || item.name} className="pt-4 first:pt-0 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Radio className="size-4 text-blue-600 shrink-0" />
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base capitalize">
                        {item.name}
                      </h4>
                    </div>
                    <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-bold text-white bg-blue-600 rounded-md shadow-2xs">
                      {formatCurrency(item.price, currency)}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Description:</span> {item.description}
                  </p>

                  <p className="text-xs text-slate-500 dark:text-slate-400 pl-6">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Style:</span> {item.style || "minimalist"}
                  </p>

                  <div className="pl-6 space-y-1.5 pt-1">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Shop For This:</p>
                    <ShoppingLinksBadgeList
                      links={item.shoppingLinks || [
                        { name: "Amazon", url: getStoreUrl("Amazon", item.name) },
                        { name: "Flipkart", url: getStoreUrl("Flipkart", item.name) },
                        { name: "Bluestone", url: getStoreUrl("Bluestone", item.name) },
                        { name: "Tanishq", url: getStoreUrl("Tanishq", item.name) },
                        { name: "CaratLane", url: getStoreUrl("CaratLane", item.name) },
                        { name: "Malabar", url: getStoreUrl("Malabar", item.name) },
                        { name: "Mia", url: getStoreUrl("Mia", item.name) }
                      ]}
                      itemName={item.name}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Styling Tips Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-sm overflow-hidden">
            <div className="bg-[#1e3a5f] text-white px-5 py-3 font-semibold text-base flex items-center gap-2">
              <Lightbulb className="size-5 text-amber-300" />
              Styling Tips
            </div>
            <div className="p-5">
              <ul className="space-y-3">
                {stylingTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. PARTY PLANNER VIEW (Matches Image 3)                   */}
      {/* ========================================================= */}
      {plan.plannerType === "party" && (
        <div className="space-y-6">
          <div className="pt-2 pb-1 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Your Party Budget Plan
            </h1>
            <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
              Budget: {formatCurrency(totalBudget, currency)}
            </div>
          </div>

          {/* Category Cards */}
          {Object.entries(groupedRecs).map(([category, items]) => {
            const categoryTotal = items.reduce((acc, curr) => acc + curr.price * (curr.quantity || 1), 0);

            return (
              <div key={category} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-sm overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 text-base capitalize">
                    {getCategoryIcon(category)}
                    {category}
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
                    {formatCurrency(categoryTotal, currency)}
                  </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 p-5 space-y-4">
                  {items.map((item) => (
                    <div key={item.id || item.name} className="pt-3 first:pt-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                          {item.name}
                        </h4>
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm whitespace-nowrap">
                          {formatCurrency(item.price, currency)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="pt-1 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                        <span className="font-medium text-slate-700 dark:text-slate-300">Shop on:</span>
                        <ShoppingLinksBadgeList
                          links={item.shoppingLinks || [
                            { name: "Google", url: getStoreUrl("Google", item.name) },
                            { name: "Amazon", url: getStoreUrl("Amazon", item.name) },
                            { name: "Flipkart", url: getStoreUrl("Flipkart", item.name) }
                          ]}
                          itemName={item.name}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Budget Summary Breakdown Table */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-sm overflow-hidden">
            <div className="p-5 space-y-2.5 text-sm sm:text-base">
              <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100">
                <span>Total Budget</span>
                <span>{formatCurrency(totalBudget, currency)}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Allocated</span>
                <span>{formatCurrency(estimatedCost, currency)}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-2">
                <span>Remaining</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(remainingBudget, currency)}</span>
              </div>
            </div>
          </div>

          {/* Venue Suggestions Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-sm overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-5 py-3 flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 text-base">
              <MapPin className="size-5 text-blue-600" />
              Venue Suggestions
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                    Home
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Type: Residential
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Location: Local residential area
                  </p>
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-100">
                  {formatCurrency(0, currency)}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-blue-600 dark:text-blue-400 pt-1">
                <a href="https://google.com" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                  <ExternalLink className="size-3" /> Website
                </a>
                <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                  <MapPin className="size-3" /> View on Map
                </a>
              </div>
            </div>
          </div>

          {/* Additional Suggestions Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-sm overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-5 py-3 flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 text-base">
              <Lightbulb className="size-5 text-amber-500" />
              Additional Suggestions
            </div>
            <div className="p-5">
              <ul className="space-y-3">
                {additionalSuggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
