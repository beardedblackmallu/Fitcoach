"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

type Toast = { id: number; text: string; tone?: "default" | "success" };

type VoiceTarget = { clientName: string } | null;
type CallTarget = { clientId: string; clientName: string; phone: string } | null;

interface AppCtx {
  // Toast
  toasts: Toast[];
  showToast: (text: string, tone?: "default" | "success") => void;

  // Voice modal
  voiceTarget: VoiceTarget;
  openVoiceModal: (clientName: string) => void;
  closeVoiceModal: () => void;

  // Tap-to-call
  callTarget: CallTarget;
  openCallModal: (clientId: string, clientName: string, phone: string) => void;
  closeCallModal: () => void;

  // Call log markers per conversation (clientId -> array of system messages)
  callLogs: Record<string, { id: string; text: string; time: string }[]>;
  addCallLog: (clientId: string, trainerName: string, clientName: string) => void;

  // Resolved escalation IDs
  resolvedEscalations: string[];
  resolveEscalation: (id: string) => void;

  // Sidebar mobile state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [voiceTarget, setVoiceTarget] = useState<VoiceTarget>(null);
  const [callTarget, setCallTarget] = useState<CallTarget>(null);
  const [callLogs, setCallLogs] = useState<Record<string, { id: string; text: string; time: string }[]>>({});
  const [resolvedEscalations, setResolvedEscalations] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showToast = useCallback((text: string, tone: "default" | "success" = "default") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const openVoiceModal = useCallback((clientName: string) => setVoiceTarget({ clientName }), []);
  const closeVoiceModal = useCallback(() => setVoiceTarget(null), []);

  const openCallModal = useCallback((clientId: string, clientName: string, phone: string) => {
    setCallTarget({ clientId, clientName, phone });
  }, []);
  const closeCallModal = useCallback(() => setCallTarget(null), []);

  const addCallLog = useCallback((clientId: string, trainerName: string, clientName: string) => {
    const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    setCallLogs((prev) => ({
      ...prev,
      [clientId]: [
        ...(prev[clientId] ?? []),
        { id: `call-${Date.now()}`, text: `📞 ${trainerName} called ${clientName} — ${time}`, time },
      ],
    }));
  }, []);

  const resolveEscalation = useCallback((id: string) => {
    setResolvedEscalations((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  return (
    <AppContext.Provider
      value={{
        toasts, showToast,
        voiceTarget, openVoiceModal, closeVoiceModal,
        callTarget, openCallModal, closeCallModal,
        callLogs, addCallLog,
        resolvedEscalations, resolveEscalation,
        sidebarOpen, setSidebarOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
