import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/providers/auth";

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 font-bold tracking-tight ${className}`}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Sparkles className="size-4" aria-hidden="true" />
      </span>
      PocketSmart AI
    </span>
  );
}

const navLinks = [
  { label: "Planners", to: "/", hash: "planners" },
  { label: "How it works", to: "/", hash: "how-it-works" },
  { label: "Why PocketSmart", to: "/", hash: "benefits" },
];

export function PublicLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="PocketSmart AI home">
            <BrandMark />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.hash}
                href={`/#${link.hash}`}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {isAuthenticated ? (
              <Button asChild>
                <Link to="/dashboard">Go to dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Start planning</Link>
                </Button>
              </>
            )}
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="size-4" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex flex-col gap-1 px-4 pt-10">
                {navLinks.map((link) => (
                  <a
                    key={link.hash}
                    href={`/#${link.hash}`}
                    className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="mt-4 flex flex-col gap-2">
                  {isAuthenticated ? (
                    <Button asChild>
                      <Link to="/dashboard">Go to dashboard</Link>
                    </Button>
                  ) : (
                    <>
                      <Button asChild variant="outline">
                        <Link to="/login">Sign in</Link>
                      </Button>
                      <Button asChild>
                        <Link to="/register">Start planning</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto grid w-full max-w-[1280px] gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
          <div>
            <BrandMark />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Budget-aware planning for your home, your events and your jewelry.
            </p>
          </div>
          <FooterColumn
            title="Product"
            items={[
              { label: "How it works", href: "/#how-it-works" },
              { label: "Example plan", href: "/#example" },
              { label: "Benefits", href: "/#benefits" },
            ]}
          />
          <FooterColumn
            title="Planners"
            items={[
              { label: "Home planner", href: "/#planners" },
              { label: "Party planner", href: "/#planners" },
              { label: "Jewelry planner", href: "/#planners" },
            ]}
          />
          <FooterColumn
            title="Company"
            items={[
              { label: "Support", href: "/#benefits" },
              { label: "Privacy", href: "/#benefits" },
              { label: "Terms", href: "/#benefits" },
            ]}
          />
        </div>
        <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} PocketSmart AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.label}>
            <a
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
