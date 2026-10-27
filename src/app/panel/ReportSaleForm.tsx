"use client";

import { useRef, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCOP } from "@/lib/format";
import { CardPicker } from "@/components/CardPicker";
import { ConfirmTotalModal } from "@/components/ConfirmTotalModal";
import { reportSale } from "./actions";

export function ReportSaleForm({
  cardNumbers,
  cardPrice,
  allowReservation,
}: {
  cardNumbers: number[];
  cardPrice: number;
  allowReservation: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [reserva, setReserva] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const buyerName = String(formData.get("buyer_name") || "").trim();
    const file = formData.get("evidence") as File | null;
    const hasFile = !!file && file.size > 0;

    if (selected.length === 0 || !buyerName || (!reserva && !hasFile)) {
      setErrorMsg(
        reserva
          ? "Selecciona al menos un cartón y escribe el nombre del comprador."
          : "Selecciona al menos un cartón, escribe el nombre del comprador y sube la evidencia de pago."
      );
      setStatus("error");
      return;
    }

    setConfirming(true);
  }

  async function confirmSale() {
    const form = formRef.current;
    if (!form) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const formData = new FormData(form);

      // Subimos la foto directo desde el navegador (evita el limite de 1MB
      // que tienen los Server Actions) y solo enviamos la ruta resultante.
      const file = formData.get("evidence") as File;
      formData.delete("evidence");

      if (file.size > 0) {
        const supabase = createClient();
        const ext = file.name.split(".").pop() || "jpg";
        const path = `cartones/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("evidence")
          .upload(path, file);

        if (uploadError) {
          setErrorMsg(`No se pudo subir la evidencia: ${uploadError.message}`);
          setStatus("error");
          setConfirming(false);
          return;
        }

        formData.set("evidence_url", path);
      }
      formData.set("card_numbers", selected.join(","));

      const result = await reportSale(formData);

      if (result?.error) {
        setErrorMsg(result.error);
        setStatus("error");
        setConfirming(false);
        return;
      }

      setStatus("done");
      setConfirming(false);
      form.reset();
      setSelected([]);
      setReserva(false);
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Ocurrió un error inesperado. Intenta de nuevo.");
      setStatus("error");
      setConfirming(false);
    }
  }

  return (
    <>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6"
      >
        <div>
          <span className="mb-2 block text-sm font-medium text-neutral-700">
            Cartones vendidos
          </span>
          <CardPicker
            options={cardNumbers}
            selected={selected}
            onChange={setSelected}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              Nombre del comprador
            </span>
            <input name="buyer_name" required className="input" />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              Teléfono del comprador
            </span>
            <input name="buyer_phone" className="input" placeholder="300 123 4567" />
          </label>
        </div>

        {allowReservation && (
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
            <input
              type="checkbox"
              name="is_reservation"
              value="true"
              checked={reserva}
              onChange={(e) => setReserva(e.target.checked)}
              className="h-4 w-4"
            />
            Reservar sin comprobante (queda pendiente de aprobación)
          </label>
        )}

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-neutral-700">
            Evidencia de pago (foto)
          </span>
          <input
            name="evidence"
            type="file"
            accept="image/*,.pdf"
            required={!reserva}
            className="input file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white"
          />
        </label>

        {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
        {status === "done" && (
          <p className="text-sm text-blue-700">
            Venta reportada, queda pendiente de aprobación del administrador.
          </p>
        )}

        <button
          type="submit"
          className="rounded-md bg-blue-600 px-6 py-2.5 font-semibold text-white hover:bg-blue-700"
        >
          {selected.length > 0
            ? `Continuar · ${formatCOP(selected.length * cardPrice)}`
            : "Continuar"}
        </button>
      </form>

      {confirming && (
        <ConfirmTotalModal
          title={reserva ? "Confirma la reserva" : "Confirma la venta"}
          description="Revisa los cartones y el total que el comprador debe pagar."
          cardNumbers={selected}
          unitPrice={cardPrice}
          confirmLabel={reserva ? "Confirmar reserva" : "Confirmar venta"}
          loading={status === "loading"}
          onConfirm={confirmSale}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
}

