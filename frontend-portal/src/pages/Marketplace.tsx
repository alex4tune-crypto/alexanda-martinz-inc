import React, { useState } from "react";
import { Check, ShoppingCart, KeyRound } from "lucide-react";

const PLANS = [
  { id: "starter", name: "Starter", price: 0, perks: ["1 Workspace", "Community", "Basic Analytics"] },
  { id: "growth", name: "Growth", price: 49, perks: ["5 Workspaces", "API Access", "Priority Support"], popular: true },
  { id: "enterprise", name: "Enterprise", price: 299, perks: ["Unlimited", "SLA", "Dedicated Agent"] },
];

export default function Marketplace() {
  const [cart, setCart] = useState<string[]>([]);
  const [checkout, setCheckout] = useState<string | null>(null);

  const toggle = (id: string) => setCart((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  const buy = () => {
    // Mock digital-key checkout.
    setCheckout(`AMI-${Math.random().toString(36).slice(2, 10).toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-slate-100">Marketplace — SaaS Plans & Licensing</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((p) => (
          <div key={p.id} className={`card p-5 ${p.popular ? "ring-1 ring-emerald-500/40" : ""}`}>
            {p.popular && <div className="text-[9px] font-mono text-emerald-400 uppercase mb-2">Most Popular</div>}
            <div className="text-base font-semibold text-slate-100">{p.name}</div>
            <div className="text-2xl font-bold text-emerald-400 my-2">${p.price}<span className="text-xs text-slate-500">/mo</span></div>
            <ul className="space-y-1.5 text-xs text-slate-300 mb-4">
              {p.perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" />{perk}</li>
              ))}
            </ul>
            <button onClick={() => buy()} className="btn-emerald w-full py-2 text-xs">Buy / License</button>
            <label className="flex items-center gap-2 mt-3 text-[11px] text-slate-400">
              <input type="checkbox" checked={cart.includes(p.id)} onChange={() => toggle(p.id)} className="w-3.5 h-3.5" /> Add to cart
            </label>
          </div>
        ))}
      </div>
      {checkout && (
        <div className="card p-4 flex items-center gap-3 border-emerald-500/30">
          <KeyRound className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-xs text-slate-300">License key generated (mock):</div>
            <div className="text-sm font-mono text-emerald-400">{checkout}</div>
          </div>
        </div>
      )}
      {cart.length > 0 && (
        <div className="card p-4 text-xs text-slate-400 flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-emerald-400" /> {cart.length} item(s) in cart — ready for wholesale checkout.
        </div>
      )}
    </div>
  );
}
