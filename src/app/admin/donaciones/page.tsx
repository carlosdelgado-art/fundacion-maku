import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCOP } from "@/lib/format";
import { approveDonation, rejectDonation } from "./actions";
import type { ReviewStatus } from "@/lib/types";

const TABS: { value: ReviewStatus; label: string }[] = [
  { value: "pending", label: "Pendientes" },
  { value: "approved", label: "Aprobadas" },
  { value: "rejected", label: "Rechazadas" },
];

export default async function DonacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const current = (status as ReviewStatus) || "pending";

  const supabase = await createClient();
  const { data: donations } = await supabase
    .from("donations")
    .select("*")
    .eq("status", current)
    .order("created_at", { ascending: false });

  const withSignedUrls = await Promise.all(
    (donations ?? []).map(async (d) => {
      const { data } = await supabase.storage
        .from("evidence")
        .createSignedUrl(d.evidence_url, 3600);
      return { ...d, signedUrl: data?.signedUrl ?? null };
    })
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Donaciones</h1>

      <div className="flex gap-2 border-b border-neutral-200">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/donaciones?status=${tab.value}`}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
              current === tab.value
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {withSignedUrls.length === 0 ? (
        <p className="text-neutral-500">No hay donaciones en este estado.</p>
      ) : (
        <div className="space-y-4">
          {withSignedUrls.map((d) => (
            <div
              key={d.id}
              className="rounded-xl border border-neutral-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-neutral-900">
                    {d.donor_name} · {formatCOP(Number(d.amount))}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {d.donor_phone || "Sin teléfono"} ·{" "}
                    {new Date(d.created_at).toLocaleString("es-CO")}
                  </p>
                  {d.message && (
                    <p className="mt-2 text-sm italic text-neutral-600">
                      “{d.message}”
                    </p>
                  )}
                  {d.reject_reason && (
                    <p className="mt-2 text-sm text-red-600">
                      Motivo de rechazo: {d.reject_reason}
                    </p>
                  )}
                  {d.signedUrl && (
                    <a
                      href={d.signedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm font-medium text-emerald-700 hover:underline"
                    >
                      Ver comprobante →
                    </a>
                  )}
                </div>

                {current === "pending" && (
                  <div className="flex gap-2">
                    <form action={approveDonation}>
                      <input type="hidden" name="id" value={d.id} />
                      <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                        Aprobar
                      </button>
                    </form>
                    <RejectForm id={d.id} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RejectForm({ id }: { id: string }) {
  return (
    <form action={rejectDonation} className="flex gap-2">
      <input type="hidden" name="id" value={id} />
      <input
        name="reject_reason"
        placeholder="Motivo (opcional)"
        className="input w-40"
      />
      <button className="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
        Rechazar
      </button>
    </form>
  );
}
