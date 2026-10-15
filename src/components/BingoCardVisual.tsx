import Image from "next/image";
import { generateBingoCard } from "@/lib/bingo";
import { formatCOP } from "@/lib/format";

const LETTERS = ["B", "I", "N", "G", "O"] as const;

export function BingoCardVisual({
  cardNumber,
  teamName,
  logoUrl,
  price,
}: {
  cardNumber: number;
  teamName: string;
  logoUrl?: string;
  price?: number;
}) {
  const columns = generateBingoCard(cardNumber);

  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border-2 border-blue-700 bg-white print:break-inside-avoid print:shadow-none">
      <div className="flex items-center justify-between bg-blue-700 px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={teamName}
              width={28}
              height={28}
              className="h-7 w-7 rounded-full bg-white object-cover"
            />
          ) : null}
          <span className="text-sm font-semibold">{teamName}</span>
        </div>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
          Cartón #{cardNumber}
        </span>
      </div>

      <div className="grid grid-cols-5 bg-blue-700 text-center text-xl font-extrabold text-white">
        {LETTERS.map((l) => (
          <div key={l} className="py-2">
            {l}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5">
        {[0, 1, 2, 3, 4].map((row) =>
          LETTERS.map((letter) => {
            const value = columns[letter][row];
            const isFree = value === "FREE";
            return (
              <div
                key={`${letter}-${row}`}
                className={`flex aspect-square items-center justify-center border border-neutral-200 text-lg font-bold ${
                  isFree ? "bg-blue-50 text-blue-700" : "text-neutral-900"
                }`}
              >
                {isFree ? "★" : value}
              </div>
            );
          })
        )}
      </div>

      {typeof price === "number" && (
        <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-2 text-center text-sm text-neutral-600">
          Valor: {formatCOP(price)}
        </div>
      )}
    </div>
  );
}
