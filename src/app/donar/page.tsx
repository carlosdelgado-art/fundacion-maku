import Image from "next/image";
import Link from "next/link";
import { ProgressBar } from "@/components/ProgressBar";
import { DonorsCarousel } from "@/components/DonorsCarousel";
import { getSettings } from "@/lib/settings";
import { getPublicStats } from "@/lib/stats";
import { getPublicDonations } from "@/lib/donations";
import { toYouTubeEmbedUrl } from "@/lib/youtube";
import { formatCOP } from "@/lib/format";
import { DonationForm } from "./DonationForm";

export default async function DonarPage() {
  const [settings, stats, donations] = await Promise.all([
    getSettings(),
    getPublicStats(),
    getPublicDonations(),
  ]);

  return (
    <>
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center px-6 py-4">
          <Link href="/donar" className="flex items-center gap-3">
            {settings.logoUrl ? (
              <Image
                src={settings.logoUrl}
                alt={settings.teamName}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {settings.teamName.slice(0, 1)}
              </div>
            )}
            <div className="leading-tight">
              <p className="font-bold text-neutral-900">{settings.teamName}</p>
              <p className="text-xs text-neutral-500">
                {settings.foundationName}
              </p>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid max-w-[1400px] gap-10 px-6 py-12 md:grid-cols-[1fr_auto] md:items-center lg:gap-16 lg:px-16">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
              ❤ Meta: {formatCOP(stats.goal_amount)}
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight text-neutral-900 md:text-5xl">
              {settings.heroTitle.split(settings.heroSubtitle)[0]}
              {settings.heroSubtitle && (
                <span className="text-blue-600">{settings.heroSubtitle}</span>
              )}
              {settings.heroTitle.split(settings.heroSubtitle)[1]}
            </h1>

            <p className="mt-5 max-w-lg text-neutral-600">
              {settings.heroDescription}
            </p>
          </div>

          <div
            className="relative mx-auto w-full max-w-md md:w-[520px] md:max-w-[520px] lg:w-[650px] lg:max-w-[650px]"
            style={{ aspectRatio: "1051 / 768" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/maku-marco.png"
              alt=""
              className="pointer-events-none absolute inset-0 z-0 h-full w-full select-none"
            />

            <div
              className="absolute z-10 flex flex-col justify-center gap-2 overflow-hidden"
              style={{ left: "27%", right: "27%", top: "40%", bottom: "11%" }}
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

        <section
          id="donar"
          className="mx-auto w-full max-w-3xl border-t border-neutral-200 px-6 py-16"
        >
        <h1 className="text-3xl font-bold text-neutral-900">Haz tu donación</h1>
        <p className="mt-2 text-neutral-600">
          Transfiere el monto que desees mediante Bre-B y sube el comprobante.
          Un administrador verificará tu donación y se sumará a la meta de{" "}
          {formatCOP(settings.goalAmount)}.
        </p>

        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-6">
          <h2 className="font-semibold text-blue-800">
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
          <p className="mt-2 text-sm text-neutral-700">
            La cuenta sale a nombre de Angie Bernal - Nequi
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
          <DonationForm />
        </div>
        </section>

        {donations.length > 0 && (
          <section className="border-t border-neutral-200 bg-neutral-50 py-16">
            <div className="mx-auto max-w-6xl px-6 text-center">
              <h2 className="text-2xl font-bold text-neutral-900">
                Corazones que ya se sumaron a este legado
              </h2>
              <p className="mt-2 text-neutral-600">
                Gracias por confiar en MAKU - Fundación Jesús es mi alegría ❤
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
