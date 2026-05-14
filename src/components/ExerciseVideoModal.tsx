"use client";

import { ExternalLink, Video, X } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { youtubeIdFromUrl } from "@/lib/data";

export function ExerciseVideoModal() {
  const { exerciseVideoTarget, closeExerciseVideo } = useApp();
  if (!exerciseVideoTarget) return null;

  const id = youtubeIdFromUrl(exerciseVideoTarget.url);
  const embedSrc = id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4 py-6 fade-in">
      <div className="absolute inset-0 bg-black/60" onClick={closeExerciseVideo} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl scale-in overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-red-50 grid place-items-center text-red-600">
              <Video className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Form video</div>
              <div className="font-semibold text-stone-900 text-sm leading-tight">{exerciseVideoTarget.name}</div>
            </div>
          </div>
          <button
            onClick={closeExerciseVideo}
            className="p-1.5 rounded-md hover:bg-stone-100 text-stone-500"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative bg-black aspect-video w-full">
          {embedSrc ? (
            <iframe
              src={embedSrc}
              title={exerciseVideoTarget.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-white text-sm">
              Unable to embed this URL.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-stone-200 bg-stone-50">
          <a
            href={exerciseVideoTarget.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-stone-600 hover:text-stone-900 inline-flex items-center gap-1.5"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open on YouTube
          </a>
          <span className="text-[11px] text-stone-400 truncate ml-3 max-w-[50%]">
            {exerciseVideoTarget.url}
          </span>
        </div>
      </div>
    </div>
  );
}
