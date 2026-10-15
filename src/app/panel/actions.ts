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
  // La foto de evidencia ya se sube directo desde el navegador (ver
  // ReportSaleForm.tsx) para evitar el limite de 1MB de los Server Actions.
  // Aqui solo recibimos la ruta ya subida en el bucket "evidence".
  const evidenceUrl = String(formData.get("evidence_url") || "").trim();

  if (!cardNumber || !buyerName || !evidenceUrl) {
    return {
      error:
        "Selecciona el cartón, escribe el nombre del comprador y sube la evidencia.",
    };
  }

  const { error: insertError } = await supabase.from("card_sales").insert({
    card_number: cardNumber,
    seller_id: user.id,
    buyer_name: buyerName,
    buyer_phone: buyerPhone || null,
    evidence_url: evidenceUrl,
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
