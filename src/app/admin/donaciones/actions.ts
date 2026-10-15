"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function approveDonation(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase
    .from("donations")
    .update({
      status: "approved",
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/admin/donaciones");
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function rejectDonation(formData: FormData) {
  const id = String(formData.get("id"));
  const reason = String(formData.get("reject_reason") || "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase
    .from("donations")
    .update({
      status: "rejected",
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
      reject_reason: reason || null,
    })
    .eq("id", id);

  revalidatePath("/admin/donaciones");
  revalidatePath("/admin");
}
