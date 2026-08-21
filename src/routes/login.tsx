import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { WoodsMark } from "@/components/layout/mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const [mode, setMode] = useState<"in" | "up">("up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetch("/api/auth-debug", { headers: { "cache-control": "no-cache" } }).catch(() => undefined);
  }, []);

  async function onGoogle() {
    setBusy(true);
    setError(null);
    try {
      const res = await authClient.signIn.social({ provider: "google", callbackURL: "/home" });
      if (res.error) throw new Error(res.error.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message}. Google login needs to be configured in the site settings.`
          : "Google login needs to be configured in the site settings.",
      );
      setBusy(false);
    }
  }

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "up") {
        const res = await authClient.signUp.email({ email, password, name: name || email.split("@")[0]! });
        if (res.error) throw new Error(res.error.message);
      }
      const res = await authClient.signIn.email({ email, password });
      if (res.error) throw new Error(res.error.message);
      window.location.href = "/home";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-bg px-4 py-12 text-fg">
      <img
        src="/images/sky.jpg"
        alt=""
        className="pointer-events-none absolute inset-x-0 top-0 h-56 w-full object-cover opacity-50"
      />
      <div className="absolute inset-x-0 top-0 h-56 bg-[linear-gradient(180deg,transparent,var(--color-bg))]" />
      <div className="relative w-full max-w-sm">
        <Link to="/" className="inline-block">
          <WoodsMark />
        </Link>
        <h1 className="mt-8 font-pixel text-4xl tracking-tight">
          {mode === "up" ? "Sign up" : "Log in"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {mode === "up"
            ? "Start your skill adventure. ⋆˙⟡"
            : "Welcome back. Let's get learning."}
        </p>

        {authEnabled ? (
          <div className="mt-8 space-y-3">
            {import.meta.env.VITE_GOOGLE_AUTH !== "false" ? (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => void onGoogle()}
                disabled={busy}
              >
                {busy ? "Opening Google…" : "Continue with Google"}
              </Button>
            ) : null}
            {typeof window !== "undefined" &&
            (import.meta.env.VITE_GROK_AUTH === "true" ||
              window.location.hostname.endsWith(".grok-sandbox.com"))
              ? GROK_PROVIDERS.map((p) => (
                  <Button
                    key={p.providerId}
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => void signIn(p.providerId, { callbackURL: "/home" })}
                  >
                    Continue with {p.label}
                  </Button>
                ))
              : null}
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted">Sign-in is disabled.</p>
        )}

        <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-faint">
          <span className="h-px flex-1 bg-border" />
          or email
          <span className="h-px flex-1 bg-border" />
        </div>

        <form className="space-y-3" onSubmit={(e) => void onEmail(e)}>
          {mode === "up" && (
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          )}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete={mode === "up" ? "new-password" : "current-password"}
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {mode === "up" ? "Get started" : "Log in"}
          </Button>
        </form>
        {mode === "in" ? (
          <Link to="/forgot-password" className="mt-3 inline-block text-sm text-muted hover:text-fg">
            Forgot password?
          </Link>
        ) : null}
        <button
          type="button"
          className="mt-4 text-sm text-muted hover:text-fg"
          onClick={() => setMode(mode === "up" ? "in" : "up")}
        >
          {mode === "up" ? "Already have an account? Log in" : "New here? Create an account"}
        </button>
      </div>
    </main>
  );
}
