// Server wrapper for the dynamic /plans/[id]/edit route.
// generateStaticParams + dynamicParams=false satisfy Next.js static export
// (Capacitor build). The client UI lives in PlanEditView, which reads the id
// via useParams(). Navigation is client-side in Capacitor, so no per-id HTML
// is needed. On web (no static export) these exports are harmless.

import PlanEditView from "./PlanEditView";

export const dynamicParams = false;

// Single placeholder shell — real plan IDs resolved at runtime client-side.
// See clients/[id]/page.tsx for the full rationale.
export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function Page() {
  return <PlanEditView />;
}
