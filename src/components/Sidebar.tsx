"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageCircle,
  Inbox,
  Dumbbell,
  Wallet,
  Settings,
  X,
} from "lucide-react";
import { useApp } from "@/lib/AppContext";

const items = [
  { href: "/", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/clients", label: "Clients", Icon: Users },
  { href: "/conversations", label: "Conversations", Icon: MessageCircle, badge: 3 },
  { href: "/inbox", label: "Inbox", Icon: Inbox, badge: 2, badgeRed: true },
  { href: "/plans", label: "Plans", Icon: Dumbbell },
  { href: "/payments", label: "Payments", Icon: Wallet },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, resolvedEscalations } = useApp();
  const inboxBadge = Math.max(0, 2 - resolvedEscalations.length);

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`hidden lg:flex ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:sticky inset-y-0 left-0 z-40 w-64 bg-white border-r border-stone-200 flex-col transition-transform duration-200 ease-out`}
      >
        <div className="h-16 flex items-center justify-between gap-2 px-5 border-b border-stone-200">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-teal-600 grid place-items-center text-white font-bold">
              F
            </div>
            <span className="font-semibold text-stone-900 text-lg tracking-tight">FitCoach</span>
          </Link>
          <button
            className="lg:hidden p-1.5 rounded-md hover:bg-stone-100"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-stone-600" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map(({ href, label, Icon, badge, badgeRed }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            const showBadge = badge && (label !== "Inbox" || inboxBadge > 0);
            const displayBadge = label === "Inbox" ? inboxBadge : badge;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-teal-50 text-teal-700"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className={`h-[18px] w-[18px] ${active ? "text-teal-600" : "text-stone-500"}`} />
                  {label}
                </span>
                {showBadge && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 min-w-[20px] h-5 grid place-items-center rounded-full ${
                      badgeRed ? "bg-red-500 text-white" : "bg-teal-600 text-white"
                    }`}
                  >
                    {displayBadge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-stone-200">
          <div className="rounded-lg bg-gradient-to-br from-teal-50 to-amber-50 p-3 text-xs">
            <div className="font-semibold text-stone-800 mb-0.5">Pro tip</div>
            <div className="text-stone-600 leading-snug">
              Voice notes drive 2× client engagement vs text. Try one today.
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
