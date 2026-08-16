import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoMark } from "@/components/logo";
import { AppFrame } from "@/components/app-frame";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { ensureProfile } from "@/lib/data/server";
import { cn } from "@/lib/utils";

type Role = "guest" | "host";

export const Route = createFileRoute("/signup")({
  validateSearch: (s: Record<string, unknown>): { role?: Role } =>
    s.role === "host" ? { role: "host" } : {},
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const { role: initialRole } = Route.useSearch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(initialRole === "host" ? "host" : "guest");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await authClient.signUp.email({
        email,
        password,
        name,
      });
      if (error) throw new Error(error.message ?? "Could not create account");
      try {
        await ensureProfile({ data: { displayName: name, rolePref: role } });
      } catch {
        /* profile is created on first app load if this races */
      }
      await navigate({ to: role === "host" ? "/host" : "/app" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create account");
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
        <div className="mx-auto mt-6 flex flex-col items-center text-center">
          <LogoMark className="size-14 rounded-[18px]" />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="mt-1 max-w-[28ch] text-sm text-muted">
            To get personal perks, book your table, and collect wait rewards.
          </p>
        </div>

        <div className="mx-auto mt-6 grid w-full grid-cols-2 rounded-full bg-surface-2 p-1">
          {(
            [
              { id: "guest", label: "I’m dining" },
              { id: "host", label: "I host" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setRole(opt.id)}
              className={cn(
                "h-10 rounded-full text-sm font-medium",
                role === opt.id ? "bg-surface text-fg shadow-[var(--shadow-card)]" : "text-muted",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
          <Input
            required
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
            minLength={8}
            autoComplete="new-password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" size="lg" className="mt-1 w-full" disabled={busy}>
            {busy ? "Creating…" : "Next"}
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
                onClick={() => void signIn(p.providerId, { callbackURL: role === "host" ? "/host" : "/app" })}
              >
                Sign up with {p.label}
              </Button>
            ))}
          </div>
        ) : null}

        <p className="mt-auto pt-8 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary">
            Log in
          </Link>
        </p>
      </div>
    </AppFrame>
  );
}
