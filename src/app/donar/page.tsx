import { Navbar } from "@/components/Navbar";
import { getSettings } from "@/lib/settings";
import { formatCOP } from "@/lib/format";
import { DonationForm } from "./DonationForm";

export default async function DonarPage() {
  const settings = await getSettings();

  return (
    <>
      <Navbar
        teamName={settings.teamName}
        foundationName={settings.foundationName}
        logoUrl={settings.logoUrl}
      />

      <main className="mx-auto flex-1 w-full max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-neutral-900">Haz tu donación</h1>
        <p className="mt-2 text-neutral-600">
          Transfiere el monto que desees mediante Bre-B y sube el comprobante.
          Un administrador verificará tu donación y se sumará a la meta de{" "}
          {formatCOP(settings.goalAmount)}.
        </p>

        <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
          <h2 className="font-semibold text-emerald-800">
            Datos para transferir
          </h2>
          {settings.brebKey ? (
            <p className="mt-2 text-lg">
              Llave Bre-B:{" "}
              <span className="font-mono font-bold">{settings.brebKey}</span>
            </p>
          ) : (
            <p className="mt-2 text-sm text-neutral-600">
              La llave Bre-B aún no ha sido configurada. Contacta al
              administrador.
            </p>
          )}
          {settings.bankInfo && (
            <p className="mt-2 whitespace-pre-line text-sm text-neutral-700">
              {settings.bankInfo}
            </p>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
          <DonationForm />
        </div>
      </main>

      <footer className="border-t border-neutral-200 py-8 text-center text-sm text-neutral-500">
        {settings.teamName} · {settings.foundationName}
      </footer>
    </>
  );
}
