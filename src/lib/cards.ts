import { createClient } from "@/lib/supabase/server";

/**
 * Numeros de carton que ya estan asignados a un lider y todavia no se han
 * vendido ni estan en revision: son los unicos disponibles para que el
 * publico los compre desde /bingo-solidario (ver get_available_card_numbers
 * en supabase/schema.sql).
 */
export async function getAvailableCardNumbers(): Promise<number[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_available_card_numbers");

  if (error || !data) return [];
  return data as number[];
}
