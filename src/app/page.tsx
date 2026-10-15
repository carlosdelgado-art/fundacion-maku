import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ProgressBar } from "@/components/ProgressBar";
import { UsersIcon, StarIcon, MapPinIcon } from "@/components/icons";
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
        <section className="mx-auto grid max-w-[1800px] gap-10 px-6 py-16 md:grid-cols-2 md:items-center lg:gap-20 lg:px-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
              ❤ Meta: {new Intl.NumberFormat("es-CO").format(stats.goal_amount)}{" "}
              COP
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight text-neutral-900 md:text-5xl">
              {settings.heroTitle.split(settings.heroSubtitle)[0]}
              {settings.heroSubtitle && (
                <span className="text-blue-600">
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
                className="rounded-md bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
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
              <Stat icon={<UsersIcon className="h-5 w-5" />} value={settings.statChildren} />
              <Stat icon={<StarIcon className="h-5 w-5" />} value={settings.statLeaders} />
              <Stat icon={<MapPinIcon className="h-5 w-5" />} value={settings.statNewHq} />
            </div>
          </div>

          <div
            id="bingo"
            className="relative mx-auto w-full max-w-md md:max-w-none"
            style={{ aspectRatio: "840 / 768" }}
          >
            {/* Marco decorativo: el pulpo abraza la tarjeta de avance */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/maku-marco.png"
              alt=""
              className="pointer-events-none absolute inset-0 z-0 h-full w-full select-none"
            />

            {/* Contenido encajado dentro del espacio en blanco del marco */}
            <div
              className="absolute z-10 flex flex-col justify-center gap-2 overflow-hidden"
              style={{
                left: "22.6%",
                right: "23.8%",
                top: "36.5%",
                bottom: "10.2%",
              }}
            >
              <div>
                <h2 className="text-xs font-semibold text-neutral-900 sm:text-sm">
                  Avance de la campaña
                </h2>
                <ProgressBar
                  current={stats.total_raised}
                  goal={stats.goal_amount}
                  compact
                />
                <p className="mt-1 text-[10px] text-neutral-500 sm:text-xs">
                  {stats.cards_sold}/{stats.cards_total} cartones vendidos ·{" "}
                  {cardsRemaining} disponibles
                </p>
              </div>

              {settings.videoUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-md">
                  <iframe
                    src={toYouTubeEmbedUrl(settings.videoUrl, { autoplay: true })}
                    className="h-full w-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-200 bg-white py-16">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-2xl font-bold text-neutral-900">
              ¿Cómo puedo ayudar?
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-neutral-200 p-6 text-left">
                <h3 className="font-semibold text-blue-700">
                  1. Haz una donación
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Transfiere cualquier monto a nuestra llave Bre-B y sube tu
                  comprobante. Un administrador lo validará y se sumará a la
                  meta.
                </p>
                <Link
                  href="/donar"
                  className="mt-4 inline-block text-sm font-semibold text-blue-700 hover:underline"
                >
                  Ir al formulario de donación →
                </Link>
              </div>
              <div className="rounded-2xl border border-neutral-200 p-6 text-left">
                <h3 className="font-semibold text-blue-700">
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

function Stat({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        {icon}
      </div>
      <p className="text-sm font-semibold leading-snug text-neutral-900 sm:text-base">
        {value}
      </p>
    </div>
  );
}
