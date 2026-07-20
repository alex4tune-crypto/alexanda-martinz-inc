import { useEffect, useState } from "react";
import { supabase, type HolasLog } from "./supabase";

/**
 * Subscribes to the `holas_security_logs` table via Supabase Realtime so that
 * multiple connected admins see slider metrics update in perfect sync.
 */
export function useHolasRealtime(initial?: HolasLog | null): HolasLog | null {
  const [log, setLog] = useState<HolasLog | null>(initial ?? null);

  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel("holas-stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "holas_security_logs" },
        (payload) => setLog(payload.new as HolasLog)
      )
      .subscribe();

    // Seed with the most recent row.
    supabase
      .from("holas_security_logs")
      .select("*")
      .order("logged_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data[0]) setLog(data[0] as HolasLog);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return log;
}

/** Lightweight fetch wrapper around the FastAPI backend. */
export async function api<T = any>(path: string, init?: RequestInit): Promise<T> {
  const base = (import.meta.env.VITE_API_BASE as string) || "http://localhost:8000";
  const res = await fetch(`${base}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}
