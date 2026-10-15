import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Countdown } from "@/components/Countdown";
import { BuyCardForm } from "@/components/BuyCardForm";
import {
  CalendarIcon,
  CheckCircleIcon,
  GiftIcon,
  TicketIcon,
  UsersIcon,
} from "@/components/icons";
import { getSettings } from "@/lib/settings";
import { getAvailableCardNumbers } from "@/lib/cards";
import { formatCOP } from "@/lib/format";

export const metadata = {
  title: "Bingo Solidario",
};

export default async function BingoSolidarioPage() {
  const [settings, availableNumbers] = await Promise.all([
    getSettings(),
    getAvailableCardNumbers(),
  ]);

  const fechaLegible = new Date(settings.bingoDate).toLocaleString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const reglas = settings.bingoReglas
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);

  const premios = settings.bingoPremios
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <Navbar
        teamName={settings.teamName}
        foundationName={settings.foundationName}
        logoUrl={settings.logoUrl}
      />

      <main className="flex-1">
        <section className="bg-gradient-to-b from-blue-600 to-blue-700 px-6 py-16 text-center text-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium">
            🎟️ Evento solidario
          </span>
          <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-bold md:text-5xl">
            Bingo Solidario
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-blue-100">
            {fechaLegible.charAt(0).toUpperCase() + fechaLegible.slice(1)}
          </p>

          <div className="mt-8">
            <Countdown targetDate={settings.bingoDate} />
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/donar"
              className="rounded-md bg-white px-6 py-3 font-semibold text-blue-700 hover:bg-blue-50"
            >
              ❤ Donar Ahora
            </Link>
            <a
              href="#comprar"
              className="rounded-md border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10"
            >
              🎟️ Comprar mi cartón
            </a>
          </div>
        </section>

        <section id="modalidad" className="border-t border-neutral-200 bg-white py-16">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-center text-2xl font-bold text-neutral-900">
              Modalidad
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-neutral-600">
              {settings.bingoModalidad}
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              <InfoCard
                icon={<CalendarIcon className="h-5 w-5" />}
                label="Fecha y hora"
                value={fechaLegible}
              />
              <InfoCard
                icon={<TicketIcon className="h-5 w-5" />}
                label="Precio del cartón"
                value={formatCOP(settings.cardPrice)}
              />
              <InfoCard
                icon={<UsersIcon className="h-5 w-5" />}
                label="Cómo comprar"
                value={`Cómpralo aquí mismo en línea, o contacta a cualquier integrante de ${settings.teamName}`}
              />
            </div>
          </div>
        </section>

        <section id="comprar" className="border-t border-neutral-200 bg-neutral-50 py-16">
          <div className="mx-auto max-w-2xl px-6">
            <h2 className="text-center text-2xl font-bold text-neutral-900">
              Compra tu cartón aquí
            </h2>
            <p className="mt-2 text-center text-neutral-600">
              Elige un número disponible, transfiere el pago y sube tu
              comprobante. Quedará pendiente de verificación y, una vez
              aprobado, el cartón será tuyo.
            </p>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-6">
              <h3 className="font-semibold text-blue-800">
                Datos para transferir
              </h3>
              {settings.brebKey ? (
                <p className="mt-2 text-lg">
                  Llave Bre-B:{" "}
                  <span className="font-mono font-bold">
                    {settings.brebKey}
                  </span>
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

            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
              <BuyCardForm availableNumbers={availableNumbers} />
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-200 bg-neutral-50 py-16">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="text-center text-2xl font-bold text-neutral-900">
              Reglas
            </h2>
            <ul className="mt-8 space-y-4">
              {reglas.map((regla, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-none text-blue-600" />
                  <span className="text-neutral-700">{regla}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-neutral-200 bg-white py-16">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-center text-2xl font-bold text-neutral-900">
              Premios
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {premios.map((premio, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-neutral-200 p-5"
                >
                  <GiftIcon className="h-6 w-6 flex-none text-blue-600" />
                  <span className="font-medium text-neutral-800">
                    {premio}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-200 bg-blue-600 py-14 text-center text-white">
          <h2 className="text-2xl font-bold">
            ¡No te quedes sin tu cartón!
          </h2>
          <p className="mx-auto mt-2 max-w-md text-blue-100">
            Contacta a cualquier integrante de {settings.teamName} para
            comprar tu cartón y participa el día del sorteo.
          </p>
          <Link
            href="#comprar"
            className="mt-6 inline-block rounded-md bg-white px-6 py-3 font-semibold text-blue-700 hover:bg-blue-50"
          >
            🎟️ Comprar mi cartón
          </Link>
        </section>
      </main>

      <footer className="border-t border-neutral-200 py-8 text-center text-sm text-neutral-500">
        {settings.teamName} · {settings.foundationName}
      </footer>
    </>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 p-5 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        {icon}
      </div>
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <p className="mt-1 font-semibold text-neutral-900">{value}</p>
    </div>
  );
}
