import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ProgressBar } from "@/components/ProgressBar";
import { DonorsCarousel } from "@/components/DonorsCarousel";
import { UsersIcon, StarIcon, MapPinIcon } from "@/components/icons";
import { getSettings } from "@/lib/settings";
import { getPublicStats } from "@/lib/stats";
import { getPublicDonations } from "@/lib/donations";
import { toYouTubeEmbedUrl } from "@/lib/youtube";

export default async function HomePage() {
  const [settings, stats, donations] = await Promise.all([
    getSettings(),
    getPublicStats(),
    getPublicDonations(),
  ]);

  return (
    <>
      <Navbar
        teamName={settings.teamName}
        foundationName={settings.foundationName}
        logoUrl={settings.logoUrl}
      />

      <main className="flex-1">
        <section className="mx-auto grid max-w-[1400px] gap-10 px-6 py-12 md:grid-cols-[1fr_auto] md:items-center lg:gap-16 lg:px-16">
          <div className="max-w-xl">
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
                href="/bingo-solidario"
                className="rounded-md border border-neutral-300 px-6 py-3 font-semibold text-neutral-800 hover:bg-neutral-100"
              >
                🎟️ Bingo Solidario
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
            className="relative mx-auto w-full max-w-md md:w-[520px] md:max-w-[520px] lg:w-[650px] lg:max-w-[650px]"
            style={{ aspectRatio: "1051 / 768" }}
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
                left: "27%",
                right: "27%",
                top: "40%",
                bottom: "11%",
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
          <div
            className={`mx-auto max-w-6xl px-6 ${
              settings.legadoImageUrl
                ? "grid items-center gap-10 md:grid-cols-2 md:gap-14"
                : "max-w-3xl"
            }`}
          >
            <div>
              <h2 className="text-2xl font-bold leading-snug text-neutral-900 md:text-3xl">
                Un legado que comienza cuando abrimos oportunidades
              </h2>
              <div className="mt-5 space-y-4 text-neutral-600">
                <p>
                  La Fundación Jesús es Mi Alegría acompaña a personas con
                  discapacidad y a personas en situación de vulnerabilidad,
                  creando espacios de cuidado, aprendizaje y desarrollo donde
                  cada persona pueda encontrar nuevas oportunidades.
                </p>
                <p>
                  Con nuestro legado, queremos contribuir al bienestar de
                  estas{" "}
                  <strong className="font-semibold text-blue-600">
                    dos poblaciones
                  </strong>
                  : por un lado, personas con discapacidad cognitiva que
                  merecen espacios donde puedan desarrollar sus capacidades,
                  fortalecer su autonomía y descubrir todo lo que son capaces
                  de lograr; y por otro, personas en situación de extrema
                  vulnerabilidad, para quienes el cuidado y el acompañamiento
                  pueden marcar una diferencia en su día a día.
                </p>
                <p>
                  Soñamos con que las personas con discapacidad no solo
                  reciban apoyo, sino que también tengan la oportunidad de
                  aportar, crecer y construir su propio camino, con
                  posibilidades de inclusión.
                </p>
              </div>
            </div>

            {settings.legadoImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.legadoImageUrl}
                alt="Un legado que comienza cuando abrimos oportunidades"
                className="aspect-[4/3] w-full rounded-2xl object-cover"
              />
            )}
          </div>
        </section>

        {donations.length > 0 && (
          <section className="border-t border-neutral-200 bg-neutral-50 py-16">
            <div className="mx-auto max-w-4xl px-6 text-center">
              <h2 className="text-2xl font-bold text-neutral-900">
                Voces que se suman a esta causa
              </h2>
              <p className="mt-2 text-neutral-600">
                Gracias por confiar en {settings.teamName} ❤
              </p>
              <div className="mt-8">
                <DonorsCarousel donations={donations} />
              </div>
            </div>
          </section>
        )}
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
