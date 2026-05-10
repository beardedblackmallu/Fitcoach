"use client";

import { Bell, Menu, Search, ChevronDown } from "lucide-react";
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
  const { setSidebarOpen, resolvedEscalations } = useApp();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unread = Math.max(0, 2 - resolvedEscalations.length) + 1; // 2 escalations + 1 warning

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
            placeholder="Search clients, conversations, plans..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-stone-100 border border-transparent focus:bg-white focus:border-stone-300 focus:ring-2 focus:ring-teal-100 outline-none text-sm placeholder:text-stone-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto" ref={ref}>
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="relative p-2 rounded-lg hover:bg-stone-100"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-stone-600" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-[360px] bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden scale-in origin-top-right">
              <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
                <span className="font-semibold text-stone-900 text-sm">Notifications</span>
                <button className="text-xs text-teal-700 hover:underline">Mark all read</button>
              </div>
              <div className="max-h-[420px] overflow-y-auto">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      router.push(n.href);
                      setOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-stone-50 border-b border-stone-100 last:border-b-0 flex gap-3"
                  >
                    <div className="text-base shrink-0 mt-0.5">
                      {n.type === "escalation" && "🟡"}
                      {n.type === "activity" && "✓"}
                      {n.type === "payment" && "💰"}
                      {n.type === "warning" && "⚠️"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-stone-800 leading-snug">{n.text}</div>
                      <div className="text-xs text-stone-500 mt-0.5">{n.time}</div>
                    </div>
                  </button>
                ))}
              </div>
              <Link
                href="/inbox"
                onClick={() => setOpen(false)}
                className="block text-center text-sm text-teal-700 hover:bg-stone-50 py-2.5 border-t border-stone-100 font-medium"
              >
                View all activity
              </Link>
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2 pl-2 ml-1 border-l border-stone-200">
          <Avatar initials="SK" color="bg-teal-600" size="sm" />
          <div className="leading-tight">
            <div className="text-sm font-medium text-stone-900">Sandeep Kumar</div>
            <div className="text-[11px] text-stone-500">Coach</div>
          </div>
          <ChevronDown className="h-4 w-4 text-stone-400" />
        </div>
      </div>
    </header>
  );
}
