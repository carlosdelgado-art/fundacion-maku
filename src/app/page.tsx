import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ProgressBar } from "@/components/ProgressBar";
import { getSettings } from "@/lib/settings";
import { getPublicStats } from "@/lib/stats";
import { toYouTubeEmbedUrl } from "@/lib/youtube";

export default async function HomePage() {
  const [settings, stats] = await Promise.all([
    getSettings(),
    getPublicStats(),
  ]);

  const cardsRemaining = Math.max(0, stats.cards_total - stats.cards_sold);

  return (
    <>
      <Navbar
        teamName={settings.teamName}
        foundationName={settings.foundationName}
        logoUrl={settings.logoUrl}
      />

      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
              ❤ Meta: {new Intl.NumberFormat("es-CO").format(stats.goal_amount)}{" "}
              COP
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight text-neutral-900 md:text-5xl">
              {settings.heroTitle.split(settings.heroSubtitle)[0]}
              {settings.heroSubtitle && (
                <span className="text-emerald-600">
                  {settings.heroSubtitle}
                </span>
              )}
              {settings.heroTitle.split(settings.heroSubtitle)[1]}
            </h1>

            <p className="mt-5 max-w-lg text-neutral-600">
              {settings.heroDescription}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/donar"
                className="rounded-md bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
              >
                ❤ Donar Ahora
              </Link>
              <Link
                href="#bingo"
                className="rounded-md border border-neutral-300 px-6 py-3 font-semibold text-neutral-800 hover:bg-neutral-100"
              >
                Conocer Más
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-neutral-200 pt-8">
              <Stat value={settings.statChildren} label="Niños" />
              <Stat value={settings.statLeaders} label="Líderes" />
              <Stat value={settings.statNewHq} label="Sede Nueva" />
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">
              Avance de la campaña
            </h2>
            <p className="mb-4 text-sm text-neutral-500">
              Donaciones + venta de cartones de bingo
            </p>
            <ProgressBar current={stats.total_raised} goal={stats.goal_amount} />

            <div id="bingo" className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-neutral-50 p-4 text-center">
                <p className="text-2xl font-bold text-neutral-900">
                  {stats.cards_sold}/{stats.cards_total}
                </p>
                <p className="text-sm text-neutral-500">Cartones vendidos</p>
              </div>
              <div className="rounded-xl bg-neutral-50 p-4 text-center">
                <p className="text-2xl font-bold text-neutral-900">
                  {cardsRemaining}
                </p>
                <p className="text-sm text-neutral-500">Cartones disponibles</p>
              </div>
            </div>

            {settings.videoUrl && (
              <div className="mt-6 aspect-video overflow-hidden rounded-xl">
                <iframe
                  src={toYouTubeEmbedUrl(settings.videoUrl)}
                  className="h-full w-full"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </section>

        <section className="border-t border-neutral-200 bg-white py-16">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-2xl font-bold text-neutral-900">
              ¿Cómo puedo ayudar?
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-neutral-200 p-6 text-left">
                <h3 className="font-semibold text-emerald-700">
                  1. Haz una donación
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Transfiere cualquier monto a nuestra llave Bre-B y sube tu
                  comprobante. Un administrador lo validará y se sumará a la
                  meta.
                </p>
                <Link
                  href="/donar"
                  className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:underline"
                >
                  Ir al formulario de donación →
                </Link>
              </div>
              <div className="rounded-2xl border border-neutral-200 p-6 text-left">
                <h3 className="font-semibold text-emerald-700">
                  2. Compra un cartón de bingo
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Contacta a cualquier integrante de {settings.teamName}, ellos
                  tienen cartones asignados para vender y reportar tu compra.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 py-8 text-center text-sm text-neutral-500">
        {settings.teamName} · {settings.foundationName}
      </footer>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      <p className="text-sm text-neutral-500">{label}</p>
    </div>
  );
}
