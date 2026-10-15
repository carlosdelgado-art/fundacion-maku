"use client";

import { useActionState } from "react";
import { assignRange } from "./actions";

type State = { error?: string; success?: boolean; assignedCount?: number } | null;

async function action(_prevState: State, formData: FormData) {
  const result = await assignRange(formData);
  return result ?? null;
}

export function AssignRangeForm({
  vendors,
}: {
  vendors: { id: string; full_name: string; isWebChannel?: boolean }[];
}) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    action,
    null
  );

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 bg-white p-4"
    >
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-neutral-700">
          Integrante
        </span>
        <select name="vendor_id" required className="input">
          <option value="">Selecciona...</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.isWebChannel ? `🌐 ${v.full_name}` : v.full_name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-neutral-700">
          Desde #
        </span>
        <input name="start" type="number" min={1} max={300} required className="input w-24" />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-neutral-700">
          Hasta #
        </span>
        <input name="end" type="number" min={1} max={300} required className="input w-24" />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Asignando..." : "Asignar rango"}
      </button>

      <label className="flex w-full items-center gap-2 text-sm text-neutral-700">
        <input type="checkbox" name="reassign" value="true" className="h-4 w-4" />
        Reasignar también los cartones que ya estén asignados a otro integrante
        (no afecta a los que ya están vendidos o por aprobar)
      </label>

      {state?.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="w-full text-sm text-blue-700">
          Se asignaron {state.assignedCount} cartones.
        </p>
      )}
    </form>
  );
}
