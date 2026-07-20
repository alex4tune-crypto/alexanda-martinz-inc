import React, { useState } from "react";
import { Crown, BarChart3, Store, Code2, Newspaper, Lightbulb, ShieldAlert } from "lucide-react";
import InsightsHub from "./InsightsHub";
import Marketplace from "./Marketplace";
import SoftwareWholesale from "./SoftwareWholesale";
import BlogHub from "./BlogHub";
import InventorsHub from "./InventorsHub";
import HolasDefenderV3 from "./HolasDefenderV3";
import CeoConsole from "./CeoConsole";

export type UserCategory =
  | "ngo" | "consultant" | "tenant" | "merchant" | "student" | "hobbyist" | "researcher";

export type PortalKey =
  | "gate" | "insights" | "marketplace" | "software" | "blog" | "inventors" | "holas" | "ceo";

const NAV: { key: PortalKey; label: string; icon: React.ComponentType<any>; accent: string }[] = [
  { key: "insights", label: "Insights Hub", icon: BarChart3, accent: "text-emerald-400" },
  { key: "marketplace", label: "Marketplace", icon: Store, accent: "text-emerald-400" },
  { key: "software", label: "Software Wholesale", icon: Code2, accent: "text-emerald-400" },
  { key: "blog", label: "Blog Hub", icon: Newspaper, accent: "text-emerald-400" },
  { key: "inventors", label: "Inventors Hub", icon: Lightbulb, accent: "text-emerald-400" },
  { key: "holas", label: "Holas Defender v3.0", icon: ShieldAlert, accent: "text-orange-400" },
  { key: "ceo", label: "CEO Console", icon: Crown, accent: "text-amber-400" },
];

export default function PortalGate() {
  const [portal, setPortal] = useState<PortalKey>("gate");
  const [category, setCategory] = useState<UserCategory | null>(null);
  const [greeting, setGreeting] = useState<string>("");

  // Dynamic routing: based on category, the appropriate AI greets and shifts UI.
  const enterAs = (cat: UserCategory) => {
    setCategory(cat);
    const map: Record<UserCategory, { portal: PortalKey; hello: string }> = {
      consultant: { portal: "insights", hello: "Welcome, consultant. Routing you to the CEO Insights console." },
      researcher: { portal: "inventors", hello: "Welcome, researcher. The Inventors Lab is ready for your patents." },
      merchant: { portal: "marketplace", hello: "Welcome, merchant. Grok has your marketplace primed." },
      tenant: { portal: "software", hello: "Welcome, tenant. Qwen maintains your SaaS keys." },
      ngo: { portal: "insights", hello: "Welcome, NGO partner. Insights Hub is at your service." },
      student: { portal: "blog", hello: "Welcome, student. The Blog Hub will get you started." },
      hobbyist: { portal: "blog", hello: "Welcome, maker. Explore the Blog Hub." },
    };
    const route = map[cat];
    setGreeting(route.hello);
    setPortal(route.portal);
  };

  if (portal === "gate") {
    return <Gate onEnter={enterAs} greeting={greeting} />;
  }

  return (
    <div className="min-h-screen flex bg-ink">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-edge p-4 flex flex-col gap-1">
        <div className="flex items-center gap-2 px-2 py-3 mb-3">
          <Crown className="w-5 h-5 text-amber-400" />
          <div>
            <div className="text-sm font-semibold text-slate-100">Alexanda Martinz</div>
            <div className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">Cloud Park</div>
          </div>
        </div>
        {NAV.map((n) => (
          <button
            key={n.key}
            onClick={() => setPortal(n.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
              portal === n.key ? "bg-panel border border-edge text-emerald-300" : "text-slate-400 hover:text-slate-100 hover:bg-panel/50"
            }`}
          >
            <n.icon className={`w-4 h-4 ${n.accent}`} />
            {n.label}
          </button>
        ))}
        <div className="mt-auto">
          <button
            onClick={() => { setPortal("gate"); setCategory(null); }}
            className="w-full text-[10px] font-mono text-slate-500 hover:text-slate-300 px-3 py-2 text-left"
          >
            ← Back to Gate
          </button>
          {category && (
            <div className="text-[9px] font-mono text-slate-600 px-3 py-1 uppercase">role: {category}</div>
          )}
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 overflow-y-auto p-6">
        {portal === "insights" && <InsightsHub />}
        {portal === "marketplace" && <Marketplace />}
        {portal === "software" && <SoftwareWholesale />}
        {portal === "blog" && <BlogHub />}
        {portal === "inventors" && <InventorsHub />}
        {portal === "holas" && <HolasDefenderV3 />}
        {portal === "ceo" && <CeoConsole onNavigate={setPortal} />}
      </main>
    </div>
  );
}

function Gate({ onEnter, greeting }: { onEnter: (c: UserCategory) => void; greeting: string }) {
  const [selected, setSelected] = useState<UserCategory>("merchant");
  const options: { value: UserCategory; label: string }[] = [
    { value: "ngo", label: "NGO / Development" },
    { value: "consultant", label: "Consultant" },
    { value: "tenant", label: "Tenant / Business" },
    { value: "merchant", label: "Merchant" },
    { value: "student", label: "Student" },
    { value: "hobbyist", label: "Hobbyist" },
    { value: "researcher", label: "Researcher / Inventor" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-ink via-panel to-ink">
      <div className="card p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <Crown className="w-7 h-7 text-amber-400" />
          <div>
            <h1 className="text-xl font-semibold text-slate-100">Alexanda Martinz Inc.</h1>
            <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Cloud Industrial Park</p>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-5">
          Identify yourself to enter the multi-agent corporate hierarchy. Our AI agents will route you to the right portal.
        </p>
        <label className="text-[10px] font-mono uppercase text-slate-500">I am a…</label>
        <select value={selected} onChange={(e) => setSelected(e.target.value as UserCategory)} className="w-full mt-1 mb-5">
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button onClick={() => onEnter(selected)} className="btn-emerald w-full py-2.5 text-sm">
          Enter the Park
        </button>
        {greeting && (
          <div className="mt-4 text-xs text-emerald-300 bg-panel border border-edge rounded-lg p-3">{greeting}</div>
        )}
      </div>
    </div>
  );
}
