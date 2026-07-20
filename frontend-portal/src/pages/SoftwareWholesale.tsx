import React from "react";
import { Code2, Download, Copy } from "lucide-react";

const APIS = [
  { id: "insight", name: "Insight Stream API", tier: "Retail", doc: "GET /v1/insights?sector=retail", desc: "Real-time market sentiment streams." },
  { id: "holas", name: "Holas Threat API", tier: "Wholesale", doc: "GET /v1/holas/matrix", desc: "Live cyber anomaly matrices." },
  { id: "tenant", name: "Tenant Ops API", tier: "Retail", doc: "POST /v1/tenants", desc: "Provision workspaces programmatically." },
  { id: "agent", name: "Agent Mesh API", tier: "Wholesale", doc: "POST /v1/agent/dispatch", desc: "Dispatch tasks to the CrewAI hierarchy." },
];

export default function SoftwareWholesale() {
  const copy = (txt: string) => navigator.clipboard?.writeText(txt);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-slate-100">Software Wholesale & Retail — API Catalog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {APIS.map((a) => (
          <div key={a.id} className="card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-slate-100">{a.name}</span>
              </div>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${a.tier === "Wholesale" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"}`}>{a.tier}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">{a.desc}</p>
            <div className="flex items-center justify-between mt-3 bg-ink border border-edge rounded-lg px-3 py-2">
              <code className="text-[11px] font-mono text-emerald-300">{a.doc}</code>
              <button onClick={() => copy(a.doc)} className="text-slate-500 hover:text-emerald-400"><Copy className="w-3.5 h-3.5" /></button>
            </div>
            <button className="mt-3 flex items-center gap-2 text-xs text-slate-300 hover:text-emerald-400">
              <Download className="w-3.5 h-3.5" /> Download SDK / Docs
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
