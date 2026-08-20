import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { WoodsMark } from "@/components/layout/mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/client";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPassword });

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (res.error) throw new Error(res.error.message);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-4 py-12 text-fg">
      <div className="w-full max-w-sm">
        <Link to="/">
          <WoodsMark />
        </Link>
        <h1 className="mt-8 font-pixel text-4xl tracking-tight">Forgot password</h1>
        <p className="mt-2 text-sm text-muted">We’ll send a reset link if that email is on Woods.</p>
        {done ? (
          <p className="mt-6 text-sm text-muted">Check your inbox. In local dev, the link also prints in the terminal.</p>
        ) : (
          <form className="mt-6 space-y-3" onSubmit={(e) => void onSubmit(e)}>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy}>
              Send reset link
            </Button>
          </form>
        )}
        <Link to="/login" className="mt-4 inline-block text-sm text-muted hover:text-fg">
          Back to log in
        </Link>
      </div>
    </main>
  );
}
