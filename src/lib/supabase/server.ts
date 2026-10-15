import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/types";

/**
 * Cliente de Supabase para usarse en Server Components, Server Actions y Route Handlers.
 * Lee/escribe la sesion desde las cookies de la peticion.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // El metodo `set` fue llamado desde un Server Component.
            // Esto se puede ignorar si hay un middleware refrescando la sesion.
          }
        },
      },
    }
  );
}
