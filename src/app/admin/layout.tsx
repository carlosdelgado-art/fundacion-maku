import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";

const LINKS = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/donaciones", label: "Donaciones" },
  { href: "/admin/cartones", label: "Cartones de bingo" },
  { href: "/admin/cartones/ganador", label: "Verificar ganador" },
  { href: "/admin/integrantes", label: "Integrantes" },
  { href: "/admin/configuracion", label: "Configuración" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/panel");

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <header className="border-b border-neutral-200 bg-white print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="font-semibold text-neutral-900">
              Panel de administración
            </p>
            <p className="text-xs text-neutral-500">
              {profile.full_name}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-neutral-600 hover:text-emerald-700">
              Ver sitio
            </Link>
            <form action={logout}>
              <button className="text-neutral-600 hover:text-red-600">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-6 text-sm font-medium text-neutral-600">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap border-b-2 border-transparent py-3 hover:border-emerald-600 hover:text-emerald-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 print:max-w-none print:p-0">
        {children}
      </main>
    </div>
  );
}
