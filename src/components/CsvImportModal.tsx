"use client";

// Client bulk import (Phase 2 CP3).
// Supports CSV, XLSX, and XLS. Flow: pick file → parse + preview → confirm → insert.

import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Upload, X, Check, AlertTriangle, Loader2, FileText } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { createClient } from "@/lib/supabase/client";
import { tierByKey } from "@/lib/billing";

interface ParsedRow {
  name: string;
  phone: string;
  email: string | null;
  gender: string | null;
  goal: string | null;
  injuries: string | null;
  medical: string | null;
  allergies: string | null;
  valid: boolean;
  reason?: string;
}

interface ImportResult {
  imported: number;
  skipped: { name: string; reason: string }[];
}

// CSV line splitter that respects quoted fields ("a, b" stays one field).
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; } else inQuotes = false;
      } else cur += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

function normalizeGender(g: string): string | null {
  const v = g.trim().toLowerCase();
  if (v.startsWith("m")) return "Male";
  if (v.startsWith("f")) return "Female";
  return v ? "Prefer not to say" : null;
}

export function CsvImportModal() {
  const { csvImportOpen, closeCsvImport, showToast } = useApp();
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!csvImportOpen) return null;

  const close = () => {
    setRows([]);
    setResult(null);
    closeCsvImport();
  };

  const parseRows = (rawRows: Record<string, string>[]): ParsedRow[] => {
    const norm = (k: string) => k.trim().toLowerCase();
    const pick = (row: Record<string, string>, aliases: string[]) => {
      const key = Object.keys(row).find((k) => aliases.includes(norm(k)));
      return key ? String(row[key] ?? "").trim() : "";
    };
    return rawRows.map((row) => {
      const name = pick(row, ["name", "full name", "client name"]);
      let phone = pick(row, ["phone", "mobile", "number", "contact"]);
      const valid = Boolean(name && phone);
      if (phone && !phone.startsWith("+")) phone = `+91 ${phone}`;
      return {
        name,
        phone,
        email: pick(row, ["email"]) || null,
        gender: normalizeGender(pick(row, ["gender", "sex"])),
        goal: pick(row, ["goal"]) || null,
        injuries: pick(row, ["injuries", "injury"]) || null,
        medical: pick(row, ["medical", "medical conditions", "conditions"]) || null,
        allergies: pick(row, ["allergies", "allergy"]) || null,
        valid,
        reason: valid ? undefined : "Missing name or phone",
      };
    });
  };

  const onFile = async (file: File) => {
    const isExcel = /\.xlsx?$/i.test(file.name);
    let rawRows: Record<string, string>[];

    if (isExcel) {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      rawRows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
    } else {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        showToast("File needs a header row plus at least one client.");
        return;
      }
      const headers = splitCsvLine(lines[0]);
      rawRows = lines.slice(1).map((line) => {
        const cols = splitCsvLine(line);
        return Object.fromEntries(headers.map((h, i) => [h, cols[i] ?? ""]));
      });
    }

    if (rawRows.length === 0) {
      showToast("No rows found in the file.");
      return;
    }
    setResult(null);
    setRows(parseRows(rawRows));
  };

  const doImport = async () => {
    setImporting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showToast("Not signed in — please refresh.");
      setImporting(false);
      return;
    }

    const { data: trainer } = await supabase
      .from("trainers")
      .select("subscription_tier")
      .eq("id", user.id)
      .single();
    const tier = tierByKey(trainer?.subscription_tier);
    const { count: existing } = await supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("trainer_id", user.id);

    const skipped: { name: string; reason: string }[] = rows
      .filter((r) => !r.valid)
      .map((r) => ({ name: r.name || "(no name)", reason: r.reason! }));
    let imported = 0;
    let countSoFar = existing ?? 0;

    for (const r of rows.filter((r) => r.valid)) {
      if (tier && countSoFar >= tier.clients) {
        skipped.push({ name: r.name, reason: `Over ${tier.name} limit (${tier.clients})` });
        continue;
      }
      const { error } = await supabase.from("clients").insert({
        trainer_id: user.id,
        name: r.name,
        phone: r.phone,
        email: r.email,
        gender: r.gender,
        goal: r.goal,
        injuries: r.injuries,
        medical_conditions: r.medical,
        allergies: r.allergies,
        status: "active",
      });
      if (error) {
        skipped.push({
          name: r.name,
          reason: /duplicate|unique/i.test(error.message) ? "Duplicate phone" : error.message,
        });
        continue;
      }
      imported++;
      countSoFar++;
    }

    setImporting(false);
    setResult({ imported, skipped });
    if (imported > 0) {
      window.dispatchEvent(new CustomEvent("clients-changed"));
      showToast(`Imported ${imported} client${imported !== 1 ? "s" : ""}`, "success");
    }
  };

  const validCount = rows.filter((r) => r.valid).length;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4 fade-in">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[85vh] scale-in">
        <div className="px-6 pt-5 pb-3 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900">Import clients</h2>
          <button onClick={close} className="p-1.5 rounded-md hover:bg-stone-100 text-stone-500" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Result screen */}
          {result ? (
            <div>
              <div className="rounded-xl bg-[#E1F5EE] border border-[#9FE3CD] p-4 flex items-center gap-2">
                <Check className="h-5 w-5 text-[#0F6E56]" />
                <span className="text-sm font-medium text-[#0F6E56]">
                  {result.imported} client{result.imported !== 1 ? "s" : ""} imported.
                </span>
              </div>
              {result.skipped.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs font-semibold text-stone-600 mb-1.5">
                    Skipped {result.skipped.length}:
                  </div>
                  <ul className="space-y-1">
                    {result.skipped.map((s, i) => (
                      <li key={i} className="text-xs text-stone-500 flex gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-[#B34700] shrink-0 mt-0.5" />
                        <span><span className="font-medium text-stone-700">{s.name}</span> — {s.reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : rows.length === 0 ? (
            /* Pick screen */
            <div className="text-center py-8">
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
              />
              <div className="mx-auto h-12 w-12 rounded-xl bg-[#F5F4F2] grid place-items-center text-stone-500">
                <FileText className="h-6 w-6" />
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg bg-[#1C1C1C] hover:bg-[#2A2A2A] text-white"
              >
                <Upload className="h-4 w-4" /> Choose file
              </button>
              <p className="text-[11px] text-stone-400 mt-3 leading-relaxed">
                CSV or Excel (.xlsx). First row = headers. Recognised columns: name,
                phone, email, gender, goal, injuries, medical, allergies.{" "}
                <b>Name + phone required.</b>
              </p>
            </div>
          ) : (
            /* Preview screen */
            <div>
              <div className="text-xs text-stone-500 mb-2">
                {validCount} ready · {rows.length - validCount} will be skipped
              </div>
              <div className="border border-stone-200 rounded-lg divide-y divide-stone-100 overflow-hidden">
                {rows.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 text-sm">
                    {r.valid ? (
                      <Check className="h-4 w-4 text-[#0F6E56] shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-[#B34700] shrink-0" />
                    )}
                    <span className="font-medium text-stone-800 truncate flex-1">
                      {r.name || <span className="text-stone-400 italic">no name</span>}
                    </span>
                    <span className="text-xs text-stone-400 shrink-0">
                      {r.valid ? r.phone : r.reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-2">
          {result ? (
            <button onClick={close} className="px-4 h-10 rounded-lg bg-[#1C1C1C] hover:bg-[#2A2A2A] text-white font-medium text-sm">
              Done
            </button>
          ) : (
            <>
              <button onClick={close} className="px-4 h-10 rounded-lg text-stone-600 hover:bg-stone-100 font-medium text-sm">
                Cancel
              </button>
              {rows.length > 0 && (
                <button
                  onClick={doImport}
                  disabled={importing || validCount === 0}
                  className="px-4 h-10 rounded-lg bg-[#FF6400] hover:bg-[#E55A00] glow-orange-sm text-white font-medium text-sm inline-flex items-center gap-2 disabled:opacity-40"
                >
                  {importing && <Loader2 className="h-4 w-4 animate-spin" />}
                  Import {validCount} client{validCount !== 1 ? "s" : ""}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
