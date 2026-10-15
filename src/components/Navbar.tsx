import Link from "next/link";
import Image from "next/image";

export function Navbar({
  teamName,
  foundationName,
  logoUrl,
}: {
  teamName: string;
  foundationName: string;
  logoUrl: string;
}) {
  return (
    <header className="border-b border-black/10 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={teamName}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {teamName.slice(0, 1)}
            </div>
          )}
          <div className="leading-tight">
            <p className="font-bold text-neutral-900">{teamName}</p>
            <p className="text-xs text-neutral-500">{foundationName}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-700 md:flex">
          <Link href="/" className="hover:text-blue-700">
            Inicio
          </Link>
          <Link href="/donar" className="hover:text-blue-700">
            Donar
          </Link>
          <Link href="/bingo-solidario" className="hover:text-blue-700">
            Bingo Solidario
          </Link>
          <Link href="/login" className="hover:text-blue-700">
            Equipo
          </Link>
        </nav>
      </div>
    </header>
  );
}
