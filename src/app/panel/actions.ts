"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function reportSale(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Debes iniciar sesión." };

  const cardNumber = Number(formData.get("card_number"));
  const buyerName = String(formData.get("buyer_name") || "").trim();
  const buyerPhone = String(formData.get("buyer_phone") || "").trim();
  const file = formData.get("evidence") as File | null;

  if (!cardNumber || !buyerName || !file || file.size === 0) {
    return {
      error:
        "Selecciona el cartón, escribe el nombre del comprador y sube la evidencia.",
    };
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `cartones/${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("evidence")
    .upload(path, file);
  if (uploadError) {
    return { error: "No se pudo subir la evidencia. Intenta de nuevo." };
  }

  const { error: insertError } = await supabase.from("card_sales").insert({
    card_number: cardNumber,
    seller_id: user.id,
    buyer_name: buyerName,
    buyer_phone: buyerPhone || null,
    evidence_url: path,
  });

  if (insertError) {
    return {
      error:
        "No se pudo registrar la venta. Verifica que el cartón esté disponible.",
    };
  }

  revalidatePath("/panel");
  return { success: true };
}
