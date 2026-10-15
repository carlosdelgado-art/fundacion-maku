import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";
import { formatCOP } from "@/lib/format";
import { ReportSaleForm } from "./ReportSaleForm";

const STATUS_LABEL: Record<string, string> = {
  assigned: "Disponible para vender",
  pending_sale: "Reportado, esperando aprobación",
  sold: "Vendido y aprobado",
};

const STATUS_STYLE: Record<string, string> = {
  assigned: "bg-blue-50 text-blue-700",
  pending_sale: "bg-amber-50 text-amber-700",
  sold: "bg-blue-50 text-blue-700",
};

export default async function PanelPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: cards }, settings] = await Promise.all([
    supabase
      .from("bingo_cards")
      .select("number, status")
      .eq("assigned_to", user!.id)
      .order("number"),
    getSettings(),
  ]);

  const myCards = cards ?? [];
  const available = myCards.filter((c) => c.status === "assigned");
  const sold = myCards.filter((c) => c.status === "sold");
  const pending = myCards.filter((c) => c.status === "pending_sale");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Mis cartones de bingo
          </h1>
          <p className="mt-1 text-neutral-600">
            Cada cartón se vende a {formatCOP(settings.cardPrice)}. Tienes{" "}
            {myCards.length} cartones asignados.
          </p>
        </div>
        {myCards.length > 0 && (
          <Link
            href="/panel/imprimir"
            target="_blank"
            className="rounded-md border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
          >
            Imprimir mis cartones
          </Link>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <Summary value={available.length} label="Disponibles" />
        <Summary value={pending.length} label="Por aprobar" />
        <Summary value={sold.length} label="Vendidos" />
      </div>

      {myCards.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-neutral-500">
          Aún no tienes cartones asignados. Pide al administrador que te
          asigne un rango desde el panel de administración.
        </p>
      ) : (
        <>
          <section>
            <h2 className="mb-3 font-semibold text-neutral-900">
              Reportar una venta
            </h2>
            {available.length > 0 ? (
              <ReportSaleForm cardNumbers={available.map((c) => c.number)} />
            ) : (
              <p className="text-sm text-neutral-500">
                No tienes cartones disponibles para vender en este momento.
              </p>
            )}
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-neutral-900">
              Estado de mis cartones
            </h2>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
              {myCards.map((c) => (
                <Link
                  key={c.number}
                  href={`/cartones/${c.number}`}
                  target="_blank"
                  title={STATUS_LABEL[c.status]}
                  className={`rounded-md py-2 text-center text-sm font-semibold hover:opacity-75 ${STATUS_STYLE[c.status]}`}
                >
                  #{c.number}
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Summary({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      <p className="text-sm text-neutral-500">{label}</p>
    </div>
  );
}
