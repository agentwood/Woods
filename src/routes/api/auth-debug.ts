import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth-debug")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
        const fallbackId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
        const fallbackSecret = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET?.trim();

        return Response.json({
          origin: request.headers.get("origin"),
          host: request.headers.get("host"),
          googleClientId: Boolean(clientId || fallbackId),
          googleClientSecret: Boolean(clientSecret || fallbackSecret),
          googleProviderReady: Boolean((clientId || fallbackId) && (clientSecret || fallbackSecret)),
          commit: "c913f38",
        });
      },
    },
  },
});
