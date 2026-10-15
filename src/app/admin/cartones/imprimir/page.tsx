import { BingoPrintSheet } from "@/components/BingoPrintSheet";

export default async function ImprimirCartonesPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const { start, end } = await searchParams;
  const from = Math.max(1, Math.min(300, Number(start) || 1));
  const to = Math.max(from, Math.min(300, Number(end) || 300));

  const numbers = Array.from({ length: to - from + 1 }, (_, i) => from + i);

  return (
    <BingoPrintSheet
      numbers={numbers}
      title={`Cartones #${from} al #${to}`}
    />
  );
}
