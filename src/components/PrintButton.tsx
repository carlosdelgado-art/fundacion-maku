"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-md bg-blue-600 px-6 py-2.5 font-semibold text-white hover:bg-blue-700"
    >
      Imprimir / Guardar como PDF
    </button>
  );
}
