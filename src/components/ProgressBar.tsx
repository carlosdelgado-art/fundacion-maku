import { formatCOP } from "@/lib/format";

export function ProgressBar({
  current,
  goal,
}: {
  current: number;
  goal: number;
}) {
  const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;

  return (
    <div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-emerald-100">
        <div
          className="h-full rounded-full bg-emerald-600 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex items-baseline justify-between text-sm">
        <span className="font-semibold text-emerald-700">
          {formatCOP(current)} recaudado
        </span>
        <span className="text-neutral-500">
          Meta: {formatCOP(goal)} ({pct}%)
        </span>
      </div>
    </div>
  );
}
