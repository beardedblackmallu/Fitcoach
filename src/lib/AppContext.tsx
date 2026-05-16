"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { plans as seedPlans, Plan } from "./data";

type Toast = { id: number; text: string; tone?: "default" | "success" };

type VoiceTarget = { clientName: string } | null;
type CallTarget = { clientId: string; clientName: string; phone: string } | null;
type ComposerPrefill = { clientId: string; text: string } | null;
type ClientPicker = { plan: Plan } | null;
type AssignPlanPicker = { clientId: string } | null;
type NewPlanPrefill = { customForClientId?: string } | null;
type ExerciseVideoTarget = { name: string; url: string } | null;

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

  // Call log markers per conversation
  callLogs: Record<string, { id: string; text: string; time: string }[]>;
  addCallLog: (clientId: string, trainerName: string, clientName: string) => void;

  // Resolved escalations
  resolvedEscalations: string[];
  resolveEscalation: (id: string) => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Composer prefill (used by Inbox → Conversations)
  composerPrefill: ComposerPrefill;
  setComposerPrefill: (val: ComposerPrefill) => void;
  consumeComposerPrefill: (clientId: string) => string | null;

  // Plans (templates + user-created)
  plans: Plan[];
  addPlan: (plan: Plan) => void;
  assignClientsToPlan: (planId: string, clientIds: string[]) => void;

  // Client → plan name overrides (set when a plan is assigned)
  clientPlanOverrides: Record<string, string>;
  getEffectivePlanName: (clientId: string, seedPlanName: string) => string;

  // New plan modal
  newPlanOpen: boolean;
  newPlanPrefill: NewPlanPrefill;
  openNewPlanModal: (prefill?: NewPlanPrefill) => void;
  closeNewPlanModal: () => void;

  // Client picker modal (assign clients TO a plan)
  clientPicker: ClientPicker;
  openClientPicker: (plan: Plan) => void;
  closeClientPicker: () => void;

  // Assign plan modal (assign a plan TO a client)
  assignPlanPicker: AssignPlanPicker;
  openAssignPlanPicker: (clientId: string) => void;
  closeAssignPlanPicker: () => void;

  // Add client modal
  addClientOpen: boolean;
  openAddClient: () => void;
  closeAddClient: () => void;

  // Exercise video modal
  exerciseVideoTarget: ExerciseVideoTarget;
  openExerciseVideo: (name: string, url: string) => void;
  closeExerciseVideo: () => void;

  // Library video URLs (keyed by exercise name — shared across all plans)
  libraryVideos: Record<string, string>;
  setLibraryVideo: (name: string, url: string) => void;
  removeLibraryVideo: (name: string) => void;
}

const AppContext = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [voiceTarget, setVoiceTarget] = useState<VoiceTarget>(null);
  const [callTarget, setCallTarget] = useState<CallTarget>(null);
  const [callLogs, setCallLogs] = useState<Record<string, { id: string; text: string; time: string }[]>>({});
  const [resolvedEscalations, setResolvedEscalations] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [composerPrefill, setComposerPrefill] = useState<ComposerPrefill>(null);
  const [plans, setPlans] = useState<Plan[]>(seedPlans);
  const [clientPlanOverrides, setClientPlanOverrides] = useState<Record<string, string>>({});
  const [newPlanOpen, setNewPlanOpen] = useState(false);
  const [newPlanPrefill, setNewPlanPrefill] = useState<NewPlanPrefill>(null);
  const [clientPicker, setClientPicker] = useState<ClientPicker>(null);
  const [assignPlanPicker, setAssignPlanPicker] = useState<AssignPlanPicker>(null);
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [exerciseVideoTarget, setExerciseVideoTarget] = useState<ExerciseVideoTarget>(null);
  const [libraryVideos, setLibraryVideosState] = useState<Record<string, string>>({});

  const showToast = useCallback((text: string, tone: "default" | "success" = "default") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2800);
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

  const consumeComposerPrefill = useCallback(
    (clientId: string) => {
      if (composerPrefill && composerPrefill.clientId === clientId) {
        const text = composerPrefill.text;
        setComposerPrefill(null);
        return text;
      }
      return null;
    },
    [composerPrefill]
  );

  const addPlan = useCallback((plan: Plan) => {
    setPlans((prev) => [plan, ...prev]);
  }, []);

  const assignClientsToPlan = useCallback((planId: string, clientIds: string[]) => {
    setPlans((prev) => {
      const next = prev.map((p) =>
        p.id === planId ? { ...p, clientIds: Array.from(new Set([...p.clientIds, ...clientIds])) } : p
      );
      const plan = next.find((p) => p.id === planId);
      if (plan) {
        setClientPlanOverrides((prevOv) => {
          const out = { ...prevOv };
          clientIds.forEach((cid) => { out[cid] = plan.name; });
          return out;
        });
      }
      return next;
    });
  }, []);

  const getEffectivePlanName = useCallback(
    (clientId: string, seedPlanName: string) => clientPlanOverrides[clientId] ?? seedPlanName,
    [clientPlanOverrides]
  );

  const openNewPlanModal = useCallback((prefill: NewPlanPrefill = null) => {
    setNewPlanPrefill(prefill);
    setNewPlanOpen(true);
  }, []);
  const closeNewPlanModal = useCallback(() => {
    setNewPlanOpen(false);
    setNewPlanPrefill(null);
  }, []);

  const openClientPicker = useCallback((plan: Plan) => setClientPicker({ plan }), []);
  const closeClientPicker = useCallback(() => setClientPicker(null), []);

  const openAssignPlanPicker = useCallback((clientId: string) => setAssignPlanPicker({ clientId }), []);
  const closeAssignPlanPicker = useCallback(() => setAssignPlanPicker(null), []);

  const openAddClient = useCallback(() => setAddClientOpen(true), []);
  const closeAddClient = useCallback(() => setAddClientOpen(false), []);

  const openExerciseVideo = useCallback((name: string, url: string) => setExerciseVideoTarget({ name, url }), []);
  const closeExerciseVideo = useCallback(() => setExerciseVideoTarget(null), []);

  const setLibraryVideo = useCallback((name: string, url: string) => {
    setLibraryVideosState((m) => ({ ...m, [name]: url }));
  }, []);
  const removeLibraryVideo = useCallback((name: string) => {
    setLibraryVideosState((m) => {
      const next = { ...m };
      delete next[name];
      return next;
    });
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
        composerPrefill, setComposerPrefill, consumeComposerPrefill,
        plans, addPlan, assignClientsToPlan,
        clientPlanOverrides, getEffectivePlanName,
        newPlanOpen, newPlanPrefill, openNewPlanModal, closeNewPlanModal,
        clientPicker, openClientPicker, closeClientPicker,
        assignPlanPicker, openAssignPlanPicker, closeAssignPlanPicker,
        addClientOpen, openAddClient, closeAddClient,
        exerciseVideoTarget, openExerciseVideo, closeExerciseVideo,
        libraryVideos, setLibraryVideo, removeLibraryVideo,
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
