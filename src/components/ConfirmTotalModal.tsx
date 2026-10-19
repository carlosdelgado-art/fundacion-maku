"use client";

import { formatCOP } from "@/lib/format";

export function ConfirmTotalModal({
  title,
  description,
  cardNumbers,
  unitPrice,
  confirmLabel,
  loading,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  cardNumbers: number[];
  unitPrice: number;
  confirmLabel: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const total = cardNumbers.length * unitPrice;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-total-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3
          id="confirm-total-title"
          className="text-lg font-bold text-neutral-900"
        >
          {title}
        </h3>
        <p className="mt-2 text-sm text-neutral-600">{description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {cardNumbers.map((n) => (
            <span
              key={n}
              className="rounded-md bg-blue-50 px-2.5 py-1 text-sm font-semibold text-blue-700"
            >
              #{n}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between rounded-lg bg-neutral-50 p-4">
          <span className="text-sm text-neutral-600">
            {cardNumbers.length} × {formatCOP(unitPrice)}
          </span>
          <span className="text-xl font-bold text-neutral-900">
            {formatCOP(total)}
          </span>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-md border border-neutral-300 px-5 py-2.5 font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-md bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Enviando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
