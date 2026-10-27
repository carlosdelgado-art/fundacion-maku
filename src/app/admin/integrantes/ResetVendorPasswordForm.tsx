"use client";

import { useActionState, useRef } from "react";
import { resetVendorPassword } from "./actions";

type State = { error?: string; success?: boolean } | null;

async function action(_prevState: State, formData: FormData) {
  const result = await resetVendorPassword(formData);
  return result ?? null;
}

export function ResetVendorPasswordForm({
  vendors,
}: {
  vendors: { id: string; full_name: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<State, FormData>(
    action,
    null
  );

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
      }}
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
              {v.full_name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-neutral-700">
          Nueva contraseña
        </span>
        <input
          name="password"
          type="text"
          required
          minLength={6}
          className="input"
          placeholder="Mínimo 6 caracteres"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Restableciendo..." : "Restablecer contraseña"}
      </button>

      {state?.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="w-full text-sm text-blue-700">
          Contraseña restablecida. Comparte la nueva contraseña con el integrante.
        </p>
      )}
    </form>
  );
}
