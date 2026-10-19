"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { TOTAL_CARDS } from "@/lib/constants";

export function PrintRangeForm() {
  const router = useRouter();
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(38);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push(`/admin/cartones/imprimir?start=${start}&end=${end}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 bg-white p-4"
    >
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-neutral-700">
          Desde #
        </span>
        <input
          type="number"
          min={1}
          max={TOTAL_CARDS}
          value={start}
          onChange={(e) => setStart(Number(e.target.value))}
          className="input w-24"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-neutral-700">
          Hasta #
        </span>
        <input
          type="number"
          min={1}
          max={TOTAL_CARDS}
          value={end}
          onChange={(e) => setEnd(Number(e.target.value))}
          className="input w-24"
        />
      </label>
      <button
        type="submit"
        className="rounded-md bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
      >
        Ver e imprimir este rango
      </button>
    </form>
  );
}
