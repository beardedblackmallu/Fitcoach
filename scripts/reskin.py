#!/usr/bin/env python3
"""Phase 2 CP0 baseline reskin: teal -> charcoal/neutral, amber -> orange.
Ordered longest-key-first so prefixed variants (hover:, active:, focus:)
are replaced before their bare forms. Targeted orange accents are applied
separately, by hand, after this baseline pass."""
import os, re

# Baseline mapping. Default for teal is CHARCOAL/neutral (spec: "if in doubt,
# charcoal, not orange"). amber -> burnt-orange warning family.
MAP = {
    # --- teal saturated (buttons/links/accents) -> charcoal ---
    "hover:bg-teal-700": "hover:bg-[#2A2A2A]",
    "hover:bg-teal-800": "hover:bg-[#2A2A2A]",
    "hover:bg-teal-600": "hover:bg-[#2A2A2A]",
    "active:bg-teal-800": "active:bg-[#0F0F0F]",
    "active:bg-teal-700": "active:bg-[#0F0F0F]",
    "hover:text-teal-700": "hover:text-[#1A1A1A]",
    "hover:text-teal-800": "hover:text-[#1A1A1A]",
    "hover:border-teal-300": "hover:border-[#D4D1CB]",
    "focus:border-teal-500": "focus:border-[#1C1C1C]",
    "focus:ring-teal-100": "focus:ring-[#E5E3DE]",
    "bg-teal-600": "bg-[#1C1C1C]",
    "bg-teal-700": "bg-[#1C1C1C]",
    "bg-teal-500": "bg-[#1C1C1C]",
    "bg-teal-900": "bg-[#1C1C1C]",
    "bg-teal-50": "bg-[#F5F4F2]",
    "bg-teal-100": "bg-[#EBEBEA]",
    "bg-teal-200": "bg-[#E5E3DE]",
    "text-teal-600": "text-[#1A1A1A]",
    "text-teal-700": "text-[#1A1A1A]",
    "text-teal-800": "text-[#1A1A1A]",
    "text-teal-900": "text-[#1A1A1A]",
    "text-teal-500": "text-[#6B7280]",
    "border-teal-100": "border-[#E5E3DE]",
    "border-teal-200": "border-[#E5E3DE]",
    "border-teal-300": "border-[#D4D1CB]",
    "ring-teal-100": "ring-[#E5E3DE]",
    "ring-teal-200": "ring-[#E5E3DE]",
    "accent-teal-600": "accent-[#1C1C1C]",
    "from-teal-50": "from-[#F5F4F2]",
    "to-teal-50": "to-[#F5F4F2]",
    # --- amber (escalations) -> burnt orange family ---
    "bg-amber-400": "bg-[#C05C28]",
    "bg-amber-500": "bg-[#C05C28]",
    "bg-amber-600": "bg-[#A84E22]",
    "bg-amber-50": "bg-[#F7EEE8]",
    "bg-amber-100": "bg-[#F7EEE8]",
    "text-amber-600": "text-[#C05C28]",
    "text-amber-700": "text-[#8A4427]",
    "text-amber-800": "text-[#8A4427]",
    "text-amber-900": "text-[#8A4427]",
    "text-amber-500": "text-[#C05C28]",
    "text-amber-400": "text-[#C05C28]",
    "border-amber-100": "border-[#DCC3B2]",
    "border-amber-200": "border-[#DCC3B2]",
    "border-amber-400": "border-[#C05C28]",
    "ring-amber-200": "ring-[#DCC3B2]",
    # --- hardcoded hex literals ---
    "#0D9488": "#1C1C1C",
    "#0F766E": "#2A2A2A",
    "#14B8A6": "#2A2A2A",
    "#F59E0B": "#C05C28",
    "#FAFAF9": "#F5F4F2",
}

# Longest key first so prefixed variants win over bare forms.
ORDERED = sorted(MAP.items(), key=lambda kv: -len(kv[0]))

SRC = os.path.join(os.path.dirname(__file__), "..", "src")
changed = {}
for root, _, files in os.walk(SRC):
    for fn in files:
        if not fn.endswith((".tsx", ".ts", ".css")):
            continue
        path = os.path.join(root, fn)
        with open(path) as f:
            text = orig = f.read()
        for k, v in ORDERED:
            text = text.replace(k, v)
        if text != orig:
            with open(path, "w") as f:
                f.write(text)
            changed[path] = sum(orig.count(k) for k, _ in ORDERED)

for p, n in sorted(changed.items()):
    print(f"{n:4d}  {os.path.relpath(p, os.path.join(SRC, '..'))}")
print(f"\n{len(changed)} files changed")
