import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/providers/auth";
import { LoadingState } from "@/components/common/states";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/login", search: { redirect: pathname }, replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, pathname]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <LoadingState label="Checking your session…" />
      </div>
    );
  }

  return <>{children}</>;
}
