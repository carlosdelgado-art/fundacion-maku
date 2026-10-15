"use client";

import { useState, type FormEvent } from "react";
import type { SiteSettings } from "@/lib/settings";
import { updateSettings } from "./actions";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const formData = new FormData(e.currentTarget);
    const result = await updateSettings(formData);

    if (result?.error) {
      setMessage(result.error);
      setStatus("error");
      return;
    }

    setMessage(result?.warning || "");
    setStatus("done");
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
            className="input file:mr-4 file:rounded-md file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-white"
          />
          {settings.logoUrl && (
            <p className="mt-1 text-xs text-neutral-500">
              Logo actual: {settings.logoUrl}
            </p>
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
        <Field label="URL del video (embed de YouTube, opcional)">
          <input name="video_url" defaultValue={settings.videoUrl} className="input" />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Niños">
            <input name="stat_children" defaultValue={settings.statChildren} className="input" />
          </Field>
          <Field label="Líderes">
            <input name="stat_leaders" defaultValue={settings.statLeaders} className="input" />
          </Field>
          <Field label="Sede nueva">
            <input name="stat_new_hq" defaultValue={settings.statNewHq} className="input" />
          </Field>
        </div>
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

      {status === "error" && (
        <p className="text-sm text-red-600">{message}</p>
      )}
      {status === "done" && (
        <p className={`text-sm ${message ? "text-amber-600" : "text-emerald-700"}`}>
          {message || "Configuración guardada."}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-md bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
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
