"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SETTINGS_KEYS } from "@/lib/types";

export async function updateSettings(formData: FormData) {
  const supabase = await createClient();

  const entries: [string, string][] = [
    [SETTINGS_KEYS.foundationName, String(formData.get("foundation_name") || "")],
    [SETTINGS_KEYS.teamName, String(formData.get("team_name") || "")],
    [SETTINGS_KEYS.heroTitle, String(formData.get("hero_title") || "")],
    [SETTINGS_KEYS.heroSubtitle, String(formData.get("hero_subtitle") || "")],
    [SETTINGS_KEYS.heroDescription, String(formData.get("hero_description") || "")],
    [SETTINGS_KEYS.videoUrl, String(formData.get("video_url") || "")],
    [SETTINGS_KEYS.goalAmount, String(Number(formData.get("goal_amount")) || 0)],
    [SETTINGS_KEYS.brebKey, String(formData.get("breb_key") || "")],
    [SETTINGS_KEYS.bankInfo, String(formData.get("bank_info") || "")],
    [SETTINGS_KEYS.cardPrice, String(Number(formData.get("card_price")) || 0)],
    [SETTINGS_KEYS.bingoDate, String(formData.get("bingo_date") || "")],
    [SETTINGS_KEYS.bingoModalidad, String(formData.get("bingo_modalidad") || "")],
    [SETTINGS_KEYS.bingoReglas, String(formData.get("bingo_reglas") || "")],
    [SETTINGS_KEYS.bingoPremios, String(formData.get("bingo_premios") || "")],
  ];

  // El logo ya se sube directamente desde el navegador (ver SettingsForm.tsx)
  // para evitar el limite de 1MB que tienen los Server Actions por defecto.
  // Aqui solo recibimos la URL publica resultante, si se subio uno nuevo.
  const logoUrl = String(formData.get("logo_url") || "").trim();
  if (logoUrl) {
    entries.push([SETTINGS_KEYS.logoUrl, logoUrl]);
  }

  // Misma logica para la foto de la seccion "Legado".
  const legadoImageUrl = String(formData.get("legado_image_url") || "").trim();
  if (legadoImageUrl) {
    entries.push([SETTINGS_KEYS.legadoImageUrl, legadoImageUrl]);
  }

  const { error } = await supabase
    .from("settings")
    .upsert(entries.map(([key, value]) => ({ key, value })));

  if (error) {
    return { error: `No se pudo guardar la configuración: ${error.message}` };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/configuracion");
  return { success: true };
}
