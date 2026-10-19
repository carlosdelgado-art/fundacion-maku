import { BingoPrintSheet } from "@/components/BingoPrintSheet";
import { TOTAL_CARDS } from "@/lib/constants";

export default async function ImprimirCartonesPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const { start, end } = await searchParams;
  const from = Math.max(1, Math.min(TOTAL_CARDS, Number(start) || 1));
  const to = Math.max(from, Math.min(TOTAL_CARDS, Number(end) || TOTAL_CARDS));

  const numbers = Array.from({ length: to - from + 1 }, (_, i) => from + i);

  return (
    <BingoPrintSheet
      numbers={numbers}
      title={`Cartones #${from} al #${to}`}
    />
  );
}
