import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AppLayout } from "@/components/layout/AppLayout";
import { RequireAuth } from "@/components/layout/RequireAuth";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useAuth } from "@/providers/auth";
import { useProfile } from "@/hooks/usePlanQueries";

export const Route = createFileRoute("/settings")({ component: SettingsRoute });

function SettingsRoute() {
  return (
    <RequireAuth>
      <SettingsPage />
    </RequireAuth>
  );
}

function SettingsPage() {
  const { logout } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    navigate({ to: "/login", replace: true });
  };

  return (
    <AppLayout title="Settings" description="Manage your account and session.">
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{profile?.fullName ?? "Your account"}</p>
                <p className="text-sm text-muted-foreground">{profile?.email ?? ""}</p>
              </div>
              <Button asChild variant="outline">
                <Link to="/profile">Edit profile</Link>
              </Button>
            </div>
            <Separator />
            <p className="text-sm text-muted-foreground">
              Your name and profile photo are edited on the profile page. Email changes and password
              resets aren't available yet.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Currency</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              All plans are calculated in Indian Rupees (₹). Other currencies aren't supported yet.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your plans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Plans are deleted one by one from your history, so nothing is removed by accident.
            </p>
            <Button asChild variant="outline">
              <Link to="/history">Open history</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
          </CardHeader>
          <CardContent>
            <ConfirmDialog
              title="Sign out?"
              description="You will need to sign in again to see your plans."
              confirmLabel="Sign out"
              onConfirm={() => void handleLogout()}
              trigger={
                <Button variant="destructive">
                  <LogOut className="size-4" aria-hidden="true" />
                  Sign out
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
