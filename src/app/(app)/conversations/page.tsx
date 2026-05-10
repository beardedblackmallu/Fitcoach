"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import {
  ArrowLeft,
  Bot,
  Camera,
  ChevronRight,
  Mic,
  MoreVertical,
  Paperclip,
  Phone,
  Play,
  Search,
  Send,
  User,
  Video,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import {
  conversations as seedConvos,
  getClient,
  Message,
} from "@/lib/data";
import { useApp } from "@/lib/AppContext";
import Link from "next/link";

function ConversationsInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { openVoiceModal, openCallModal, callLogs, showToast } = useApp();

  const initialId = params.get("c") ?? "priya";
  const [activeId, setActiveId] = useState(initialId);
  const [convos, setConvos] = useState(() =>
    seedConvos.map((c) => ({ ...c, messages: [...c.messages] }))
  );
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [showOnMobile, setShowOnMobile] = useState<"list" | "thread">("list");
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = params.get("c");
    if (c) {
      setActiveId(c);
      setShowOnMobile("thread");
    }
  }, [params]);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [activeId, convos]);

  const filteredList = convos
    .filter((c) => {
      const client = getClient(c.clientId);
      if (!client) return false;
      return client.name.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => b.unread - a.unread);

  const activeConvo = useMemo(() => convos.find((c) => c.clientId === activeId) ?? convos[0], [convos, activeId]);
  const activeClient = getClient(activeConvo.clientId)!;

  // Inject call log system messages
  const threadMessages: Message[] = useMemo(() => {
    const sysLogs = (callLogs[activeConvo.clientId] ?? []).map((l) => ({
      id: l.id,
      sender: "system" as const,
      kind: "text" as const,
      text: l.text,
      time: l.time,
    }));
    return [...activeConvo.messages, ...sysLogs];
  }, [activeConvo, callLogs]);

  const sendMessage = () => {
    if (!draft.trim()) return;
    const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const newMsg: Message = {
      id: `t-${Date.now()}`,
      sender: "trainer",
      kind: "text",
      text: draft.trim(),
      time,
      fromName: "From Sandeep",
    };
    setConvos((prev) =>
      prev.map((c) =>
        c.clientId === activeId ? { ...c, messages: [...c.messages, newMsg], preview: newMsg.text!, lastTime: time, lastFromBot: false } : c
      )
    );
    setDraft("");
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-white">
      {/* Conversation list */}
      <aside
        className={`${
          showOnMobile === "list" ? "flex" : "hidden"
        } md:flex flex-col w-full md:w-80 lg:w-96 border-r border-stone-200 shrink-0`}
      >
        <div className="p-3 border-b border-stone-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-stone-100 border border-transparent focus:bg-white focus:border-stone-300 focus:ring-2 focus:ring-teal-100 outline-none text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredList.map((c) => {
            const client = getClient(c.clientId)!;
            const isActive = c.clientId === activeId;
            return (
              <button
                key={c.clientId}
                onClick={() => {
                  setActiveId(c.clientId);
                  setShowOnMobile("thread");
                  router.replace(`/conversations?c=${c.clientId}`);
                }}
                className={`w-full text-left flex items-start gap-3 px-3 py-3 border-b border-stone-100 transition-colors ${
                  isActive ? "bg-teal-50/60" : "hover:bg-stone-50"
                }`}
              >
                <Avatar initials={client.initials} color={client.avatarColor} size="md" online={client.online} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium text-sm text-stone-900 truncate">{client.name}</span>
                    <span className={`text-[11px] shrink-0 ${c.unread > 0 ? "text-teal-700 font-medium" : "text-stone-400"}`}>
                      {c.lastTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {c.lastFromBot && <Bot className="h-3 w-3 text-stone-400 shrink-0" />}
                    <span
                      className={`text-xs truncate ${
                        c.unread > 0 ? "text-stone-800 font-medium" : "text-stone-500"
                      }`}
                    >
                      {c.preview}
                    </span>
                  </div>
                </div>
                {c.unread > 0 && (
                  <span className="h-5 min-w-[20px] grid place-items-center px-1.5 rounded-full bg-teal-600 text-white text-[10px] font-semibold mt-1">
                    {c.unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Thread */}
      <section className={`${showOnMobile === "thread" ? "flex" : "hidden"} md:flex flex-1 flex-col min-w-0`}>
        {/* Top bar */}
        <div className="h-16 px-3 sm:px-4 border-b border-stone-200 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowOnMobile("list")}
            className="md:hidden p-1.5 rounded-md hover:bg-stone-100"
            aria-label="Back to list"
          >
            <ArrowLeft className="h-5 w-5 text-stone-700" />
          </button>
          <Avatar initials={activeClient.initials} color={activeClient.avatarColor} size="md" online={activeClient.online} />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-stone-900 truncate">{activeClient.name}</div>
            <div className="text-xs text-stone-500">
              {activeClient.online ? <span className="text-emerald-600">● online</span> : `last seen ${activeClient.lastSeen ?? "recently"}`}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              title="Call from your personal phone"
              className="p-2 rounded-md text-stone-300 cursor-not-allowed"
              disabled
            >
              <Video className="h-5 w-5" />
            </button>
            <Link
              href={`/clients/${activeClient.id}`}
              className="p-2 rounded-md hover:bg-stone-100 text-stone-600"
              title="View profile"
            >
              <User className="h-5 w-5" />
            </Link>
            <button
              onClick={() => showToast("Conversation menu")}
              className="p-2 rounded-md hover:bg-stone-100 text-stone-600"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={threadRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-5 bg-stone-50/60">
          <div className="max-w-3xl mx-auto space-y-3">
            {threadMessages.map((m) => (
              <MessageBubble key={m.id} m={m} />
            ))}
          </div>
        </div>

        {/* Composer */}
        <div className="border-t border-stone-200 bg-white px-3 sm:px-4 py-3 shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2">
              <button
                onClick={() => showToast("File picker would open here")}
                className="p-2 rounded-md hover:bg-stone-100 text-stone-500"
                title="Attach file"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <button
                onClick={() => openVoiceModal(activeClient.name)}
                className="p-2 rounded-md hover:bg-stone-100 text-teal-700"
                title="Record voice note"
              >
                <Mic className="h-5 w-5" />
              </button>
              <button
                onClick={() => showToast("Camera would open here")}
                className="p-2 rounded-md hover:bg-stone-100 text-stone-500"
                title="Camera"
              >
                <Camera className="h-5 w-5" />
              </button>
              <div className="flex-1">
                <textarea
                  rows={1}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={`Message ${activeClient.name.split(" ")[0]}...`}
                  className="w-full resize-none px-3 py-2 rounded-lg bg-stone-100 border border-transparent focus:bg-white focus:border-stone-300 focus:ring-2 focus:ring-teal-100 outline-none text-sm max-h-32"
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!draft.trim()}
                className="h-10 w-10 rounded-lg bg-teal-600 hover:bg-teal-700 text-white grid place-items-center disabled:opacity-40 disabled:cursor-not-allowed"
                title="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="text-[11px] text-stone-400 mt-2 text-center">
              Messages send via WhatsApp from your business number
            </div>
          </div>
        </div>
      </section>

      {/* Right context panel (desktop) */}
      <aside className="hidden xl:flex flex-col w-72 border-l border-stone-200 shrink-0 bg-stone-50/40">
        <div className="p-5">
          <Avatar initials={activeClient.initials} color={activeClient.avatarColor} size="lg" online={activeClient.online} />
          <div className="mt-3 font-semibold text-stone-900">{activeClient.name}</div>
          <div className="text-xs text-stone-500">{activeClient.goal}</div>
        </div>
        <div className="px-5 pb-5">
          <div className="text-xs text-stone-500 uppercase tracking-wider font-medium mb-3">Quick stats</div>
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone-500">Current weight</dt>
              <dd className="font-medium tabular-nums">{activeClient.weightCurrent} kg</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-500">Target</dt>
              <dd className="font-medium tabular-nums">{activeClient.weightTarget} kg</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-500">Joined</dt>
              <dd className="font-medium">{activeClient.joinedWeeksAgo}w ago</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-500">Plan ends</dt>
              <dd className="font-medium">{activeClient.totalWeeks - activeClient.weekOfPlan}w</dd>
            </div>
          </dl>
        </div>
        <div className="px-5 pb-5">
          <button
            onClick={() => openCallModal(activeClient.id, activeClient.name, activeClient.phone)}
            className="w-full h-9 text-sm rounded-lg border border-stone-300 hover:bg-white text-stone-700 font-medium flex items-center justify-center gap-1.5"
          >
            <Phone className="h-4 w-4" /> Tap to call
          </button>
        </div>
        <Link
          href={`/clients/${activeClient.id}`}
          className="mx-5 mb-5 mt-auto text-xs text-teal-700 hover:text-teal-800 font-medium flex items-center gap-1"
        >
          View full profile <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </aside>
    </div>
  );
}

function MessageBubble({ m }: { m: Message }) {
  if (m.sender === "system") {
    return (
      <div className="text-center my-2">
        <span className="text-[11px] italic text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
          {m.text}
        </span>
      </div>
    );
  }

  const isTrainer = m.sender === "trainer";
  const isBot = m.sender === "bot";
  const align = isTrainer ? "items-end" : "items-start";

  return (
    <div className={`flex flex-col ${align}`}>
      {(isBot || isTrainer) && (
        <div className={`text-[10px] font-medium mb-0.5 px-1 ${isTrainer ? "text-teal-700" : "text-stone-500"}`}>
          {isBot ? "🤖 Auto" : `✓ ${m.fromName ?? "From Sandeep"}`}
        </div>
      )}
      <div
        className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 shadow-sm ${
          isTrainer
            ? "bg-teal-600 text-white rounded-br-md"
            : isBot
            ? "bg-stone-100 text-stone-800 rounded-bl-md"
            : "bg-white text-stone-800 border border-stone-200 rounded-bl-md"
        }`}
      >
        {m.kind === "text" && <div className="text-sm whitespace-pre-wrap leading-relaxed">{m.text}</div>}
        {m.kind === "voice" && (
          <div className="flex items-center gap-2 min-w-[180px]">
            <button className={`h-8 w-8 rounded-full grid place-items-center ${isTrainer ? "bg-white/20 hover:bg-white/30" : "bg-stone-200"}`}>
              <Play className={`h-3.5 w-3.5 ${isTrainer ? "text-white" : "text-stone-700"} ml-0.5`} />
            </button>
            <div className="flex items-end gap-0.5 h-5 flex-1">
              {Array.from({ length: 22 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-0.5 rounded ${isTrainer ? "bg-white/70" : "bg-stone-400"}`}
                  style={{ height: `${20 + Math.sin(i * 1.3) * 30 + Math.random() * 30}%` }}
                />
              ))}
            </div>
            <span className={`text-xs tabular-nums ${isTrainer ? "text-white/80" : "text-stone-500"}`}>
              {m.voiceLength}
            </span>
          </div>
        )}
        {m.kind === "image" && (
          <div>
            <div className="h-32 w-44 rounded-lg bg-gradient-to-br from-amber-200 via-orange-300 to-red-300 grid place-items-center text-amber-900/50 text-3xl">
              🍛
            </div>
            {m.text && <div className="text-sm mt-1.5">{m.text}</div>}
          </div>
        )}
      </div>
      <div className={`text-[10px] mt-1 px-1 ${isTrainer ? "text-stone-400" : "text-stone-400"}`}>{m.time}</div>
    </div>
  );
}

export default function ConversationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-stone-500 text-sm">Loading conversations...</div>}>
      <ConversationsInner />
    </Suspense>
  );
}
