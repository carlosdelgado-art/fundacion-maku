import { formatCOP } from "@/lib/format";

export function ProgressBar({
  current,
  goal,
  compact,
}: {
  current: number;
  goal: number;
  compact?: boolean;
}) {
  const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;

  return (
    <div>
      <div
        className={`w-full overflow-hidden rounded-full bg-blue-100 ${compact ? "h-2" : "h-3"}`}
      >
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div
        className={`mt-1.5 flex flex-wrap items-baseline justify-between gap-x-2 ${compact ? "text-[11px]" : "text-sm"}`}
      >
        <span className="font-semibold text-blue-700">
          {formatCOP(current)} recaudado
        </span>
        <span className="text-neutral-500">
          Meta: {formatCOP(goal)} ({pct}%)
        </span>
      </div>
    </div>
  );
}

