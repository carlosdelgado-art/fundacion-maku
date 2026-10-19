import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPublicStats } from "@/lib/stats";
import { formatCOP } from "@/lib/format";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const stats = await getPublicStats();

  const [{ count: pendingDonations }, { data: pendingSaleRows }, { count: totalProfiles }] =
    await Promise.all([
      supabase
        .from("donations")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("card_sales")
        .select("id, group_id")
        .eq("status", "pending"),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "vendedor"),
    ]);

  // Una compra con varios cartones cuenta como una sola venta pendiente.
  const pendingSales = new Set(
    (pendingSaleRows ?? []).map((s) => s.group_id ?? s.id)
  ).size;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-neutral-900">
        Resumen de la campaña
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Total recaudado" value={formatCOP(stats.total_raised)} />
        <Card label="Meta" value={formatCOP(stats.goal_amount)} />
        <Card
          label="Cartones vendidos"
          value={`${stats.cards_sold} / ${stats.cards_total}`}
        />
        <Card label="Integrantes del equipo" value={String(totalProfiles ?? 0)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/donaciones"
          className="rounded-2xl border border-amber-200 bg-amber-50 p-6 hover:bg-amber-100"
        >
          <p className="text-3xl font-bold text-amber-800">
            {pendingDonations ?? 0}
          </p>
          <p className="text-amber-800">Donaciones por aprobar</p>
        </Link>
        <Link
          href="/admin/cartones"
          className="rounded-2xl border border-amber-200 bg-amber-50 p-6 hover:bg-amber-100"
        >
          <p className="text-3xl font-bold text-amber-800">
            {pendingSales ?? 0}
          </p>
          <p className="text-amber-800">Ventas de cartones por aprobar</p>
        </Link>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <p className="text-xl font-bold text-neutral-900">{value}</p>
      <p className="text-sm text-neutral-500">{label}</p>
    </div>
  );
}
