"use client";

import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/AppContext";
import { notifications } from "@/lib/data";
import { Avatar } from "./Avatar";

export function Header() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { setSidebarOpen } = useApp();
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unreadCount = Math.max(0, notifications.length - readIds.length);

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/85 backdrop-blur border-b border-stone-200 flex items-center gap-3 px-4 lg:px-6">
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden p-2 rounded-md hover:bg-stone-100"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-stone-700" />
      </button>

      <div className="flex-1 max-w-xl mx-auto hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search clients, plans, conversations..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-stone-100 border border-transparent focus:bg-white focus:border-stone-300 focus:ring-2 focus:ring-teal-100 outline-none text-sm placeholder:text-stone-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto" ref={ref}>
        {/* Notifications bell */}
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="relative p-2 rounded-lg hover:bg-stone-100"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-stone-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-[18px] min-w-[18px] px-1 grid place-items-center rounded-full bg-red-500 text-white text-[10px] font-bold ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-[360px] bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden scale-in origin-top-right">
              <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
                <span className="font-semibold text-stone-900 text-sm">Notifications</span>
                <span className="text-[11px] text-stone-500">{unreadCount} new</span>
              </div>
              <div className="max-h-[420px] overflow-y-auto">
                {notifications.map((n) => {
                  const isRead = readIds.includes(n.id);
                  return (
                    <button
                      key={n.id}
                      onClick={() => {
                        setReadIds((prev) => (prev.includes(n.id) ? prev : [...prev, n.id]));
                        router.push(n.href);
                        setOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-stone-50 border-b border-stone-100 last:border-b-0 flex gap-3 ${
                        isRead ? "opacity-60" : ""
                      }`}
                    >
                      <div className="text-base shrink-0 mt-0.5">
                        {n.type === "escalation" && "🟡"}
                        {n.type === "activity" && "✅"}
                        {n.type === "payment" && "💰"}
                        {n.type === "warning" && "⚠️"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-stone-800 leading-snug">{n.text}</div>
                        <div className="text-xs text-stone-500 mt-0.5">{n.time}</div>
                      </div>
                      {!isRead && <span className="h-2 w-2 rounded-full bg-teal-500 shrink-0 mt-2" />}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => {
                  setReadIds(notifications.map((n) => n.id));
                  setOpen(false);
                }}
                className="block w-full text-center text-sm text-teal-700 hover:bg-stone-50 py-2.5 border-t border-stone-100 font-medium"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>

        {/* WhatsApp connection pill */}
        <div
          className="hidden md:inline-flex items-center gap-1.5 h-8 pl-2 pr-3 rounded-full bg-stone-100 hover:bg-stone-200 text-xs text-stone-600 cursor-default group relative"
          title="Your platform WhatsApp Business number. Manage in Settings."
        >
          <span className="relative h-2 w-2 rounded-full bg-emerald-500">
            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-60" />
          </span>
          <span className="font-medium tabular-nums">+91 98765 12345</span>
          <span className="text-stone-400">·</span>
          <span className="text-emerald-700 font-medium">Connected</span>
          <span className="pointer-events-none absolute top-full mt-1.5 right-0 w-56 px-3 py-2 rounded-lg bg-stone-900 text-white text-[11px] leading-snug opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-lg">
            Your platform WhatsApp Business number. Manage in Settings.
          </span>
        </div>

        {/* Coach profile */}
        <div className="hidden sm:flex items-center gap-2 pl-2 ml-1 border-l border-stone-200">
          <Link href="/settings" className="flex items-center gap-2 hover:bg-stone-100 rounded-md px-1 py-1">
            <Avatar initials="SK" color="bg-teal-600" size="sm" />
            <div className="leading-tight">
              <div className="text-sm font-medium text-stone-900">Sandeep Kumar</div>
              <div className="text-[11px] text-stone-500">Coach</div>
            </div>
            <ChevronDown className="h-4 w-4 text-stone-400" />
          </Link>
        </div>
      </div>
    </header>
  );
}
