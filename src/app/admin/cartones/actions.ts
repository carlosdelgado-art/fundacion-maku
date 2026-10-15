"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function assignRange(formData: FormData) {
  const vendorId = String(formData.get("vendor_id") || "");
  const start = Number(formData.get("start"));
  const end = Number(formData.get("end"));

  if (!vendorId || !start || !end || start > end) {
    return { error: "Revisa el integrante y el rango de números." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bingo_cards")
    .update({ assigned_to: vendorId, status: "assigned" })
    .eq("status", "unassigned")
    .gte("number", start)
    .lte("number", end)
    .select("number");

  if (error) {
    return { error: "No se pudo asignar el rango." };
  }

  revalidatePath("/admin/cartones");
  revalidatePath("/admin/integrantes");
  return { success: true, assignedCount: data?.length ?? 0 };
}

export async function approveSale(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase
    .from("card_sales")
    .update({
      status: "approved",
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/admin/cartones");
  revalidatePath("/admin");
  revalidatePath("/panel");
  revalidatePath("/");
}

export async function rejectSale(formData: FormData) {
  const id = String(formData.get("id"));
  const reason = String(formData.get("reject_reason") || "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase
    .from("card_sales")
    .update({
      status: "rejected",
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
      reject_reason: reason || null,
    })
    .eq("id", id);

  revalidatePath("/admin/cartones");
  revalidatePath("/admin");
  revalidatePath("/panel");
}
