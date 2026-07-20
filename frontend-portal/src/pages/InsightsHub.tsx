import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, Users, Globe, DollarSign } from "lucide-react";
import { supabase } from "../lib/supabase";

type Tenant = {
  id: string;
  name: string;
  plan: string;
  status: string;
  api_key_hash: string | null;
  created_at: string;
  updated_at: string;
};

type Insight = {
  id: string;
  tenant_id: string;
  month: string; // ISO date string
  gdp_growth: number | null;
  inflation: number | null;
  trade_balance: number | null;
  crop_health: number | null;
  created_at: string;
};

export default function InsightsHub() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tenants on mount
  useEffect(() => {
    const fetchTenants = async () => {
      if (!supabase) {
        setError("Supabase client not initialized. Check your environment variables.");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase.from('tenants').select('*');
        if (error) throw error;
        setTenants(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to fetch tenants");
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  // Fetch insights when tenant changes
  useEffect(() => {
    if (!selectedTenantId) {
      setInsights([]);
      return;
    }

    const fetchInsights = async () => {
      if (!supabase) {
        setError("Supabase client not initialized. Check your environment variables.");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('insights')
          .select('*')
          .eq('tenant_id', selectedTenantId)
          .order('month', { ascending: true });
        if (error) throw error;
        setInsights(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to fetch insights");
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [selectedTenantId]);

  if (!supabase) {
    return <div className="p-4 text-red-400">Supabase client not initialized. Check your environment variables.</div>;
  }

  if (error) {
    return <div className="p-4 text-red-400">Error: {error}</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('default', { month: 'short', year: 'numeric' });
  };

  const prepareChartData = (insights: Insight[], valueFn: (i: Insight) => number) => {
    return insights.map(i => ({
      date: formatDate(i.month),
      value: valueFn(i) ?? 0, // Convert null to 0
    }));
  };

  if (loading) {
    return <div className="p-4 text-slate-400">Loading...</div>;
  }

  if (tenants.length === 0) {
    return <div className="p-4 text-slate-400">No tenants found.</div>;
  }

  if (!selectedTenantId) {
    return (
      <div className="space-y-6">
        <h1 className="text-lg font-semibold text-slate-100">Insights Hub — Consulting & Analytics</h1>
        <div className="mb-4">
          <label className="text-[10px] font-mono uppercase text-slate-500">Select Industrial Site</label>
          <select 
            value={selectedTenantId} 
            onChange={(e) => setSelectedTenantId(e.target.value)}
            className="w-full mt-1 mb-5 border border-gray-300 rounded px-2 py-1 bg-gray-800 text-slate-100"
          >
            <option value="">Select a site</option>
            {tenants.map(t => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <p className="text-slate-400">Please select an industrial site to view insights.</p>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-lg font-semibold text-slate-100">Insights Hub — Consulting & Analytics</h1>
        <div className="mb-4">
          <label className="text-[10px] font-mono uppercase text-slate-500">Select Industrial Site</label>
          <select 
            value={selectedTenantId} 
            onChange={(e) => setSelectedTenantId(e.target.value)}
            className="w-full mt-1 mb-5 border border-gray-300 rounded px-2 py-1 bg-gray-800 text-slate-100"
          >
            <option value="">Select a site</option>
            {tenants.map(t => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <p className="text-slate-400">No data available for the selected site.</p>
      </div>
    );
  }

  // Prepare data for each metric
  const gdpData = prepareChartData(insights, i => i.gdp_growth);
  const inflationData = prepareChartData(insights, i => i.inflation);
  const tradeData = prepareChartData(insights, i => i.trade_balance);
  const cropData = prepareChartData(insights, i => i.crop_health);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-slate-100">Insights Hub — Consulting & Analytics</h1>
      <div className="mb-4">
        <label className="text-[10px] font-mono uppercase text-slate-500">Select Industrial Site</label>
        <select 
          value={selectedTenantId} 
          onChange={(e) => setSelectedTenantId(e.target.value)}
          className="w-full mt-1 mb-5 border border-gray-300 rounded px-2 py-1 bg-gray-800 text-slate-100"
        >
          <option value="">Select a site</option>
          {tenants.map(t => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* GDP Growth Chart */}
        <div className="card p-4">
          <div className="text-xs font-mono uppercase text-slate-500 mb-3">GDP Growth (%)</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={gdpData}>
              <CartesianGrid stroke="#1b2630" />
              <XAxis dataKey="date" stroke="#475569" fontSize={11} />
              <YAxis stroke="#475569" fontSize={11} />
              <Tooltip contentStyle={{ background: "#0b0f14", border: "1px solid #1b2630" }} />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Inflation Chart */}
        <div className="card p-4">
          <div className="text-xs font-mono uppercase text-slate-500 mb-3">Inflation (%)</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={inflationData}>
              <CartesianGrid stroke="#1b2630" />
              <XAxis dataKey="date" stroke="#475569" fontSize={11} />
              <YAxis stroke="#475569" fontSize={11} />
              <Tooltip contentStyle={{ background: "#0b0f14", border: "1px solid #1b2630" }} />
              <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Trade Balance Chart */}
        <div className="card p-4">
          <div className="text-xs font-mono uppercase text-slate-500 mb-3">Trade Balance (M)</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={tradeData}>
              <CartesianGrid stroke="#1b2630" />
              <XAxis dataKey="date" stroke="#475569" fontSize={11} />
              <YAxis stroke="#475569" fontSize={11} />
              <Tooltip contentStyle={{ background: "#0b0f14", border: "1px solid #1b2630" }} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Crop Health Chart */}
        <div className="card p-4">
          <div className="text-xs font-mono uppercase text-slate-500 mb-3">Crop Health Index</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={cropData}>
              <CartesianGrid stroke="#1b2630" />
              <XAxis dataKey="date" stroke="#475569" fontSize={11} />
              <YAxis stroke="#475569" fontSize={11} />
              <Tooltip contentStyle={{ background: "#0b0f14", border: "1px solid #1b2630" }} />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}