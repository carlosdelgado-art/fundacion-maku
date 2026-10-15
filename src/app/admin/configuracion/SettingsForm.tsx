"use client";

import { useState, type FormEvent } from "react";
import type { SiteSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/client";
import { updateSettings } from "./actions";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const formData = new FormData(e.currentTarget);

      // El logo se sube directo desde el navegador al storage de Supabase
      // (evita el limite de tamaño de los Server Actions). Si no se eligio
      // un archivo nuevo, simplemente no se envia "logo_url" y se conserva
      // el logo que ya habia.
      const logoFile = formData.get("logo") as File | null;
      formData.delete("logo");

      if (logoFile && logoFile.size > 0) {
        const supabase = createClient();
        const ext = logoFile.name.split(".").pop() || "png";
        const path = `logo-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("logos")
          .upload(path, logoFile, { upsert: true });

        if (uploadError) {
          setMessage(`No se pudo subir el logo: ${uploadError.message}`);
          setStatus("error");
          return;
        }

        const { data } = supabase.storage.from("logos").getPublicUrl(path);
        formData.set("logo_url", data.publicUrl);
      }

      // Misma logica para la foto de la seccion "Un legado que comienza...".
      const legadoFile = formData.get("legado_image") as File | null;
      formData.delete("legado_image");

      if (legadoFile && legadoFile.size > 0) {
        const supabase = createClient();
        const ext = legadoFile.name.split(".").pop() || "jpg";
        const path = `legado-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("logos")
          .upload(path, legadoFile, { upsert: true });

        if (uploadError) {
          setMessage(`No se pudo subir la foto: ${uploadError.message}`);
          setStatus("error");
          return;
        }

        const { data } = supabase.storage.from("logos").getPublicUrl(path);
        formData.set("legado_image_url", data.publicUrl);
      }

      const result = await updateSettings(formData);

      if (result?.error) {
        setMessage(result.error);
        setStatus("error");
        return;
      }

      setStatus("done");
    } catch (err) {
      console.error(err);
      setMessage("Ocurrió un error inesperado. Intenta de nuevo.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Section title="Marca">
        <Field label="Nombre de la fundación">
          <input
            name="foundation_name"
            defaultValue={settings.foundationName}
            className="input"
          />
        </Field>
        <Field label="Nombre del equipo">
          <input name="team_name" defaultValue={settings.teamName} className="input" />
        </Field>
        <Field label="Logo">
          <input
            name="logo"
            type="file"
            accept="image/*"
            className="input file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white"
          />
          {settings.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logoUrl}
              alt="Logo actual"
              className="mt-2 h-16 w-16 rounded-full border border-neutral-200 object-cover"
            />
          )}
        </Field>
      </Section>

      <Section title="Portada">
        <Field label="Título principal">
          <input name="hero_title" defaultValue={settings.heroTitle} className="input" />
        </Field>
        <Field label="Palabra a resaltar en el título (en verde)">
          <input
            name="hero_subtitle"
            defaultValue={settings.heroSubtitle}
            className="input"
          />
        </Field>
        <Field label="Descripción">
          <textarea
            name="hero_description"
            defaultValue={settings.heroDescription}
            rows={3}
            className="input"
          />
        </Field>
        <Field label="URL del video (cualquier link de YouTube, opcional)">
          <input name="video_url" defaultValue={settings.videoUrl} className="input" />
        </Field>
      </Section>

      <Section title="Legado (sección antes de &quot;¿Cómo puedo ayudar?&quot;)">
        <Field label="Foto">
          <input
            name="legado_image"
            type="file"
            accept="image/*"
            className="input file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white"
          />
          {settings.legadoImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.legadoImageUrl}
              alt="Foto actual de la sección Legado"
              className="mt-2 h-32 w-48 rounded-lg border border-neutral-200 object-cover"
            />
          ) : (
            <p className="mt-2 text-sm text-neutral-500">
              Aún no has subido una foto. Mientras tanto, la sección se
              muestra solo con el texto.
            </p>
          )}
        </Field>
      </Section>

      <Section title="Donaciones">
        <Field label="Meta total (COP)">
          <input
            name="goal_amount"
            type="number"
            min={0}
            step={1000}
            defaultValue={settings.goalAmount}
            className="input"
          />
        </Field>
        <Field label="Llave Bre-B">
          <input name="breb_key" defaultValue={settings.brebKey} className="input" />
        </Field>
        <Field label="Información bancaria adicional (opcional)">
          <textarea
            name="bank_info"
            defaultValue={settings.bankInfo}
            rows={2}
            className="input"
          />
        </Field>
        <Field label="Precio de cada cartón de bingo (COP)">
          <input
            name="card_price"
            type="number"
            min={0}
            step={1000}
            defaultValue={settings.cardPrice}
            className="input"
          />
        </Field>
      </Section>

      <Section title="Bingo Solidario">
        <Field label="Fecha y hora del sorteo">
          <input
            name="bingo_date"
            type="datetime-local"
            defaultValue={settings.bingoDate}
            className="input"
          />
        </Field>
        <Field label="Modalidad (texto introductorio de la página /bingo-solidario)">
          <textarea
            name="bingo_modalidad"
            defaultValue={settings.bingoModalidad}
            rows={3}
            className="input"
          />
        </Field>
        <Field label="Reglas (una por línea)">
          <textarea
            name="bingo_reglas"
            defaultValue={settings.bingoReglas}
            rows={6}
            className="input"
          />
        </Field>
        <Field label="Premios (uno por línea)">
          <textarea
            name="bingo_premios"
            defaultValue={settings.bingoPremios}
            rows={4}
            className="input"
          />
        </Field>
      </Section>

      {status === "error" && (
        <p className="text-sm text-red-600">{message}</p>
      )}
      {status === "done" && (
        <p className="text-sm text-blue-700">Configuración guardada.</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-md bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {status === "loading" ? "Guardando..." : "Guardar configuración"}
      </button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6">
      <h2 className="mb-4 font-semibold text-neutral-900">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-700">{label}</span>
      {children}
    </label>
  );
}
