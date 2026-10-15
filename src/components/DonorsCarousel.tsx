"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCOP } from "@/lib/format";
import type { PublicDonation } from "@/lib/types";
import { ChevronLeftIcon, ChevronRightIcon, QuoteIcon } from "./icons";

const AUTOPLAY_MS = 7000;
const PER_PAGE = 3;

export function DonorsCarousel({ donations }: { donations: PublicDonation[] }) {
  const pages = useMemo(() => {
    const chunks: PublicDonation[][] = [];
    for (let i = 0; i < donations.length; i += PER_PAGE) {
      chunks.push(donations.slice(i, i + PER_PAGE));
    }
    return chunks;
  }, [donations]);

  const [page, setPage] = useState(0);
  const pageCount = pages.length;

  useEffect(() => {
    if (pageCount <= 1) return;
    const id = setInterval(() => {
      setPage((p) => (p + 1) % pageCount);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [pageCount]);

  if (pageCount === 0) return null;

  const current = pages[page];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="relative">
        {pageCount > 1 && (
          <button
            type="button"
            aria-label="Mensajes anteriores"
            onClick={() => setPage((p) => (p - 1 + pageCount) % pageCount)}
            className="absolute -left-4 top-1/2 z-10 hidden h-9 w-9 -translate-x-full -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-500 shadow hover:text-blue-700 sm:flex"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
        )}

        <div className="flex flex-wrap justify-center gap-6">
          {current.map((d) => (
            <div
              key={d.id}
              className="flex w-full flex-col rounded-2xl border border-neutral-200 bg-blue-50/50 p-6 text-center sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
            >
              <QuoteIcon className="mx-auto h-6 w-6 text-blue-300" />
              <p className="mt-3 flex-1 text-sm font-medium italic text-neutral-800">
                “{d.message}”
              </p>
              <p className="mt-4 font-semibold text-blue-700">
                {d.donor_name}
              </p>
              <p className="text-xs text-neutral-500">
                Donó {formatCOP(Number(d.amount))} ·{" "}
                {new Date(d.created_at).toLocaleDateString("es-CO", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>

        {pageCount > 1 && (
          <button
            type="button"
            aria-label="Mensajes siguientes"
            onClick={() => setPage((p) => (p + 1) % pageCount)}
            className="absolute -right-4 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 translate-x-full items-center justify-center rounded-full bg-white text-neutral-500 shadow hover:text-blue-700 sm:flex"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {pageCount > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            aria-label="Mensajes anteriores"
            onClick={() => setPage((p) => (p - 1 + pageCount) % pageCount)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-500 shadow hover:text-blue-700 sm:hidden"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>

          <div className="flex gap-2">
            {pages.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ir a la página ${i + 1}`}
                onClick={() => setPage(i)}
                className={`h-2 rounded-full transition-all ${
                  i === page ? "w-6 bg-blue-600" : "w-2 bg-blue-200"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Mensajes siguientes"
            onClick={() => setPage((p) => (p + 1) % pageCount)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-500 shadow hover:text-blue-700 sm:hidden"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
