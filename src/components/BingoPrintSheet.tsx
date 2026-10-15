import { getSettings } from "@/lib/settings";
import { BingoCardVisual } from "@/components/BingoCardVisual";
import { PrintButton } from "@/components/PrintButton";

export async function BingoPrintSheet({
  numbers,
  title,
}: {
  numbers: number[];
  title: string;
}) {
  const settings = await getSettings();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="print:hidden mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">{title}</h1>
          <p className="text-sm text-neutral-500">
            {numbers.length} cartones · {settings.teamName}
          </p>
        </div>
        <PrintButton />
      </div>

      {numbers.length === 0 ? (
        <p className="print:hidden text-neutral-500">
          No hay cartones para mostrar.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 print:grid-cols-2">
          {numbers.map((n) => (
            <div key={n} className="print:break-inside-avoid">
              <BingoCardVisual
                cardNumber={n}
                teamName={settings.teamName}
                logoUrl={settings.logoUrl}
                price={settings.cardPrice}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
