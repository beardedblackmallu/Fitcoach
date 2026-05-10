"use client";

import { Mic, Pause, Play, RotateCcw, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/AppContext";

type Stage = "initial" | "recording" | "recorded";

export function VoiceRecorderModal() {
  const { voiceTarget, closeVoiceModal, showToast } = useApp();
  const [stage, setStage] = useState<Stage>("initial");
  const [seconds, setSeconds] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [playPos, setPlayPos] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!voiceTarget) {
      setStage("initial");
      setSeconds(0);
      setPlaying(false);
      setPlayPos(0);
    }
  }, [voiceTarget]);

  useEffect(() => {
    if (stage === "recording") {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage]);

  useEffect(() => {
    if (playing && stage === "recorded") {
      playRef.current = setInterval(() => {
        setPlayPos((p) => {
          if (p >= seconds * 10) {
            setPlaying(false);
            return 0;
          }
          return p + 1;
        });
      }, 100);
    } else if (playRef.current) {
      clearInterval(playRef.current);
      playRef.current = null;
    }
    return () => {
      if (playRef.current) clearInterval(playRef.current);
    };
  }, [playing, stage, seconds]);

  if (!voiceTarget) return null;

  const startRecording = () => {
    setSeconds(0);
    setStage("recording");
  };
  const stopRecording = () => {
    if (seconds === 0) setSeconds(1);
    setStage("recorded");
  };
  const reRecord = () => {
    setStage("initial");
    setSeconds(0);
    setPlayPos(0);
    setPlaying(false);
  };
  const send = () => {
    showToast(`Voice note sent to ${voiceTarget.clientName} via WhatsApp`, "success");
    closeVoiceModal();
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4 fade-in">
      <div className="absolute inset-0 bg-black/40" onClick={closeVoiceModal} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 scale-in">
        <button
          onClick={closeVoiceModal}
          className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-stone-100 text-stone-500"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center mb-1">
          <div className="text-xs text-stone-500 uppercase tracking-wider">Voice note for</div>
          <div className="font-semibold text-stone-900 text-lg">{voiceTarget.clientName}</div>
        </div>

        <div className="my-8 flex flex-col items-center justify-center min-h-[180px]">
          {stage === "initial" && (
            <>
              <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                onClick={startRecording}
                className="relative h-24 w-24 rounded-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 grid place-items-center text-white shadow-lg transition-colors"
              >
                <Mic className="h-10 w-10" />
              </button>
              <div className="mt-5 text-sm text-stone-600">Hold to record</div>
              <div className="text-xs text-stone-400 mt-1">or tap to start</div>
            </>
          )}

          {stage === "recording" && (
            <>
              <div className="relative h-24 w-24">
                <div className="pulse-ring absolute inset-0 rounded-full" />
                <button
                  onClick={stopRecording}
                  className="relative h-24 w-24 rounded-full bg-red-500 hover:bg-red-600 grid place-items-center text-white shadow-lg"
                >
                  <div className="h-7 w-7 bg-white rounded-sm" />
                </button>
              </div>
              <div className="mt-5 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <div className="font-mono text-stone-900 text-lg tabular-nums">{fmt(seconds)}</div>
              </div>
              <div className="mt-3 flex items-end gap-1 h-8">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="wave-bar w-1 bg-teal-500 rounded"
                    style={{ height: "100%", animationDelay: `${i * 60}ms` }}
                  />
                ))}
              </div>
              <div className="mt-3 text-sm text-stone-600">Release to stop</div>
            </>
          )}

          {stage === "recorded" && (
            <>
              <div className="w-full px-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPlaying((p) => !p)}
                    className="h-12 w-12 rounded-full bg-teal-600 hover:bg-teal-700 grid place-items-center text-white shrink-0"
                  >
                    {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                  </button>
                  <div className="flex-1">
                    <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 transition-all"
                        style={{ width: `${Math.min(100, (playPos / (seconds * 10 || 1)) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5 text-xs text-stone-500 tabular-nums">
                      <span>{fmt(Math.floor(playPos / 10))}</span>
                      <span>{fmt(seconds)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {stage === "recorded" && (
          <div className="flex items-center gap-2">
            <button
              onClick={reRecord}
              className="flex-1 h-11 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium text-sm flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Re-record
            </button>
            <button
              onClick={closeVoiceModal}
              className="px-4 h-11 rounded-lg text-stone-600 hover:bg-stone-100 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={send}
              className="flex-1 h-11 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>
        )}

        <div className="text-[11px] text-center text-stone-400 mt-4">
          Sends from your WhatsApp business number
        </div>
      </div>
    </div>
  );
}
