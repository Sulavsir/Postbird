import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { credentialsSchema, registrationSchema } from "@postbird/shared";
import { APP_ROUTES } from "../../constants";
import { useAuth } from "./auth-context";
import { useLogin, useRegister } from "./use-auth";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = credentialsSchema;
const registerSchema = registrationSchema;
type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export function AuthScreen({ mode }: { mode: "login" | "register" }) {
  const { token } = useAuth();
  const location = useLocation();
  const login = useLogin();
  const register = useRegister();
  const form = useForm<LoginValues & Partial<RegisterValues>>({
    resolver: zodResolver(mode === "login" ? loginSchema : registerSchema),
    defaultValues: { email: "", password: "", displayName: "" },
  });

  if (token) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from || APP_ROUTES.overview} replace />;
  }

  async function submit(values: LoginValues & Partial<RegisterValues>) {
    if (mode === "login") {
      await login.mutateAsync({
        email: values.email,
        password: values.password,
      });
      return;
    }
    await register.mutateAsync({
      email: values.email,
      password: values.password,
      displayName: values.displayName ?? "",
    });
  }

  const error =
    login.error?.message ||
    register.error?.message ||
    form.formState.errors.email?.message ||
    form.formState.errors.password?.message ||
    form.formState.errors.displayName?.message;

  return (
    <main className="grid min-h-screen place-items-center bg-linear-to-br from-background to-secondary p-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="mb-8 flex items-center gap-2 font-heading text-xl font-extrabold">
            <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Mail size={16} />
            </span>
            postbird
          </div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Email operations
          </p>
          <h1 className="font-heading mt-2 text-3xl font-extrabold">
            {mode === "login" ? "Welcome back" : "Create your workspace"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login"
              ? "Sign in to manage delivery, SMTP, and tracking."
              : "Create an account, then connect Gmail, Yahoo, Microsoft, or custom SMTP."}
          </p>
          <form
            className="mt-6 space-y-4"
            onSubmit={form.handleSubmit((values) => void submit(values))}
          >
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input id="displayName" {...form.register("displayName")} required />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                minLength={8}
                {...form.register("password")}
                required
              />
            </div>
            {error ? <Alert variant="destructive">{error}</Alert> : null}
            <Button
              className="w-full"
              type="submit"
              disabled={login.isPending || register.isPending}
            >
              {mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>
          <Button variant="link" className="mt-4 w-full" asChild>
            <Link to={mode === "login" ? APP_ROUTES.register : APP_ROUTES.login}>
              {mode === "login"
                ? "Need an account? Create one"
                : "Already have an account? Sign in"}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
