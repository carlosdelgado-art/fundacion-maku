import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BingoCardVisual } from "@/components/BingoCardVisual";
import { getSettings } from "@/lib/settings";
import { TOTAL_CARDS } from "@/lib/constants";

type SaleWithSeller = {
  id: string;
  card_number: number;
  buyer_name: string;
  buyer_phone: string | null;
  status: string;
  created_at: string;
  profiles: { full_name: string } | null;
};

const STATUS_BANNER: Record<string, { text: string; style: string }> = {
  approved: {
    text: "✅ Venta aprobada — este cartón es válido para jugar",
    style: "bg-blue-50 border-blue-300 text-blue-800",
  },
  pending: {
    text: "⏳ Esta venta todavía está pendiente de aprobación",
    style: "bg-amber-50 border-amber-300 text-amber-800",
  },
  rejected: {
    text: "⚠️ Esta venta fue rechazada — revisa con el administrador antes de entregar el premio",
    style: "bg-red-50 border-red-300 text-red-800",
  },
};

export default async function GanadorPage({
  searchParams,
}: {
  searchParams: Promise<{ numero?: string }>;
}) {
  const { numero } = await searchParams;
  const cardNumber = Number(numero);
  const hasSearch = Number.isInteger(cardNumber) && cardNumber >= 1 && cardNumber <= TOTAL_CARDS;

  const supabase = await createClient();
  const settings = await getSettings();

  const [{ data: allSales }, searchSale] = await Promise.all([
    supabase
      .from("card_sales")
      .select("id, card_number, buyer_name, buyer_phone, status, created_at, profiles!card_sales_seller_id_fkey(full_name)")
      .eq("status", "approved")
      .order("card_number"),
    hasSearch
      ? supabase
          .from("card_sales")
          .select("id, card_number, buyer_name, buyer_phone, status, created_at, profiles!card_sales_seller_id_fkey(full_name)")
          .eq("card_number", cardNumber)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const sale = searchSale.data as SaleWithSeller | null;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Verificar ganador
        </h1>
        <p className="mt-1 text-neutral-600">
          Cuando alguien cante &quot;¡Bingo!&quot;, busca el número de su cartón aquí
          para ver su diseño (y compararlo con las balotas cantadas) junto con
          los datos de quién lo compró.
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 bg-white p-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-neutral-700">
            Número de cartón
          </span>
          <input
            name="numero"
            type="number"
            min={1}
            max={TOTAL_CARDS}
            defaultValue={numero}
            required
            className="input w-32"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Buscar
        </button>
      </form>

      {hasSearch && (
        <section className="grid gap-6 md:grid-cols-2">
          <BingoCardVisual
            cardNumber={cardNumber}
            teamName={settings.teamName}
            logoUrl={settings.logoUrl}
          />

          <div className="space-y-3">
            {sale ? (
              <>
                <div
                  className={`rounded-xl border p-4 font-semibold ${STATUS_BANNER[sale.status]?.style ?? ""}`}
                >
                  {STATUS_BANNER[sale.status]?.text ?? sale.status}
                </div>
                <div className="rounded-xl border border-neutral-200 bg-white p-4">
                  <p className="text-sm text-neutral-500">Comprador</p>
                  <p className="font-semibold text-neutral-900">
                    {sale.buyer_name}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {sale.buyer_phone || "Sin teléfono registrado"}
                  </p>
                  <p className="mt-3 text-sm text-neutral-500">Vendido por</p>
                  <p className="font-semibold text-neutral-900">
                    {sale.profiles?.full_name ?? "—"}
                  </p>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 font-semibold text-amber-800">
                ⚠️ Este cartón #{cardNumber} no tiene ninguna venta registrada
                en el sistema. Verifica con cuidado antes de entregar el
                premio.
              </div>
            )}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-semibold text-neutral-900">
          Listado completo de cartones vendidos (aprobados) — {(allSales ?? []).length}
        </h2>
        {(allSales ?? []).length === 0 ? (
          <p className="text-neutral-500">
            Aún no hay ventas aprobadas.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-200 text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Cartón</th>
                  <th className="px-4 py-3">Comprador</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Vendido por</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {(allSales as unknown as SaleWithSeller[]).map((s) => (
                  <tr key={s.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-3 font-semibold text-neutral-900">
                      #{s.card_number}
                    </td>
                    <td className="px-4 py-3">{s.buyer_name}</td>
                    <td className="px-4 py-3 text-neutral-600">
                      {s.buyer_phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {s.profiles?.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/cartones/ganador?numero=${s.card_number}`}
                        className="text-blue-700 hover:underline"
                      >
                        Ver cartón →
                      </Link>
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
