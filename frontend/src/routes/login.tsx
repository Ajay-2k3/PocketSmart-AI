import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AuthShell } from "@/components/auth/AuthShell";
import { loginSchema, type LoginValues } from "@/schemas";
import { useAuth } from "@/providers/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search["redirect"] === "string" ? { redirect: search["redirect"] } : {},
  head: () => ({
    meta: [
      { title: "Sign in — PocketSmart AI" },
      {
        name: "description",
        content: "Sign in to PocketSmart AI to open your saved budget plans and start a new one.",
      },
      { property: "og:title", content: "Sign in — PocketSmart AI" },
      {
        property: "og:description",
        content: "Access your PocketSmart AI budget plans for home, party and jewelry planning.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (isAuthenticated) navigate({ to: "/dashboard", replace: true });
  }, [isAuthenticated, navigate]);

  const onSubmit = async (values: LoginValues) => {
    setFormError(null);
    try {
      await login(values.email, values.password);
      toast.success("Welcome back");
      navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "We couldn't sign you in. Please try again.";
      setFormError(message);
    }
  };

  const handleDemoLogin = async () => {
    setFormError(null);
    setIsDemoLoading(true);
    form.setValue("email", "demo@pocketsmart.ai");
    form.setValue("password", "Demo123456!");
    try {
      await login("demo@pocketsmart.ai", "Demo123456!");
      toast.success("Signed in with Demo Account!");
      navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "We couldn't sign you in with demo account. Please try again.";
      setFormError(message);
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to pick up your plans where you left off."
      footer={
        <p className="text-sm text-muted-foreground">
          New to PocketSmart AI?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Your password"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                      ) : (
                        <Eye className="size-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {formError ? (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {formError}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || isDemoLoading}>
            {form.formState.isSubmitting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            Sign in with Registered Account
          </Button>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or fast demo access</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary font-medium text-primary transition-colors"
            onClick={handleDemoLogin}
            disabled={form.formState.isSubmitting || isDemoLoading}
          >
            {isDemoLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="mr-2 size-4 text-primary" aria-hidden="true" />
            )}
            1-Click Demo Login (demo@pocketsmart.ai)
          </Button>

          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              <span>Demo Account Credentials</span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
              <span>Email: <strong className="text-foreground">demo@pocketsmart.ai</strong></span>
              <span>Pass: <strong className="text-foreground">Demo123456!</strong></span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground/80">
              Pre-seeded in live Supabase DB with sample budget plans.
            </p>
          </div>
        </form>
      </Form>
    </AuthShell>
  );
}
