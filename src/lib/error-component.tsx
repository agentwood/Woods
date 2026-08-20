import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { WoodsMark } from "@/components/layout/mark";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-fg">
      <WoodsMark />
      <span className="text-danger" aria-hidden="true">
        <TriangleAlert className="size-8" strokeWidth={1.75} />
      </span>
      <h1 className="font-pixel text-3xl tracking-tight">Something snapped</h1>
      <p className="max-w-md text-sm text-muted break-words">
        {error.message || "An unexpected error occurred. Try reloading the page."}
      </p>
    </main>
  );
}
