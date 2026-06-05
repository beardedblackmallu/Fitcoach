"use client";

import { Check } from "lucide-react";
import { useApp } from "@/lib/AppContext";

export function Toasts() {
  const { toasts } = useApp();
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast-enter pointer-events-auto bg-stone-900 text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-sm max-w-md"
        >
          {t.tone === "success" && (
            <span className="h-5 w-5 rounded-full bg-[#1C1C1C] grid place-items-center shrink-0">
              <Check className="h-3 w-3 text-white" strokeWidth={3} />
            </span>
          )}
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}
