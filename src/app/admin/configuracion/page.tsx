import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./SettingsForm";

export default async function ConfiguracionPage() {
  const settings = await getSettings();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Configuración</h1>
        <p className="mt-1 text-neutral-600">
          Estos datos se reflejan en la página pública (logo, meta, textos de
          la portada y los datos para donar).
        </p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}
