import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoMark } from "@/components/logo";
import { AppFrame } from "@/components/app-frame";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) throw new Error(error.message ?? "Could not sign in");
      await navigate({ to: "/app" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppFrame>
      <div className="flex flex-1 flex-col px-6 pb-8 pt-[max(1rem,env(safe-area-inset-top))]">
        <Link to="/" className="inline-flex size-11 items-center justify-center rounded-full text-fg">
          <ChevronLeft className="size-5" />
        </Link>
        <div className="mx-auto mt-8 flex flex-col items-center text-center">
          <LogoMark className="size-14 rounded-[18px]" />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 max-w-[28ch] text-sm text-muted">
            Sign in to pick up your place in line and your wait rewards.
          </p>
        </div>

        <form onSubmit={onEmail} className="mt-10 flex flex-col gap-3">
          <Input
            type="email"
            required
            autoComplete="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            required
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" size="lg" className="mt-1 w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-subtle">
          <span className="h-px flex-1 bg-border" />
          Or
          <span className="h-px flex-1 bg-border" />
        </div>

        {authEnabled ? (
          <div className="flex flex-col gap-2.5">
            {GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => void signIn(p.providerId, { callbackURL: "/app" })}
              >
                Continue with {p.label}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted">Sign-in is disabled.</p>
        )}

        <p className="mt-auto pt-8 text-center text-sm text-muted">
          New here?{" "}
          <Link to="/signup" className="font-medium text-primary">
            Create an account
          </Link>
        </p>
      </div>
    </AppFrame>
  );
}
