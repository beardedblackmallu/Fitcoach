"use client";

import { Copy, MessageCircle, Phone, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";

export function TapToCallModal() {
  const { callTarget, closeCallModal, showToast, addCallLog } = useApp();
  const router = useRouter();
  if (!callTarget) return null;

  const copyAndLog = async () => {
    try {
      await navigator.clipboard.writeText(callTarget.phone);
    } catch {
      // ignore
    }
    showToast("Number copied", "success");
    addCallLog(callTarget.clientId, "Sandeep", callTarget.clientName);
  };

  const openConversation = () => {
    const id = callTarget.clientId;
    closeCallModal();
    router.push(`/conversations?c=${id}`);
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

        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-[#EBEBEA] grid place-items-center">
            <Phone className="h-5 w-5 text-[#1A1A1A]" />
          </div>
          <div>
            <div className="text-xs text-stone-500">Call</div>
            <div className="font-semibold text-stone-900">{callTarget.clientName}</div>
          </div>
        </div>

        <div className="flex items-stretch gap-2">
          <a
            href={`tel:${callTarget.phone.replace(/\s/g, "")}`}
            className="flex-1 text-center font-mono text-xl tracking-wide text-stone-900 py-3 px-2 bg-stone-50 rounded-xl border border-stone-200 hover:bg-stone-100 transition-colors"
          >
            {callTarget.phone}
          </a>
          <button
            onClick={copyAndLog}
            className="px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 inline-flex items-center justify-center gap-1.5 text-xs font-medium"
          >
            <Copy className="h-4 w-4" />
            Copy
          </button>
        </div>

        <div className="mt-4 bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs text-stone-600 leading-relaxed">
          <p>
            📞 Call from your personal phone — clients receive your real number, not the FitCoach
            platform number. After the call, the conversation continues here.
          </p>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <button
            onClick={openConversation}
            className="flex-1 h-10 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium text-sm inline-flex items-center justify-center gap-1.5"
          >
            <MessageCircle className="h-4 w-4" />
            Open conversation
          </button>
          <button
            onClick={closeCallModal}
            className="px-4 h-10 rounded-lg text-stone-600 hover:bg-stone-100 font-medium text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
