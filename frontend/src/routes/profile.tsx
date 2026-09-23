import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AppLayout } from "@/components/layout/AppLayout";
import { RequireAuth } from "@/components/layout/RequireAuth";
import { ErrorState, ProfileSkeleton } from "@/components/common/states";
import { profileSchema, type ProfileValues } from "@/schemas";
import { useProfile, useUpdateProfile, usePlans } from "@/hooks/usePlanQueries";
import { useAuth } from "@/providers/auth";
import { formatCurrency, formatDate } from "@/lib/format";

export const Route = createFileRoute("/profile")({ component: ProfileRoute });

function ProfileRoute() {
  return (
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  );
}

function ProfilePage() {
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const { data: plans } = usePlans();
  const updateProfile = useUpdateProfile();
  const { setUser } = useAuth();

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: "", avatarUrl: "" },
  });

  useEffect(() => {
    if (profile) {
      const name = profile.fullName || "";
      const avatar = profile.avatarUrl || "";
      form.reset({ fullName: name, avatarUrl: avatar });
    }
  }, [profile, form]);

  const onSubmit = (values: ProfileValues) => {
    updateProfile.mutate(
      { fullName: values.fullName, avatarUrl: values.avatarUrl || undefined },
      {
        onSuccess: (updated) => {
          setUser(updated);
          toast.success("Profile updated");
        },
        onError: () => toast.error("We couldn't save your profile. Try again."),
      },
    );
  };

  const totalPlans = plans?.length ?? 0;
  const totalBudget = (plans ?? []).reduce((sum, plan) => sum + (plan.totalBudget || 0), 0);
  const displayName = profile?.fullName || profile?.email || "User";
  const displayEmail = profile?.email || "";
  const displayAvatar = profile?.avatarUrl;
  const displayCreatedAt = profile?.createdAt || new Date().toISOString();
  const initials = (displayName || "US").slice(0, 2).toUpperCase();

  return (
    <AppLayout title="Profile" description="Your account details.">
      {isLoading ? (
        <ProfileSkeleton />
      ) : isError || !profile ? (
        <ErrorState
          title="We couldn't load your profile"
          description="Please try again in a moment."
          onRetry={() => void refetch()}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Account details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  {displayAvatar ? <AvatarImage src={displayAvatar} alt={displayName} /> : null}
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{displayName}</p>
                  <p className="text-sm text-muted-foreground">{displayEmail}</p>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="avatarUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile photo link (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://…" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-foreground">Email</span>
                    <Input value={displayEmail} readOnly disabled aria-label="Email address" />
                    <p className="text-xs text-muted-foreground">
                      Email changes aren't supported yet.
                    </p>
                  </div>
                  <Button type="submit" disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : null}
                    Save changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-base">Your activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Member since" value={formatDate(displayCreatedAt)} />
              <Row label="Plans created" value={String(totalPlans)} />
              <Row label="Budget planned" value={formatCurrency(totalBudget)} />
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 rounded-lg border border-border px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
