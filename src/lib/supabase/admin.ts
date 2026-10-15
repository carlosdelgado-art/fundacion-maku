import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

/**
 * Cliente de Supabase con la clave "service_role". Tiene privilegios de administrador
 * y se salta las politicas RLS. SOLO debe usarse dentro de Server Actions / codigo de
 * servidor (nunca importarlo desde un componente de cliente).
 *
 * Se usa unicamente para crear las cuentas de los integrantes del equipo
 * (supabase.auth.admin.createUser), ya que esa operacion requiere privilegios
 * de administrador que la clave "anon" no tiene.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
