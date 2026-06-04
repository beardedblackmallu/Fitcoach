import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Toasts } from "@/components/Toasts";
import { VoiceRecorderModal } from "@/components/VoiceRecorderModal";
import { TapToCallModal } from "@/components/TapToCallModal";
import { NewPlanModal } from "@/components/NewPlanModal";
import { ClientPickerModal } from "@/components/ClientPickerModal";
import { AssignPlanModal } from "@/components/AssignPlanModal";
import { AddClientModal } from "@/components/AddClientModal";
import { ExerciseVideoModal } from "@/components/ExerciseVideoModal";
import { BottomNav } from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <Header />
        {/* Top safe area on mobile (status bar / notch). Desktop Header already handles this.
            Bottom: BottomNav (56px) + iOS home indicator. */}
        <main className="flex-1 pt-[env(safe-area-inset-top)] md:pt-0 pb-[calc(56px+env(safe-area-inset-bottom))] md:pb-0">
          {children}
        </main>
      </div>
      <BottomNav />
      <Toasts />
      <VoiceRecorderModal />
      <TapToCallModal />
      <NewPlanModal />
      <ClientPickerModal />
      <AssignPlanModal />
      <AddClientModal />
      <ExerciseVideoModal />
    </div>
  );
}
