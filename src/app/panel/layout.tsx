import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";

export default async function PanelLayout({
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

  if (!profile) redirect("/login");
  if (profile.role === "admin") redirect("/admin");

  return (
    <>
      <header className="border-b border-neutral-200 bg-white print:hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div>
            <p className="font-semibold text-neutral-900">
              Hola, {profile.full_name}
            </p>
            <p className="text-xs text-neutral-500">Panel de integrante</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-neutral-600 hover:text-blue-700">
              Ver sitio
            </Link>
            <form action={logout}>
              <button className="text-neutral-600 hover:text-red-600">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10 print:max-w-none print:p-0">
        {children}
      </main>
    </>
  );
}
