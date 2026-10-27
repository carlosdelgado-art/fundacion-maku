"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";

export async function reportSale(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Debes iniciar sesión." };

  const cardNumbers = Array.from(
    new Set(
      String(formData.get("card_numbers") || "")
        .split(",")
        .map(Number)
        .filter((n) => Number.isInteger(n) && n > 0)
    )
  );
  const buyerName = String(formData.get("buyer_name") || "").trim();
  const buyerPhone = String(formData.get("buyer_phone") || "").trim();
  // La foto de evidencia ya se sube directo desde el navegador (ver
  // ReportSaleForm.tsx) para evitar el limite de 1MB de los Server Actions.
  // Aqui solo recibimos la ruta ya subida en el bucket "evidence".
  const evidenceUrl = String(formData.get("evidence_url") || "").trim();
  const isReservation = formData.get("is_reservation") === "true";

  if (isReservation) {
    const { webSalesVendorId } = await getSettings();
    if (webSalesVendorId === user.id) {
      return { error: "El canal de venta web no puede reservar cartones." };
    }
  }

  if (cardNumbers.length === 0 || !buyerName || (!isReservation && !evidenceUrl)) {
    return {
      error: isReservation
        ? "Selecciona los cartones y escribe el nombre del comprador."
        : "Selecciona los cartones, escribe el nombre del comprador y sube la evidencia.",
    };
  }

  const groupId = crypto.randomUUID();
  const { error: insertError } = await supabase.from("card_sales").insert(
    cardNumbers.map((cardNumber) => ({
      card_number: cardNumber,
      seller_id: user.id,
      buyer_name: buyerName,
      buyer_phone: buyerPhone || null,
      evidence_url: evidenceUrl || null,
      group_id: groupId,
    }))
  );

  if (insertError) {
    return {
      error:
        "No se pudo registrar la venta. Verifica que los cartones estén disponibles.",
    };
  }

  revalidatePath("/panel");
  return { success: true };
}
