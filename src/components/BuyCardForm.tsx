"use client";

import { useRef, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function BuyCardForm({
  availableNumbers,
}: {
  availableNumbers: number[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedNumber, setSelectedNumber] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [boughtNumber, setBoughtNumber] = useState<number | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const cardNumber = Number(formData.get("card_number"));
    const buyerName = String(formData.get("buyer_name") || "").trim();
    const buyerPhone = String(formData.get("buyer_phone") || "").trim();
    const file = formData.get("evidence") as File | null;

    if (!cardNumber || !buyerName || !buyerPhone || !file || file.size === 0) {
      setErrorMsg(
        "Elige un cartón, escribe tu nombre y teléfono, y sube el comprobante de pago."
      );
      setStatus("error");
      return;
    }

    const supabase = createClient();

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `cartones/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("evidence")
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { error: purchaseError } = await supabase.rpc(
        "request_card_purchase",
        {
          p_card_number: cardNumber,
          p_buyer_name: buyerName,
          p_buyer_phone: buyerPhone,
          p_evidence_url: path,
        }
      );

      if (purchaseError) {
        if (purchaseError.message?.includes("card_not_available")) {
          throw new Error(
            "Ese cartón ya no está disponible (alguien más lo acaba de tomar). Elige otro número y vuelve a intentar."
          );
        }
        throw purchaseError;
      }

      setBoughtNumber(cardNumber);
      setStatus("done");
      form.reset();
      setSelectedNumber("");
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al registrar tu compra. Intenta de nuevo."
      );
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-lg bg-blue-50 p-4 text-blue-800">
        🎉 ¡Listo! Tu compra del cartón #{boughtNumber} quedó registrada y
        está pendiente de verificación. En cuanto se confirme tu pago, el
        cartón será tuyo para el sorteo.
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-3 block text-sm font-semibold underline"
        >
          Comprar otro cartón
        </button>
      </div>
    );
  }

  if (availableNumbers.length === 0) {
    return (
      <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
        Por ahora no hay cartones disponibles para compra en línea. Contacta
        a cualquier integrante del equipo para conseguir el tuyo.
      </p>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Número de cartón" required>
          <select
            name="card_number"
            required
            className="input"
            value={selectedNumber}
            onChange={(e) => setSelectedNumber(e.target.value)}
          >
            <option value="">Selecciona...</option>
            {availableNumbers.map((n) => (
              <option key={n} value={n}>
                #{n}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Teléfono (Grupo de WhatsApp)" required>
          <input
            name="buyer_phone"
            required
            className="input"
            placeholder="300 123 4567"
          />
        </Field>
      </div>

      {selectedNumber && (
        <a
          href={`/cartones/${selectedNumber}`}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-sm font-medium text-blue-700 hover:underline"
        >
          Ver diseño del cartón #{selectedNumber} →
        </a>
      )}

      <Field label="Tu nombre completo" required>
        <input
          name="buyer_name"
          required
          className="input"
          placeholder="Ej: María Pérez"
        />
      </Field>

      <Field label="Comprobante de pago (foto o captura)" required>
        <input
          name="evidence"
          type="file"
          accept="image/*,.pdf"
          required
          className="input file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white"
        />
      </Field>

      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-md bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {status === "loading" ? "Enviando..." : "Comprar este cartón"}
      </button>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
