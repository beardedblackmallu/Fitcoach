"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Dumbbell,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  MoreHorizontal,
  Settings,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { createClient } from "@/lib/supabase/client";

const primary = [
  { href: "/", label: "Home", Icon: LayoutDashboard },
  { href: "/clients", label: "Clients", Icon: Users },
  { href: "/conversations", label: "Chats", Icon: MessageCircle, unread: 3 },
  { href: "/inbox", label: "Inbox", Icon: Bell, isEscalation: true },
];

const moreLinks = [
  { href: "/plans", label: "Plans", Icon: Dumbbell, desc: "Workout & nutrition templates" },
  { href: "/payments", label: "Payments", Icon: Wallet, desc: "Track and send payment links" },
  { href: "/settings", label: "Settings", Icon: Settings, desc: "Profile, WhatsApp number, bot" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { escalationCount, showToast } = useApp();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  };
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const inboxBadge = escalationCount;
  const moreActive = moreLinks.some((l) => isActive(pathname, l.href));

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

  // Close sheet on route change
  useEffect(() => {
    setSheetOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Bottom-sheet for "More" */}
      {sheetOpen && (
        <div className="md:hidden fixed inset-0 z-40 fade-in">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSheetOpen(false)}
          />
          <div
            ref={sheetRef}
            className="absolute bottom-0 inset-x-0 bg-white rounded-t-2xl shadow-2xl border-t border-stone-200 pb-[env(safe-area-inset-bottom)] scale-in origin-bottom"
            style={{ animation: "slide-up 0.22s ease-out forwards" }}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <div className="text-xs uppercase tracking-wider text-stone-500 font-semibold">More</div>
              <button
                onClick={() => setSheetOpen(false)}
                className="p-2 -mr-2 rounded-md hover:bg-stone-100 text-stone-500"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-2 pb-4">
              {moreLinks.map(({ href, label, Icon, desc }) => {
                const active = isActive(pathname, href);
                return (
                  <button
                    key={href}
                    onClick={() => router.push(href)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg ${
                      active ? "bg-teal-50" : "hover:bg-stone-50 active:bg-stone-100"
                    }`}
                  >
                    <div
                      className={`h-10 w-10 rounded-lg grid place-items-center shrink-0 ${
                        active ? "bg-teal-600 text-white" : "bg-stone-100 text-stone-700"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className={`text-sm font-medium ${active ? "text-teal-700" : "text-stone-900"}`}>
                        {label}
                      </div>
                      <div className="text-xs text-stone-500 truncate">{desc}</div>
                    </div>
                  </button>
                );
              })}

              {/* Divider + Sign out */}
              <div className="mx-3 my-2 border-t border-stone-100" />
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-red-50 active:bg-red-100"
              >
                <div className="h-10 w-10 rounded-lg grid place-items-center shrink-0 bg-stone-100 text-red-500">
                  <LogOut className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-sm font-medium text-red-600">Sign out</div>
                  <div className="text-xs text-stone-500">Log out of FitCoach</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-stone-200 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]"
        aria-label="Primary"
      >
        <div className="grid grid-cols-5 h-[56px]">
          {primary.map(({ href, label, Icon, unread, isEscalation }) => {
            const active = isActive(pathname, href);
            const badge = isEscalation ? inboxBadge : unread;
            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-col items-center justify-center gap-0.5 active:bg-stone-100 touch-manipulation"
              >
                <div className="relative">
                  <Icon
                    className={`h-[22px] w-[22px] ${active ? "text-teal-700" : "text-stone-500"}`}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  {badge !== undefined && badge > 0 && (
                    <span
                      className={`absolute -top-1.5 -right-2 h-[16px] min-w-[16px] px-1 rounded-full grid place-items-center text-[10px] font-bold ring-2 ring-white ${
                        isEscalation ? "bg-red-500 text-white" : "bg-teal-600 text-white"
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] leading-tight font-medium ${
                    active ? "text-teal-700" : "text-stone-500"
                  }`}
                >
                  {label}
                </span>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-b-full bg-teal-600" />
                )}
              </Link>
            );
          })}
          <button
            onClick={() => setSheetOpen(true)}
            className="relative flex flex-col items-center justify-center gap-0.5 active:bg-stone-100 touch-manipulation"
          >
            <MoreHorizontal
              className={`h-[22px] w-[22px] ${moreActive ? "text-teal-700" : "text-stone-500"}`}
              strokeWidth={moreActive ? 2.5 : 2}
            />
            <span
              className={`text-[10px] leading-tight font-medium ${
                moreActive ? "text-teal-700" : "text-stone-500"
              }`}
            >
              More
            </span>
            {moreActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-b-full bg-teal-600" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
}
