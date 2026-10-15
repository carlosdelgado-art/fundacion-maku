/**
 * Genera los numeros de un carton de bingo clasico (75 bolas: columnas B-I-N-G-O)
 * de forma DETERMINISTICA a partir del numero del carton (1-300). Esto significa
 * que el carton #57 siempre mostrara los mismos numeros cada vez que se abra,
 * sin necesidad de guardar nada en la base de datos.
 */

export type BingoColumns = {
  B: number[];
  I: number[];
  N: (number | "FREE")[];
  G: number[];
  O: number[];
};

const RANGES: Record<"B" | "I" | "N" | "G" | "O", [number, number]> = {
  B: [1, 15],
  I: [16, 30],
  N: [31, 45],
  G: [46, 60],
  O: [61, 75],
};

// PRNG simple y determinista (mulberry32), suficiente para generar numeros
// pseudo-aleatorios reproducibles a partir de una semilla entera.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickFive(min: number, max: number, rng: () => number): number[] {
  const pool: number[] = [];
  for (let n = min; n <= max; n++) pool.push(n);

  // Fisher-Yates parcial: solo necesitamos 5 valores
  for (let i = pool.length - 1; i > pool.length - 6; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(-5);
}

export function generateBingoCard(cardNumber: number): BingoColumns {
  const rng = mulberry32(cardNumber * 2654435761);

  const columns = {
    B: pickFive(...RANGES.B, rng),
    I: pickFive(...RANGES.I, rng),
    N: pickFive(...RANGES.N, rng) as (number | "FREE")[],
    G: pickFive(...RANGES.G, rng),
    O: pickFive(...RANGES.O, rng),
  };

  // El centro de la columna N es casilla libre, como en el bingo tradicional
  columns.N[2] = "FREE";

  return columns;
}
