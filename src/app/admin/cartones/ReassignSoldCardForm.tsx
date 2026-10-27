"use client";

import { useActionState, useState } from "react";
import { reassignSoldCard } from "./actions";

type State = { error?: string; success?: boolean } | null;

async function action(_prevState: State, formData: FormData) {
  const result = await reassignSoldCard(formData);
  return result ?? null;
}

export function ReassignSoldCardForm({
  cards,
  vendors,
}: {
  cards: { number: number; sellerName: string | null; buyerName: string | null }[];
  vendors: { id: string; full_name: string }[];
}) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    action,
    null
  );
  const [selected, setSelected] = useState<number | "">(
    cards[0]?.number ?? ""
  );

  if (cards.length === 0) {
    return <p className="text-neutral-500">No hay cartones vendidos.</p>;
  }

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 bg-white p-4"
    >
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-neutral-700">
          Cartón vendido
        </span>
        <select
          name="card_number"
          required
          className="input"
          value={selected}
          onChange={(e) => setSelected(Number(e.target.value))}
        >
          {cards.map((c) => (
            <option key={c.number} value={c.number}>
              #{c.number} · {c.buyerName ?? "Sin comprador"} (
              {c.sellerName ?? "sin vendedor"})
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-neutral-700">
          Nuevo vendedor
        </span>
        <select name="vendor_id" required className="input">
          <option value="">Selecciona...</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.full_name}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Reasignando..." : "Reasignar venta"}
      </button>

      {selected !== "" && (
        <a
          href={`/cartones/${selected}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-neutral-300 px-5 py-2 font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          Ver cartón
        </a>
      )}

      {state?.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="w-full text-sm text-blue-700">
          Venta reasignada correctamente.
        </p>
      )}
    </form>
  );
}
