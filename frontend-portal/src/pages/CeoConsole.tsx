import React, { useEffect, useState } from "react";
import { Crown, Send, Power, MessageSquare } from "lucide-react";
import { api } from "../lib/realtime";

type Status = { ceo_auto_mode: boolean; weekly_report_status: string; pending_tasks: any[]; latest_holas: any };

export default function CeoConsole({ onNavigate }: { onNavigate?: (k: string) => void }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [msg, setMsg] = useState("");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = () => api<Status>("/api/system-status").then(setStatus).catch(() => setStatus(null));
  useEffect(() => { refresh(); }, []);

  const toggle = async (enabled: boolean) => {
    await api("/api/toggle-auto", { method: "POST", body: JSON.stringify({ enabled }) });
    refresh();
  };

  const send = async () => {
    if (!msg.trim()) return;
    setBusy(true);
    try {
      const r = await api<{ reply: string }>("/api/chat-ceo", { method: "POST", body: JSON.stringify({ message: msg }) });
      setReply(r.reply);
      setMsg("");
      refresh();
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Crown className="w-6 h-6 text-amber-400" />
        <div>
          <h1 className="text-lg font-semibold text-slate-100">CEO Console — Alexanda Martinz</h1>
          <p className="text-[10px] font-mono uppercase text-slate-500">Direct line to the Chief Executive Agent</p>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Power className={`w-4 h-4 ${status?.ceo_auto_mode ? "text-emerald-400" : "text-slate-500"}`} />
            <span className="text-sm text-slate-200">Autonomous CEO Mode</span>
          </div>
          <button
            onClick={() => toggle(!status?.ceo_auto_mode)}
            className={`relative w-14 h-7 rounded-full transition-colors ${status?.ceo_auto_mode ? "bg-emerald-500" : "bg-slate-700"}`}
          >
            <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all ${status?.ceo_auto_mode ? "left-7" : "left-0.5"}`} />
          </button>
        </div>
        <p className="text-[11px] text-slate-500 mt-2 font-mono">
          {status?.ceo_auto_mode
            ? "AUTO: CEO operates autonomously, compiling Friday 17:00 UTC reports."
            : "MANUAL: CEO listens only to console commands, delegating to the COO."}
        </p>
        {status && (
          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            <div className="bg-ink border border-edge rounded-lg py-3">
              <div className="text-lg font-semibold text-amber-300">{status.pending_tasks?.length ?? 0}</div>
              <div className="text-[9px] font-mono uppercase text-slate-500">Pending Tasks</div>
            </div>
            <div className="bg-ink border border-edge rounded-lg py-3">
              <div className="text-lg font-semibold text-emerald-300">{status.weekly_report_status}</div>
              <div className="text-[9px] font-mono uppercase text-slate-500">Weekly Report</div>
            </div>
            <div className="bg-ink border border-edge rounded-lg py-3">
              <div className="text-lg font-semibold text-orange-300">{status.latest_holas?.action_taken ?? "—"}</div>
              <div className="text-[9px] font-mono uppercase text-slate-500">Holas Action</div>
            </div>
          </div>
        )}
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-slate-500 mb-3">
          <MessageSquare className="w-4 h-4 text-amber-400" /> Message Center
        </div>
        <textarea className="w-full h-24" placeholder="Command the CEO agent…" value={msg} onChange={(e) => setMsg(e.target.value)} />
        <button onClick={send} disabled={busy} className="btn-emerald mt-3 py-2 px-4 text-xs flex items-center gap-2 disabled:opacity-50">
          <Send className="w-3.5 h-3.5" /> {busy ? "Delegating to COO…" : "Send to CEO"}
        </button>
        {reply && (
          <div className="mt-4 bg-ink border border-edge rounded-lg p-3 text-xs text-slate-200 whitespace-pre-wrap">{reply}</div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={() => onNavigate?.("holas")} className="text-xs text-slate-400 hover:text-emerald-400 underline">View Holas Board →</button>
      </div>
    </div>
  );
}
