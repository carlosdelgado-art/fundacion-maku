import { createClient } from "@/lib/supabase/server";
import { formatCOP } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { CreateVendorForm } from "./CreateVendorForm";
import { WebSalesVendorForm } from "./WebSalesVendorForm";

export default async function IntegrantesPage() {
  const supabase = await createClient();
  const settings = await getSettings();

  const [{ data: vendors }, { data: cards }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, phone, created_at")
      .eq("role", "vendedor")
      .order("full_name"),
    supabase.from("bingo_cards").select("number, status, assigned_to"),
  ]);

  const rows = (vendors ?? []).map((v) => {
    const assigned = (cards ?? []).filter((c) => c.assigned_to === v.id);
    const sold = assigned.filter((c) => c.status === "sold");
    const pending = assigned.filter((c) => c.status === "pending_sale");
    return { ...v, assignedCount: assigned.length, soldCount: sold.length, pendingCount: pending.length };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Integrantes del equipo
        </h1>
        <p className="mt-1 text-neutral-600">
          Crea una cuenta para cada integrante. Luego asígnales un rango de
          cartones desde la sección “Cartones de bingo”.
        </p>
      </div>

      <section>
        <h2 className="mb-3 font-semibold text-neutral-900">
          Crear nuevo integrante
        </h2>
        <CreateVendorForm />
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-neutral-900">
          Canal de venta web
        </h2>
        <p className="mb-3 text-sm text-neutral-600">
          Elige qué integrante representa la venta por internet. Solo el
          rango de cartones asignado a ese integrante aparecerá como
          disponible para compra en línea en /bingo-solidario; los rangos de
          los demás integrantes (venta presencial) nunca se exponen ahí.
          Puedes crear un integrante llamado, por ejemplo, “Venta Web” solo
          para este fin.
        </p>
        <WebSalesVendorForm
          vendors={(vendors ?? []).map((v) => ({ id: v.id, full_name: v.full_name }))}
          currentVendorId={settings.webSalesVendorId}
        />
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-neutral-900">
          Integrantes registrados ({rows.length})
        </h2>
        {rows.length === 0 ? (
          <p className="text-neutral-500">Aún no hay integrantes creados.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-200 text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Asignados</th>
                  <th className="px-4 py-3">Por aprobar</th>
                  <th className="px-4 py-3">Vendidos</th>
                  <th className="px-4 py-3">Recaudado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((v) => (
                  <tr key={v.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      {v.full_name}
                      {v.id === settings.webSalesVendorId && (
                        <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                          🌐 Venta web
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {v.phone || "—"}
                    </td>
                    <td className="px-4 py-3">{v.assignedCount}</td>
                    <td className="px-4 py-3">{v.pendingCount}</td>
                    <td className="px-4 py-3">{v.soldCount}</td>
                    <td className="px-4 py-3 font-medium text-blue-700">
                      {formatCOP(v.soldCount * settings.cardPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
