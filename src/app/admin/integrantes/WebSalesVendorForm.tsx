"use client";

import { useActionState } from "react";
import { setWebSalesVendor } from "./actions";

type State = { error?: string; success?: boolean } | null;

async function action(_prevState: State, formData: FormData) {
  const result = await setWebSalesVendor(formData);
  return result ?? null;
}

export function WebSalesVendorForm({
  vendors,
  currentVendorId,
}: {
  vendors: { id: string; full_name: string }[];
  currentVendorId: string;
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
          Integrante que representa la venta en línea
        </span>
        <select
          name="web_sales_vendor_id"
          defaultValue={currentVendorId}
          className="input"
        >
          <option value="">Ninguno (desactivar venta en línea)</option>
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
        {pending ? "Guardando..." : "Guardar"}
      </button>

      {state?.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="w-full text-sm text-blue-700">
          Listo. Solo el rango asignado a este integrante se mostrará como
          disponible para compra en línea en /bingo-solidario.
        </p>
      )}
    </form>
  );
}
