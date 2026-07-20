import React, { useState } from "react";
import { ShieldAlert, Activity, Radio, AlertTriangle } from "lucide-react";
import { supabase, type HolasLog } from "../lib/supabase";
import { useHolasRealtime } from "../lib/realtime";

const METRICS = [
  { key: "cv_anomaly_rate", label: "CV Anomaly Rate", max: 100 },
  { key: "nlp_threat_index", label: "NLP Threat Index", max: 100 },
  { key: "ml_deviance_delta", label: "ML Deviance Δ", max: 100 },
  { key: "cyber_intrusion_triggers", label: "Cyber Intrusions", max: 100 },
  { key: "geo_border_mismatch", label: "Geo-Border Mismatch", max: 100 },
] as const;

export default function HolasDefenderV3() {
  // Local optimistic slider values (broadcast via Supabase).
  const [local, setLocal] = useState<Record<string, number>>({
    cv_anomaly_rate: 12, nlp_threat_index: 8, ml_deviance_delta: 5,
    cyber_intrusion_triggers: 3, geo_border_mismatch: 2,
  });
  // Realtime-synced latest from the DB (shared across all admins).
  const remote: HolasLog | null = useHolasRealtime();

  const push = async (key: string, value: number) => {
    setLocal((l) => ({ ...l, [key]: value }));
    if (!supabase) return;
    await supabase.from("holas_security_logs").insert({
      cv_anomaly_rate: key === "cv_anomaly_rate" ? value : local.cv_anomaly_rate,
      nlp_threat_index: key === "nlp_threat_index" ? value : local.nlp_threat_index,
      ml_deviance_delta: key === "ml_deviance_delta" ? value : local.ml_deviance_delta,
      cyber_intrusion_triggers: key === "cyber_intrusion_triggers" ? value : local.cyber_intrusion_triggers,
      geo_border_mismatch: key === "geo_border_mismatch" ? value : local.geo_border_mismatch,
      action_taken: value > 50 ? "quarantine" : "monitoring",
    });
  };

  const active = remote
    ? Math.max(remote.cv_anomaly_rate, remote.nlp_threat_index, remote.cyber_intrusion_triggers)
    : 0;
  const alert = active > 50;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldAlert className={`w-6 h-6 ${alert ? "text-red-400 animate-pulse" : "text-orange-400"}`} />
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Holas Defender Ultimate v3.0</h1>
          <p className="text-[10px] font-mono uppercase text-slate-500">Sovereign Cloud Security — God-Mode Monitor</p>
        </div>
        <span className={`ml-auto flex items-center gap-1.5 text-[10px] font-mono px-3 py-1 rounded-full ${alert ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
          <Radio className="w-3 h-3" /> {alert ? "THREAT ACTIVE" : "NOMINAL"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 space-y-5">
          <div className="text-xs font-mono uppercase text-slate-500">Local Control Telemetry</div>
          {METRICS.map((m) => (
            <div key={m.key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{m.label}</span>
                <span className="font-mono text-emerald-400">{local[m.key]}</span>
              </div>
              <input type="range" min={0} max={m.max} value={local[m.key]} onChange={(e) => push(m.key, Number(e.target.value))}
                className="w-full accent-emerald-500" />
            </div>
          ))}
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-slate-500 mb-3">
            <Activity className="w-4 h-4 text-orange-400" /> Realtime Shared State (all admins)
          </div>
          {remote ? (
            <div className="space-y-3">
              {METRICS.map((m) => (
                <div key={m.key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">{m.label}</span>
                    <span className="font-mono text-orange-300">{remote[m.key]}</span>
                  </div>
                  <div className="h-2 bg-ink rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500" style={{ width: `${remote[m.key]}%` }} />
                  </div>
                </div>
              ))}
              <div className="mt-3 text-[11px] text-slate-400">
                Last action: <span className="font-mono text-orange-300">{remote.action_taken}</span>
                <span className="text-slate-600"> · {new Date(remote.logged_at).toLocaleTimeString()}</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Awaiting realtime feed…</div>
          )}
          <p className="text-[10px] text-slate-600 mt-4 font-mono">
            Slider changes broadcast via Supabase Realtime — all connected admins see metrics slide in sync.
          </p>
        </div>
      </div>
    </div>
  );
}
