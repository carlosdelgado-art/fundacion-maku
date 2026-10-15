"use client";

import { useRef, useState, type FormEvent } from "react";
import { createVendor } from "./actions";

export function CreateVendorForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const result = await createVendor(formData);

    if (result?.error) {
      setErrorMsg(result.error);
      setStatus("error");
      return;
    }

    formRef.current?.reset();
    setStatus("idle");
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-xl border border-neutral-200 bg-white p-4 sm:grid-cols-2"
    >
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-neutral-700">
          Nombre completo
        </span>
        <input name="full_name" required className="input" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-neutral-700">
          Teléfono (opcional)
        </span>
        <input name="phone" className="input" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-neutral-700">
          Correo de acceso
        </span>
        <input name="email" type="email" required className="input" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-neutral-700">
          Contraseña inicial
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

      {errorMsg && (
        <p className="sm:col-span-2 text-sm text-red-600">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="sm:col-span-2 rounded-md bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {status === "loading" ? "Creando..." : "Crear integrante"}
      </button>
    </form>
  );
}
