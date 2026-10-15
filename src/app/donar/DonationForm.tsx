"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function DonationForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const donorName = String(formData.get("donor_name") || "").trim();
    const donorPhone = String(formData.get("donor_phone") || "").trim();
    const amount = Number(formData.get("amount"));
    const message = String(formData.get("message") || "").trim();
    const file = formData.get("evidence") as File | null;

    if (!donorName || !amount || amount <= 0 || !file || file.size === 0) {
      setErrorMsg("Completa tu nombre, un monto válido y sube el comprobante.");
      setStatus("error");
      return;
    }

    const supabase = createClient();

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `donaciones/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("evidence")
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("donations").insert({
        donor_name: donorName,
        donor_phone: donorPhone || null,
        amount,
        evidence_url: path,
        message: message || null,
      });
      if (insertError) throw insertError;

      setStatus("done");
      form.reset();
    } catch (err) {
      console.error(err);
      setErrorMsg(
        "Ocurrió un error al enviar tu donación. Intenta de nuevo en un momento."
      );
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-lg bg-emerald-50 p-4 text-emerald-800">
        ¡Gracias por tu donación! Quedó registrada y está pendiente de
        verificación. Una vez aprobada se sumará a la meta.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Tu nombre completo" required>
        <input
          name="donor_name"
          required
          className="input"
          placeholder="Ej: María Pérez"
        />
      </Field>

      <Field label="Teléfono (opcional)">
        <input name="donor_phone" className="input" placeholder="300 123 4567" />
      </Field>

      <Field label="Monto donado (COP)" required>
        <input
          name="amount"
          type="number"
          min={1000}
          step={1000}
          required
          className="input"
          placeholder="50000"
        />
      </Field>

      <Field label="Mensaje (opcional)">
        <textarea
          name="message"
          className="input"
          rows={3}
          placeholder="Un mensaje de apoyo para la fundación"
        />
      </Field>

      <Field label="Comprobante de pago (foto o captura)" required>
        <input
          name="evidence"
          type="file"
          accept="image/*,.pdf"
          required
          className="input file:mr-4 file:rounded-md file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-white"
        />
      </Field>

      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-md bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {status === "loading" ? "Enviando..." : "Enviar donación"}
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
