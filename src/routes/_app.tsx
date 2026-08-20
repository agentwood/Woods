import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/shell";
import { ProgressProvider } from "@/lib/progress-context";

export const Route = createFileRoute("/_app")({
  component: () => (
    <ProgressProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </ProgressProvider>
  ),
});
