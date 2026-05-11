import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Toasts } from "@/components/Toasts";
import { VoiceRecorderModal } from "@/components/VoiceRecorderModal";
import { TapToCallModal } from "@/components/TapToCallModal";
import { NewPlanModal } from "@/components/NewPlanModal";
import { ClientPickerModal } from "@/components/ClientPickerModal";
import { AssignPlanModal } from "@/components/AssignPlanModal";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
      <Toasts />
      <VoiceRecorderModal />
      <TapToCallModal />
      <NewPlanModal />
      <ClientPickerModal />
      <AssignPlanModal />
    </div>
  );
}
