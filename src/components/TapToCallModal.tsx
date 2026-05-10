"use client";

import { Copy, Phone, X } from "lucide-react";
import { useApp } from "@/lib/AppContext";

export function TapToCallModal() {
  const { callTarget, closeCallModal, showToast, addCallLog } = useApp();
  if (!callTarget) return null;

  const copyAndLog = async () => {
    try {
      await navigator.clipboard.writeText(callTarget.phone);
    } catch {
      // ignore
    }
    showToast("Number copied", "success");
    addCallLog(callTarget.clientId, "Sandeep", callTarget.clientName);
    setTimeout(() => closeCallModal(), 600);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4 fade-in">
      <div className="absolute inset-0 bg-black/40" onClick={closeCallModal} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 scale-in">
        <button
          onClick={closeCallModal}
          className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-stone-100 text-stone-500"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-full bg-teal-100 grid place-items-center">
            <Phone className="h-5 w-5 text-teal-700" />
          </div>
          <div>
            <div className="text-xs text-stone-500">Call</div>
            <div className="font-semibold text-stone-900">{callTarget.clientName}</div>
          </div>
        </div>

        <a
          href={`tel:${callTarget.phone.replace(/\s/g, "")}`}
          className="block text-center font-mono text-2xl tracking-wide text-stone-900 py-4 bg-stone-50 rounded-xl border border-stone-200 hover:bg-stone-100 transition-colors"
        >
          {callTarget.phone}
        </a>

        <button
          onClick={copyAndLog}
          className="mt-3 w-full h-11 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm flex items-center justify-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy number
        </button>

        <p className="mt-3 text-xs text-stone-500 leading-relaxed text-center">
          Call from your personal phone — clients receive your real number, not the platform number.
        </p>
        <p className="mt-2 text-xs text-stone-400 text-center">
          On mobile, tapping the number opens your phone dialer.
        </p>

        <button
          onClick={closeCallModal}
          className="mt-4 w-full text-sm text-stone-600 hover:text-stone-800 py-2"
        >
          Close
        </button>
      </div>
    </div>
  );
}
