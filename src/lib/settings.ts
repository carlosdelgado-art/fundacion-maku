import { createClient } from "@/lib/supabase/server";
import { SETTINGS_KEYS } from "@/lib/types";

/**
 * Carga todas las filas de la tabla "settings" y las devuelve como un objeto
 * { clave: valor } con valores por defecto si alguna fila no existe aun.
 */
export async function getSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("key, value");

  const map = new Map((data ?? []).map((row) => [row.key, row.value ?? ""]));

  return {
    foundationName: map.get(SETTINGS_KEYS.foundationName) || "Fundacion MAKU",
    teamName: map.get(SETTINGS_KEYS.teamName) || "Equipo MAKU",
    logoUrl: map.get(SETTINGS_KEYS.logoUrl) || "",
    heroTitle:
      map.get(SETTINGS_KEYS.heroTitle) ||
      "Construyamos juntos un futuro mejor",
    heroSubtitle: map.get(SETTINGS_KEYS.heroSubtitle) || "futuro mejor",
    heroDescription:
      map.get(SETTINGS_KEYS.heroDescription) ||
      "Ayudanos a alcanzar nuestra meta para apoyar a quienes mas lo necesitan.",
    statChildren: map.get(SETTINGS_KEYS.statChildren) || "100+",
    statLeaders: map.get(SETTINGS_KEYS.statLeaders) || "15",
    statNewHq: map.get(SETTINGS_KEYS.statNewHq) || "1",
    videoUrl: map.get(SETTINGS_KEYS.videoUrl) || "",
    goalAmount: Number(map.get(SETTINGS_KEYS.goalAmount) || 12000000),
    brebKey: map.get(SETTINGS_KEYS.brebKey) || "",
    bankInfo: map.get(SETTINGS_KEYS.bankInfo) || "",
    cardPrice: Number(map.get(SETTINGS_KEYS.cardPrice) || 30000),
  };
}

export type SiteSettings = Awaited<ReturnType<typeof getSettings>>;
