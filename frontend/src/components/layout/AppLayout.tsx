import type { ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Gem,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  PartyPopper,
  Settings,
  Sofa,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BrandMark } from "./PublicLayout";
import { useAuth } from "@/providers/auth";
import { AppErrorBoundary } from "@/components/common/ErrorBoundary";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/planner/home", label: "Home planner", icon: Sofa },
  { to: "/planner/party", label: "Party planner", icon: PartyPopper },
  { to: "/planner/jewelry", label: "Jewelry planner", icon: Gem },
  { to: "/history", label: "History", icon: History },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav aria-label="Application" className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            }`}
          >
            <Icon className="size-4" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppLayout({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    navigate({ to: "/login", replace: true });
  };

  const initials = (user?.fullName ?? "U")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-sidebar px-4 py-5 lg:flex">
        <Link to="/dashboard" aria-label="PocketSmart AI dashboard">
          <BrandMark className="text-base" />
        </Link>
        <div className="mt-8 flex-1">
          <NavList />
        </div>
        <Button variant="ghost" className="justify-start" onClick={handleLogout}>
          <LogOut className="size-4" aria-hidden="true" />
          Sign out
        </Button>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center gap-3 px-4 sm:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open navigation"
                >
                  <Menu className="size-4" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 px-4 py-5">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <Link to="/dashboard" aria-label="PocketSmart AI dashboard">
                  <BrandMark className="text-base" />
                </Link>
                <div className="mt-8">
                  <NavList />
                </div>
                <Button variant="ghost" className="mt-4 justify-start" onClick={handleLogout}>
                  <LogOut className="size-4" aria-hidden="true" />
                  Sign out
                </Button>
              </SheetContent>
            </Sheet>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold text-foreground">{title}</h1>
              {description ? (
                <p className="truncate text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              {actions}
              <Link to="/profile" aria-label="Open profile">
                <Avatar className="size-9">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-6 sm:px-6 lg:pb-12">
          <AppErrorBoundary>{children}</AppErrorBoundary>
        </main>
      </div>
    </div>
  );
}
