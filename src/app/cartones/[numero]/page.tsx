import { notFound } from "next/navigation";
import { getSettings } from "@/lib/settings";
import { TOTAL_CARDS } from "@/lib/constants";
import { BingoCardVisual } from "@/components/BingoCardVisual";
import { PrintButton } from "@/components/PrintButton";

export default async function CartonPage({
  params,
}: {
  params: Promise<{ numero: string }>;
}) {
  const { numero } = await params;
  const cardNumber = Number(numero);

  if (!Number.isInteger(cardNumber) || cardNumber < 1 || cardNumber > TOTAL_CARDS) {
    notFound();
  }

  const settings = await getSettings();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center gap-6 px-6 py-10">
      <div className="print:hidden text-center">
        <h1 className="text-xl font-bold text-neutral-900">
          Cartón de bingo #{cardNumber}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {settings.teamName} · {settings.foundationName}
        </p>
      </div>

      <BingoCardVisual
        cardNumber={cardNumber}
        teamName={settings.teamName}
        logoUrl={settings.logoUrl}
        price={settings.cardPrice}
      />

      <div className="print:hidden flex flex-col items-center gap-2 text-center">
        <PrintButton />
        <p className="max-w-xs text-xs text-neutral-500">
          Usa este botón (o Ctrl+P) para guardar el cartón como PDF o imagen y
          enviarlo por WhatsApp o correo.
        </p>
      </div>
    </main>
  );
}
