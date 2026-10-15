"use client";

import { useEffect, useState } from "react";

function getTimeLeft(targetIso: string) {
  const diff = new Date(targetIso).getTime() - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

type TimeLeft = ReturnType<typeof getTimeLeft>;

export function Countdown({ targetDate }: { targetDate: string }) {
  // "undefined" = todavia no se calculo (recien montado, antes del primer
  // tick), "null" = la fecha ya paso, objeto = cuenta regresiva activa. Asi
  // el servidor y el primer render del cliente coinciden (ambos "undefined")
  // y evitamos un desfase de hidratacion con el reloj real del navegador.
  const [timeLeft, setTimeLeft] = useState<TimeLeft | undefined>(undefined);

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft(targetDate));
    // El primer tick se dispara async (setTimeout 0) para no llamar setState
    // de forma sincrona en el cuerpo del efecto.
    const firstTick = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(firstTick);
      clearInterval(id);
    };
  }, [targetDate]);

  if (timeLeft === null) {
    return (
      <p className="text-lg font-semibold text-blue-700">
        🎉 ¡Hoy es el gran día del Bingo Solidario!
      </p>
    );
  }

  const units: { label: string; value: number }[] = [
    { label: "Días", value: timeLeft?.days ?? 0 },
    { label: "Horas", value: timeLeft?.hours ?? 0 },
    { label: "Minutos", value: timeLeft?.minutes ?? 0 },
    { label: "Segundos", value: timeLeft?.seconds ?? 0 },
  ];

  return (
    <div className="flex justify-center gap-3 sm:gap-4">
      {units.map((u) => (
        <div
          key={u.label}
          className="flex w-16 flex-col items-center rounded-xl bg-white/90 py-3 text-blue-700 shadow-sm sm:w-20"
        >
          <span className="text-2xl font-bold sm:text-3xl">
            {String(u.value).padStart(2, "0")}
          </span>
          <span className="text-[11px] font-medium uppercase text-neutral-500">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
