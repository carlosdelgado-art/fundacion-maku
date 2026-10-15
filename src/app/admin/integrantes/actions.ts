"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createVendor(formData: FormData) {
  // Verificamos que quien llama esta accion sea realmente un administrador,
  // usando su propia sesion (no la clave de servicio) antes de usar privilegios de admin.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return { error: "No autorizado." };

  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const password = String(formData.get("password") || "");

  if (!fullName || !email || password.length < 6) {
    return {
      error:
        "Completa el nombre, el correo y una contraseña de al menos 6 caracteres.",
    };
  }

  const admin = createAdminClient();
  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (createError || !created.user) {
    return {
      error:
        createError?.message === "User already registered"
          ? "Ya existe una cuenta con ese correo."
          : "No se pudo crear la cuenta. Verifica el correo.",
    };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    full_name: fullName,
    phone: phone || null,
    role: "vendedor",
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: "No se pudo guardar el perfil del integrante." };
  }

  revalidatePath("/admin/integrantes");
  return { success: true };
}
