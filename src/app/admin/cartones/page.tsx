import { createClient } from "@/lib/supabase/server";
import { AssignRangeForm } from "./AssignRangeForm";
import { approveSale, rejectSale } from "./actions";

const STATUS_STYLE: Record<string, string> = {
  unassigned: "bg-neutral-100 text-neutral-500",
  assigned: "bg-blue-50 text-blue-700",
  pending_sale: "bg-amber-50 text-amber-700",
  sold: "bg-emerald-50 text-emerald-700",
};

export default async function CartonesPage() {
  const supabase = await createClient();

  const [{ data: vendors }, { data: cards }, { data: pendingSales }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "vendedor")
        .order("full_name"),
      supabase
        .from("bingo_cards")
        .select("number, status, assigned_to, profiles(full_name)")
        .order("number"),
      supabase
        .from("card_sales")
        .select("*, profiles!card_sales_seller_id_fkey(full_name)")
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
    ]);

  const salesWithUrls = await Promise.all(
    (pendingSales ?? []).map(async (s) => {
      const { data } = await supabase.storage
        .from("evidence")
        .createSignedUrl(s.evidence_url, 3600);
      return { ...s, signedUrl: data?.signedUrl ?? null };
    })
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Cartones de bingo (300)
        </h1>
        <p className="mt-1 text-neutral-600">
          Asigna rangos de números a cada integrante del equipo.
        </p>
      </div>

      <section>
        <h2 className="mb-3 font-semibold text-neutral-900">
          Asignar rango de cartones
        </h2>
        <AssignRangeForm vendors={vendors ?? []} />
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-neutral-900">
          Ventas por aprobar ({salesWithUrls.length})
        </h2>
        {salesWithUrls.length === 0 ? (
          <p className="text-neutral-500">No hay ventas pendientes.</p>
        ) : (
          <div className="space-y-4">
            {salesWithUrls.map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-neutral-200 bg-white p-5"
              >
                <div>
                  <p className="font-semibold text-neutral-900">
                    Cartón #{s.card_number} · Comprador: {s.buyer_name}
                  </p>
                  <p className="text-sm text-neutral-500">
                    Vendido por:{" "}
                    {(s.profiles as unknown as { full_name: string } | null)
                      ?.full_name ?? "—"}{" "}
                    · {s.buyer_phone || "Sin teléfono"}
                  </p>
                  {s.signedUrl && (
                    <a
                      href={s.signedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm font-medium text-emerald-700 hover:underline"
                    >
                      Ver comprobante →
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <form action={approveSale}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                      Aprobar
                    </button>
                  </form>
                  <form action={rejectSale} className="flex gap-2">
                    <input type="hidden" name="id" value={s.id} />
                    <input
                      name="reject_reason"
                      placeholder="Motivo (opcional)"
                      className="input w-36"
                    />
                    <button className="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                      Rechazar
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-neutral-900">
          Estado de los 300 cartones
        </h2>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-10 md:grid-cols-12">
          {(cards ?? []).map((c) => (
            <div
              key={c.number}
              title={
                (c.profiles as unknown as { full_name: string } | null)
                  ?.full_name ?? "Sin asignar"
              }
              className={`rounded-md py-2 text-center text-xs font-semibold ${STATUS_STYLE[c.status]}`}
            >
              #{c.number}
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-neutral-500">
          <Legend color="bg-neutral-100" label="Sin asignar" />
          <Legend color="bg-blue-50" label="Asignado" />
          <Legend color="bg-amber-50" label="Por aprobar" />
          <Legend color="bg-emerald-50" label="Vendido" />
        </div>
      </section>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded ${color}`} /> {label}
    </span>
  );
}
