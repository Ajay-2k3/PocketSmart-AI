import { createFileRoute } from "@tanstack/react-router";
import { NotFoundScreen } from "@/components/common/NotFound";

export const Route = createFileRoute("/404")({
  component: NotFoundScreen,
  head: () => ({
    meta: [
      { title: "Page not found — PocketSmart AI" },
      { name: "description", content: "This PocketSmart AI page could not be found." },
      { property: "og:title", content: "Page not found — PocketSmart AI" },
      { property: "og:description", content: "This PocketSmart AI page could not be found." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});
