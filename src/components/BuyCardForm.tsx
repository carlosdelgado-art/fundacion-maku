"use client";

import { useRef, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCOP } from "@/lib/format";
import { CardPicker } from "@/components/CardPicker";
import { ConfirmTotalModal } from "@/components/ConfirmTotalModal";

export function BuyCardForm({
  availableNumbers,
  cardPrice,
}: {
  availableNumbers: number[];
  cardPrice: number;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [boughtNumbers, setBoughtNumbers] = useState<number[]>([]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const buyerName = String(formData.get("buyer_name") || "").trim();
    const buyerPhone = String(formData.get("buyer_phone") || "").trim();
    const file = formData.get("evidence") as File | null;

    if (selected.length === 0 || !buyerName || !buyerPhone || !file || file.size === 0) {
      setErrorMsg(
        "Elige al menos un cartón, escribe tu nombre y teléfono, y sube el comprobante de pago."
      );
      setStatus("error");
      return;
    }

    setConfirming(true);
  }

  async function confirmPurchase() {
    const form = formRef.current;
    if (!form) return;

    setStatus("loading");
    setErrorMsg("");

    const formData = new FormData(form);
    const buyerName = String(formData.get("buyer_name") || "").trim();
    const buyerPhone = String(formData.get("buyer_phone") || "").trim();
    const file = formData.get("evidence") as File;
    const cardNumbers = [...selected];

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
          p_card_numbers: cardNumbers,
          p_buyer_name: buyerName,
          p_buyer_phone: buyerPhone,
          p_evidence_url: path,
        }
      );

      if (purchaseError) {
        if (purchaseError.message?.includes("card_not_available")) {
          throw new Error(
            "Alguno de los cartones ya no está disponible (alguien más lo acaba de tomar). Quítalo de tu selección y vuelve a intentar."
          );
        }
        throw purchaseError;
      }

      setBoughtNumbers(cardNumbers);
      setStatus("done");
      setConfirming(false);
      form.reset();
      setSelected([]);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al registrar tu compra. Intenta de nuevo."
      );
      setStatus("error");
      setConfirming(false);
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-lg bg-blue-50 p-4 text-blue-800">
        🎉 ¡Listo! Tu compra de{" "}
        {boughtNumbers.length === 1
          ? "el cartón"
          : `${boughtNumbers.length} cartones`}{" "}
        ({boughtNumbers.map((n) => `#${n}`).join(", ")}) quedó registrada y
        está pendiente de verificación. En cuanto se confirme tu pago, los
        cartones serán tuyos para el sorteo.
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
    <>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <span className="mb-2 block text-sm font-medium text-neutral-700">
            Cartones <span className="text-red-500">*</span>
          </span>
          <CardPicker
            options={availableNumbers}
            selected={selected}
            onChange={setSelected}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tu nombre completo" required>
            <input
              name="buyer_name"
              required
              className="input"
              placeholder="Ej: María Pérez"
            />
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
          className="w-full rounded-md bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          {selected.length > 0
            ? `Continuar · ${formatCOP(selected.length * cardPrice)}`
            : "Continuar"}
        </button>
      </form>

      {confirming && (
        <ConfirmTotalModal
          title="Confirma tu compra"
          description="Revisa los cartones y el total. Transfiere exactamente este monto antes de enviar tu comprobante."
          cardNumbers={selected}
          unitPrice={cardPrice}
          confirmLabel="Confirmar y enviar"
          loading={status === "loading"}
          onConfirm={confirmPurchase}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
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
