"use client";

import { AlertCircle, Link as LinkIcon, Trash2, Video, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  exerciseName: string;
  initialUrl: string;
  onSave: (url: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

function isValidYouTubeUrl(url: string): boolean {
  const t = url.trim();
  if (!t) return false;
  return t.includes("youtube.com") || t.includes("youtu.be");
}

export function VideoLinkModal({
  open,
  exerciseName,
  initialUrl,
  onSave,
  onRemove,
  onClose,
}: Props) {
  const [url, setUrl] = useState(initialUrl);
  const [touched, setTouched] = useState(false);
  const [showError, setShowError] = useState(false);

  // Reset when modal opens for a new exercise
  useEffect(() => {
    if (open) {
      setUrl(initialUrl);
      setTouched(false);
      setShowError(false);
    }
  }, [open, initialUrl]);

  if (!open) return null;

  const isEditing = initialUrl.trim().length > 0;
  const trimmed = url.trim();
  const isEmpty = trimmed.length === 0;
  const isValid = isValidYouTubeUrl(trimmed);

  const handleSave = () => {
    if (isEmpty) {
      setShowError(true);
      setTouched(true);
      return;
    }
    if (!isValid) {
      setShowError(true);
      return;
    }
    onSave(trimmed);
  };

  const showErrorNow = showError && !isValid;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4 fade-in">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-stone-100 text-stone-500"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="h-8 w-8 rounded-md bg-red-50 grid place-items-center text-red-600">
            <Video className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-semibold text-stone-900">
            {isEditing ? "Edit video link" : "Add video link"}
          </h2>
        </div>
        <p className="text-xs text-stone-500 mb-5 pl-10">
          Form video for <span className="font-medium text-stone-700">{exerciseName}</span>
        </p>

        <label className="text-xs font-medium text-stone-700 block mb-1.5">YouTube URL</label>
        <div className="relative">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
          <input
            autoFocus
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setTouched(true);
              if (showError) setShowError(false);
            }}
            onPaste={() => setTouched(true)}
            placeholder="Paste YouTube URL"
            className={`w-full h-11 pl-10 pr-3 rounded-lg border outline-none focus:ring-2 text-sm ${
              showErrorNow
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-stone-300 focus:border-[#1C1C1C] focus:ring-[#E5E3DE]"
            }`}
          />
        </div>

        {showErrorNow && (
          <p className="mt-1.5 text-[11px] text-red-600 inline-flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Please enter a valid YouTube URL
          </p>
        )}
        {!showErrorNow && touched && !isEmpty && isValid && (
          <p className="mt-1.5 text-[11px] text-emerald-600 inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Looks good
          </p>
        )}
        {!touched && !isEditing && (
          <p className="mt-1.5 text-[11px] text-stone-400">
            Accepts youtube.com or youtu.be links. Other platforms not yet supported.
          </p>
        )}

        <div className="mt-6 flex items-center gap-2">
          {isEditing && (
            <button
              onClick={onRemove}
              className="h-10 px-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg inline-flex items-center gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              Remove video
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="h-10 px-4 text-sm text-stone-600 hover:bg-stone-100 font-medium rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isEmpty}
            className="h-10 px-4 text-sm font-medium rounded-lg bg-[#1C1C1C] hover:bg-[#2A2A2A] text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
