import { createClient } from "@/lib/supabase/server";
import { BingoPrintSheet } from "@/components/BingoPrintSheet";

export default async function ImprimirMisCartonesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: cards } = await supabase
    .from("bingo_cards")
    .select("number")
    .eq("assigned_to", user!.id)
    .order("number");

  const numbers = (cards ?? []).map((c) => c.number);

  return <BingoPrintSheet numbers={numbers} title="Mis cartones de bingo" />;
}
