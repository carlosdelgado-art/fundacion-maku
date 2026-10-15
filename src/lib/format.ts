/** Formatea un numero como pesos colombianos, ej: 1234567 -> "$1.234.567" */
export function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}
