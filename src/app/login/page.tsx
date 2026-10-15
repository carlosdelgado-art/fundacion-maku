"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login } from "./actions";

type State = { error?: string } | null;

async function action(_prevState: State, formData: FormData) {
  const result = await login(formData);
  return result ?? null;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "";
  const [state, formAction, pending] = useActionState<State, FormData>(
    action,
    null
  );

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <Link href="/" className="text-sm text-emerald-700 hover:underline">
          ← Volver al inicio
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">
          Acceso del equipo
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Inicia sesión con la cuenta creada por el administrador.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              Correo
            </span>
            <input name="email" type="email" required className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              Contraseña
            </span>
            <input
              name="password"
              type="password"
              required
              className="input"
            />
          </label>

          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {pending ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </main>
  );
}
