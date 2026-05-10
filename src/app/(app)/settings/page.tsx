"use client";

import { Bell, CreditCard, MessageSquare, Phone, Shield, User } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { useApp } from "@/lib/AppContext";

const sections = [
  {
    icon: User,
    title: "Profile",
    desc: "Your name, photo, bio, specialties shown to clients.",
  },
  {
    icon: Phone,
    title: "WhatsApp Business number",
    desc: "+91 98765 12345 — connected and verified.",
  },
  {
    icon: MessageSquare,
    title: "Bot behavior",
    desc: "Customize check-in templates, escalation triggers, tone of voice.",
  },
  {
    icon: Bell,
    title: "Notifications",
    desc: "How you're alerted about escalations, payments, and check-ins.",
  },
  {
    icon: CreditCard,
    title: "Billing & payouts",
    desc: "Bank account, GST details, invoice settings.",
  },
  {
    icon: Shield,
    title: "Privacy & security",
    desc: "2FA, data export, client data retention.",
  },
];

export default function SettingsPage() {
  const { showToast } = useApp();
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-900">Settings</h1>
        <p className="text-sm text-stone-500 mt-1">Manage your coaching business.</p>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-5 mb-5 flex items-center gap-4">
        <Avatar initials="SK" color="bg-teal-600" size="lg" />
        <div className="flex-1">
          <div className="font-semibold text-stone-900">Sandeep Kumar</div>
          <div className="text-sm text-stone-500">Strength & Nutrition Coach · Bengaluru</div>
        </div>
        <button
          onClick={() => showToast("Profile editor coming soon")}
          className="text-sm font-medium px-3 py-2 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700"
        >
          Edit profile
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100 overflow-hidden">
        {sections.map((s) => (
          <button
            key={s.title}
            onClick={() => showToast(`${s.title} settings`)}
            className="w-full text-left flex items-center gap-3 px-4 py-3.5 hover:bg-stone-50 transition-colors"
          >
            <div className="h-9 w-9 rounded-lg bg-stone-100 grid place-items-center text-stone-600 shrink-0">
              <s.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-stone-900 text-sm">{s.title}</div>
              <div className="text-xs text-stone-500 truncate">{s.desc}</div>
            </div>
            <span className="text-stone-300">›</span>
          </button>
        ))}
      </div>

      <div className="mt-6 text-xs text-stone-400 text-center">
        FitCoach v0.1 · prototype
      </div>
    </div>
  );
}
