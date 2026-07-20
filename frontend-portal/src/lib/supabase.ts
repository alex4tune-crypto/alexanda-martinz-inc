import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn("VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — running in offline mode.");
}

export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export type HolasLog = {
  id: string;
  cv_anomaly_rate: number;
  nlp_threat_index: number;
  ml_deviance_delta: number;
  cyber_intrusion_triggers: number;
  geo_border_mismatch: number;
  action_taken: string;
  logged_at: string;
};
