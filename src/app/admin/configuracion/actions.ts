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
    [SETTINGS_KEYS.statChildren, String(formData.get("stat_children") || "")],
    [SETTINGS_KEYS.statLeaders, String(formData.get("stat_leaders") || "")],
    [SETTINGS_KEYS.statNewHq, String(formData.get("stat_new_hq") || "")],
    [SETTINGS_KEYS.videoUrl, String(formData.get("video_url") || "")],
    [SETTINGS_KEYS.goalAmount, String(Number(formData.get("goal_amount")) || 0)],
    [SETTINGS_KEYS.brebKey, String(formData.get("breb_key") || "")],
    [SETTINGS_KEYS.bankInfo, String(formData.get("bank_info") || "")],
    [SETTINGS_KEYS.cardPrice, String(Number(formData.get("card_price")) || 0)],
  ];

  const logoFile = formData.get("logo") as File | null;
  if (logoFile && logoFile.size > 0) {
    const ext = logoFile.name.split(".").pop() || "png";
    const path = `logo-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(path, logoFile, { upsert: true });

    if (!uploadError) {
      const { data } = supabase.storage.from("logos").getPublicUrl(path);
      entries.push([SETTINGS_KEYS.logoUrl, data.publicUrl]);
    }
  }

  const { error } = await supabase
    .from("settings")
    .upsert(entries.map(([key, value]) => ({ key, value })));

  if (error) {
    return { error: "No se pudo guardar la configuración." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/configuracion");
  return { success: true };
}
