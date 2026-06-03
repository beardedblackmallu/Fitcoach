// Server wrapper for the dynamic /clients/[id] route.
// generateStaticParams + dynamicParams=false satisfy Next.js static export
// (Capacitor build). The client UI lives in ClientDetailView, which reads the
// id via useParams(). Navigation is client-side in Capacitor, so no per-id
// HTML is needed. On web (no static export) these exports are harmless.

import ClientDetailView from "./ClientDetailView";

export const dynamicParams = false;

// Returns a single placeholder shell. Real client IDs are resolved at runtime
// by the App Router (client-side) inside Capacitor — the pre-generated path is
// just a build artifact to satisfy output: export. Returning [] is rejected by
// Turbopack's static export collector, so we emit one throwaway param.
export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function Page() {
  return <ClientDetailView />;
}
