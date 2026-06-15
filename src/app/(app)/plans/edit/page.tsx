"use client";

// Static route for plan editing in Capacitor.
// Uses ?id= query param to avoid dynamic segment routing issues in static export.

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PlanEditView from "../[id]/edit/PlanEditView";

function Edit() {
  const params = useSearchParams();
  const id = params?.get("id") ?? "";
  return <PlanEditView id={id} />;
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto animate-pulse space-y-4">
        <div className="bg-white border border-stone-200 rounded-xl p-6 h-32" />
      </div>
    }>
      <Edit />
    </Suspense>
  );
}
