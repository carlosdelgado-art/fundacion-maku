"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CardStatus } from "@/lib/types";

export async function assignRange(formData: FormData) {
  const vendorId = String(formData.get("vendor_id") || "");
  const start = Number(formData.get("start"));
  const end = Number(formData.get("end"));
  const reassign = formData.get("reassign") === "true";

  if (!vendorId || !start || !end || start > end) {
    return { error: "Revisa el integrante y el rango de números." };
  }

  const supabase = await createClient();
  // Por defecto solo se toman cartones "sin asignar". Si se marca
  // "reasignar", tambien se incluyen los que ya estaban "asignados" a otro
  // integrante (para moverlos). Nunca se tocan los que estan "por aprobar"
  // o ya "vendidos", porque esos ya tienen una venta en curso o completada.
  const statusesToClaim: CardStatus[] = reassign
    ? ["unassigned", "assigned"]
    : ["unassigned"];

  const { data, error } = await supabase
    .from("bingo_cards")
    .update({ assigned_to: vendorId, status: "assigned" })
    .in("status", statusesToClaim)
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

function saleIds(formData: FormData) {
  return String(formData.get("ids") || "")
    .split(",")
    .filter(Boolean);
}

export async function approveSale(formData: FormData) {
  const ids = saleIds(formData);
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
    .in("id", ids);

  revalidatePath("/admin/cartones");
  revalidatePath("/admin");
  revalidatePath("/panel");
  revalidatePath("/");
}

export async function rejectSale(formData: FormData) {
  const ids = saleIds(formData);
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
    .in("id", ids);

  revalidatePath("/admin/cartones");
  revalidatePath("/admin");
  revalidatePath("/panel");
}
