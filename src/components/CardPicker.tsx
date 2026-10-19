"use client";

export function CardPicker({
  options,
  selected,
  onChange,
}: {
  options: number[];
  selected: number[];
  onChange: (next: number[]) => void;
}) {
  function toggle(n: number) {
    onChange(
      selected.includes(n)
        ? selected.filter((x) => x !== n)
        : [...selected, n].sort((a, b) => a - b)
    );
  }

  return (
    <div>
      <div className="grid max-h-64 grid-cols-5 gap-2 overflow-y-auto rounded-md border border-neutral-200 p-3 sm:grid-cols-8">
        {options.map((n) => {
          const isSelected = selected.includes(n);
          return (
            <button
              key={n}
              type="button"
              onClick={() => toggle(n)}
              aria-pressed={isSelected}
              className={`rounded-md py-2 text-sm font-semibold transition ${
                isSelected
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-blue-50"
              }`}
            >
              #{n}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between text-sm text-neutral-600">
        <span>
          {selected.length === 1
            ? "1 cartón seleccionado"
            : `${selected.length} cartones seleccionados`}
        </span>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="font-medium text-blue-700 hover:underline"
          >
            Limpiar selección
          </button>
        )}
      </div>
    </div>
  );
}
