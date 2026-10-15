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
    statChildren: map.get(SETTINGS_KEYS.statChildren) || "Más de 70 niños",
    statLeaders: map.get(SETTINGS_KEYS.statLeaders) || "12 Líderes",
    statNewHq: map.get(SETTINGS_KEYS.statNewHq) || "Sede Madrid - Cundinamarca",
    videoUrl: map.get(SETTINGS_KEYS.videoUrl) || "",
    goalAmount: Number(map.get(SETTINGS_KEYS.goalAmount) || 12000000),
    brebKey: map.get(SETTINGS_KEYS.brebKey) || "",
    bankInfo: map.get(SETTINGS_KEYS.bankInfo) || "",
    cardPrice: Number(map.get(SETTINGS_KEYS.cardPrice) || 30000),
    bingoDate: map.get(SETTINGS_KEYS.bingoDate) || "2026-11-01T19:00",
    bingoModalidad:
      map.get(SETTINGS_KEYS.bingoModalidad) ||
      "El Bingo Solidario es nuestra forma de recaudar fondos en comunidad: cada cartón que compras ayuda directamente a la fundación y te da la oportunidad de ganar increíbles premios. Compra tu cartón con cualquier integrante del equipo, repórtalo y espera el día del sorteo en vivo.",
    bingoReglas:
      map.get(SETTINGS_KEYS.bingoReglas) ||
      [
        "Cada cartón tiene 15 números distribuidos en una cuadrícula de bingo tradicional.",
        "Solo participan los cartones cuya compra haya sido reportada y aprobada por el equipo organizador.",
        "El sorteo se realiza en vivo, cantando las balotas una por una.",
        "Gana quien complete primero el patrón anunciado antes de iniciar cada ronda.",
        "Al cantar “¡Bingo!”, un integrante del equipo verificará tu cartón contra las balotas cantadas antes de entregar el premio.",
        "La organización se reserva el derecho de anular cartones no reportados o con inconsistencias.",
      ].join("\n"),
    bingoPremios:
      map.get(SETTINGS_KEYS.bingoPremios) ||
      [
        "🥇 Primer puesto: premio sorpresa principal",
        "🥈 Segundo puesto: premio sorpresa",
        "🥉 Tercer puesto: premio sorpresa",
        "🎁 Premios adicionales durante la jornada para animar el evento",
      ].join("\n"),
  };
}

export type SiteSettings = Awaited<ReturnType<typeof getSettings>>;
