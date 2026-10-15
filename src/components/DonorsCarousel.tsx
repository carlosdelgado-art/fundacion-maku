"use client";

import { useEffect, useState } from "react";
import { formatCOP } from "@/lib/format";
import type { PublicDonation } from "@/lib/types";
import { ChevronLeftIcon, ChevronRightIcon, QuoteIcon } from "./icons";

const AUTOPLAY_MS = 6000;

export function DonorsCarousel({ donations }: { donations: PublicDonation[] }) {
  const [index, setIndex] = useState(0);
  const total = donations.length;

  useEffect(() => {
    if (total <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [total]);

  if (total === 0) return null;

  const current = donations[index];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-blue-50/50 p-8 text-center">
        <QuoteIcon className="mx-auto h-8 w-8 text-blue-300" />
        <p className="mt-4 text-lg font-medium italic text-neutral-800">
          “{current.message}”
        </p>
        <p className="mt-4 font-semibold text-blue-700">
          {current.donor_name}
        </p>
        <p className="text-sm text-neutral-500">
          Donó {formatCOP(Number(current.amount))} ·{" "}
          {new Date(current.created_at).toLocaleDateString("es-CO", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Mensaje anterior"
              onClick={() => setIndex((i) => (i - 1 + total) % total)}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-500 shadow hover:text-blue-700"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Siguiente mensaje"
              onClick={() => setIndex((i) => (i + 1) % total)}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-500 shadow hover:text-blue-700"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {donations.map((d, i) => (
            <button
              key={d.id}
              type="button"
              aria-label={`Ir al mensaje ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-blue-600" : "w-2 bg-blue-200"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
