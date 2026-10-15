import { createClient } from "@/lib/supabase/server";
import type { PublicDonation } from "@/lib/types";

/**
 * Llama a la funcion SQL publica get_public_donations() (ver supabase/schema.sql)
 * para mostrar los mensajes de quienes donaron, sin exponer datos sensibles
 * (telefono, comprobante) de los donantes.
 */
export async function getPublicDonations(limit = 20): Promise<PublicDonation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_donations", {
    donations_limit: limit,
  });

  if (error || !data) return [];
  return data as PublicDonation[];
}
