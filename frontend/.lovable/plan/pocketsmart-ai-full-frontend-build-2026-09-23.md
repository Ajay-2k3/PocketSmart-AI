# PocketSmart AI — Full Frontend Build

Build the complete PocketSmart AI application: landing, sign-in/registration, dashboard, three planners, results pages, history, profile and settings — all working screens with real navigation, validated forms, loading/empty/error states and full mobile support.

Per your answers: no live backend is wired up. All data flows through one swappable data layer that currently returns realistic sample results, so plugging in your FastAPI server later is a single-file change.

## Two deviations from the spec (unavoidable on this platform)

- **Routing**: it stays a Vite + React app, but React Router cannot be installed here — this project's router is fixed and cannot be swapped. Same URLs, same protected-route behaviour, different library.
- **Sign-in**: with no backend connected, accounts are simulated in the browser (session kept locally) behind the same `authApi` contract your FastAPI/Supabase auth will implement. Nothing is persisted to a real database yet.

## Pages

Public: landing (`/`), login, register, 404.
App (protected, redirect to `/login`): dashboard, home planner + results, party planner + results, jewelry planner + results, history, plan detail, profile, settings.

## Landing page

Hero ("Plan Smarter. Spend Better."), with the budget-preview visual (₹50,000 budget / ₹42,500 estimated / ₹7,500 saved), How It Works, three planner cards, the budget→AI→recommendations flow, an example recommendation card, trust points, closing CTA, and full footer.

## Planners

- **Home** — 5 steps: budget, rooms, requirements, preferences, review.
- **Party** — budget, guests, event, venue, preferences, review, with a live allocation preview (catering/decoration/venue/entertainment/buffer) using progress bars.
- **Jewelry** — budget, occasion, style, preferences, optional outfit image upload (drag & drop, preview, remove, validation — kept client-side, never sent to a third party), review.

All three share one step-wizard, budget input, preference selector, review panel and generation screen. Generating shows staged progress ("Analyzing your requirements…", "Optimizing your budget…"), blocks double submission, and offers retry / edit / back to dashboard on failure.

## Results

Header, budget summary (total, estimated, remaining, savings, utilization with progress), AI summary, recommendation grid, category allocation, over-budget warning, and save/delete actions. Recommendation cards show image, name, category, price, source, match score, why-recommended and budget impact; the external link is hidden when no verified URL exists. A detail view expands the same data.

## History, profile, settings

History list with planner-type / date / budget / status filters and search, open and delete actions, plus plan detail. Profile with editable name and avatar. Settings grouped into account, preferences, notifications, privacy, appearance, logout — only options the data layer can actually honour.

## Design

Premium AI-SaaS look on your exact palette (#F8FAFC, #0F172A, #64748B, #4F46E5, #7C3AED, plus success/warning/error/border/surface), Plus Jakarta Sans, tokens defined once and reused everywhere. Restrained motion: page and step transitions, card entrance, hover feedback; reduced-motion respected.

## Technical notes

- Stack: TanStack Start (React + Vite + TypeScript), TanStack Router, Tailwind v4 tokens in `src/styles.css`, shadcn/Radix, lucide, React Hook Form + Zod, TanStack Query, Framer Motion, sonner toasts.
- `src/lib/api/`: `apiClient.ts` (base URL from `VITE_API_BASE_URL`), `authApi`, `plannerApi`, `recommendationApi`, `historyApi`, `profileApi` — each typed against the `/api/v1/...` contract in the spec, each with a `mockApi` implementation selected by an env flag.
- Centralized types (`Plan`, `PlannerType`, `Recommendation`, `BudgetSummary`, the three planner inputs, `UserProfile`, `ApiError`) and Zod schemas per form.
- Query hooks (`usePlans`, `usePlan`, `useRecommendations`, `useProfile`) and mutations (generate per planner, save/remove recommendation, delete plan).
- `AuthProvider` + `useAuth` + an `_authenticated` route layout for protection; global error boundary; skeletons per surface; shared `EmptyState` / `ErrorState`.
- `.env.example` with `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — no real values, no AI keys in the frontend.
- SEO metadata on public pages only; accessibility (labels, focus states, keyboard order, contrast) checked across 320px→1920px.
