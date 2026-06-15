"use client";

// Static route for client detail in Capacitor.
// Dynamic path segments (/clients/[id]) break in Next.js static export because
// dynamicParams=false blocks client-side navigation to real UUIDs. This route
// uses a query param (?id=...) to avoid that entirely.

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ClientDetailView from "../[id]/ClientDetailView";

function Detail() {
  const params = useSearchParams();
  const id = params?.get("id") ?? "";
  return <ClientDetailView id={id} />;
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto animate-pulse space-y-4">
        <div className="bg-white border border-stone-200 rounded-xl p-6 h-32" />
      </div>
    }>
      <Detail />
    </Suspense>
  );
}
