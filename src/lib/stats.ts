import { createClient } from "@/lib/supabase/server";
import type { PublicStats } from "@/lib/types";

const FALLBACK: PublicStats = {
  total_raised: 0,
  goal_amount: 12000000,
  cards_sold: 0,
  cards_total: 300,
  donations_count: 0,
};

/** Llama a la funcion SQL publica get_public_stats() (ver supabase/schema.sql). */
export async function getPublicStats(): Promise<PublicStats> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_stats").single();

  if (error || !data) return FALLBACK;
  return data as PublicStats;
}
