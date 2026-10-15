"use client";

import { useRef, useState, type FormEvent } from "react";
import { reportSale } from "./actions";

export function ReportSaleForm({ cardNumbers }: { cardNumbers: number[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const result = await reportSale(formData);

    if (result?.error) {
      setErrorMsg(result.error);
      setStatus("error");
      return;
    }

    setStatus("done");
    formRef.current?.reset();
    setTimeout(() => setStatus("idle"), 3000);
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-neutral-700">
            Número de cartón vendido
          </span>
          <select name="card_number" required className="input">
            <option value="">Selecciona...</option>
            {cardNumbers.map((n) => (
              <option key={n} value={n}>
                #{n}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-neutral-700">
            Teléfono del comprador
          </span>
          <input name="buyer_phone" className="input" placeholder="300 123 4567" />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-neutral-700">
          Nombre del comprador
        </span>
        <input name="buyer_name" required className="input" />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-neutral-700">
          Evidencia de pago (foto)
        </span>
        <input
          name="evidence"
          type="file"
          accept="image/*,.pdf"
          required
          className="input file:mr-4 file:rounded-md file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-white"
        />
      </label>

      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
      {status === "done" && (
        <p className="text-sm text-emerald-700">
          Venta reportada, queda pendiente de aprobación del administrador.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-md bg-emerald-600 px-6 py-2.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {status === "loading" ? "Enviando..." : "Reportar venta"}
      </button>
    </form>
  );
}
