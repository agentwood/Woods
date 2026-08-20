import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { WoodsMark } from "@/components/layout/mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/client";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (s: Record<string, unknown>) => ({
    token: typeof s.token === "string" ? s.token : undefined,
    error: typeof s.error === "string" ? s.error : undefined,
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const { token, error: searchError } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(searchError ? "This reset link is invalid or expired." : null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) {
      setError("Missing reset token. Use the link from your email.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await authClient.resetPassword({ newPassword: password, token });
      if (res.error) throw new Error(res.error.message);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password");
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
        <h1 className="mt-8 font-pixel text-4xl tracking-tight">New password</h1>
        {done ? (
          <p className="mt-6 text-sm text-muted">Password updated. You can log in now.</p>
        ) : (
          <form className="mt-6 space-y-3" onSubmit={(e) => void onSubmit(e)}>
            <Input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy || !token}>
              Save password
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
